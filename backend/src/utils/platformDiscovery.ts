/**
 * Platform Discovery Utilities
 * 
 * Runtime discovery of platform modules from the file system.
 * 
 * @module utils/platformDiscovery
 */

import { readdir, stat, access } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PlatformModule, isPlatformModule, PlatformManifest } from '../types/platformModule.js'
import { PlatformDiscoveryError } from '../types/validationErrors.js'
import { validatePlatformSchema } from './schemaValidator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Platform discovery configuration
 */
export interface DiscoveryConfig {
  /** Platform directory path */
  platformsPath: string
  /** Whether to validate schemas during discovery */
  validateSchemas?: boolean
  /** Whether to throw errors on invalid platforms */
  throwOnError?: boolean
  /** File extensions to check for platform entry points */
  entryPointExtensions?: string[]
}

/**
 * Default discovery configuration
 */
const DEFAULT_CONFIG: DiscoveryConfig = {
  platformsPath: join(__dirname, '../platforms'),
  validateSchemas: true,
  throwOnError: false,
  entryPointExtensions: ['index.ts', 'index.js']
}

/**
 * Check if a directory is a valid platform directory
 */
async function isValidPlatformDirectory(dirPath: string): Promise<boolean> {
  try {
    const stats = await stat(dirPath)
    if (!stats.isDirectory()) {
      console.log(`    ❌ ${dirPath} is not a directory`)
      return false
    }

    // Check for index.ts or index.js (try .js first for production)
    const indexFiles = ['index.js', 'index.ts']
    for (const indexFile of indexFiles) {
      try {
        const indexPath = join(dirPath, indexFile)
        await access(indexPath)
        console.log(`    ✅ Found ${indexFile} in ${dirPath}`)
        return true
      } catch {
        // Continue checking other files
      }
    }

    console.log(`    ❌ No index.js or index.ts found in ${dirPath}`)
    return false
  } catch (error: any) {
    console.log(`    ❌ Error checking ${dirPath}: ${error.message}`)
    return false
  }
}

/**
 * Load platform module from directory
 */
async function loadPlatformModule(
  platformPath: string,
  platformName: string,
  config: DiscoveryConfig
): Promise<PlatformModule | null> {
  try {
    console.log(`📦 Loading platform module: ${platformName} from ${platformPath}`)
    // Try to import the platform module
    // In production (Docker), files are compiled to .js, so try .js first
    let module
    try {
      const modulePath = join(platformPath, 'index.js')
      console.log(`  Trying to import: ${modulePath}`)
      module = await import(modulePath)
      console.log(`  ✅ Successfully imported index.js`)
    } catch (jsError: any) {
      console.log(`  ❌ Failed to import index.js: ${jsError.message}`)
      // Fallback to .ts for development
      const modulePath = join(platformPath, 'index.ts')
      console.log(`  Trying to import: ${modulePath}`)
      module = await import(modulePath)
      console.log(`  ✅ Successfully imported index.ts`)
    }

    // Get the platform module (support both default and named exports)
    let platformModule: any = module.default || module[platformName] || module.PlatformModule
    console.log(`  Found module export: ${platformModule ? 'yes' : 'no'}`)
    if (platformModule) {
      console.log(`  Module has metadata: ${platformModule.metadata ? 'yes' : 'no'}`)
    }

    // If it's a PlatformPlugin, we need to convert it
    // This will be handled by the registry during migration
    if (!isPlatformModule(platformModule)) {
      console.log(`  ❌ Platform ${platformName} is not a valid PlatformModule`)
      // Check if it's a PlatformPlugin (legacy)
      if (platformModule && platformModule.name && platformModule.parser) {
        console.log(`  ⚠️  Platform ${platformName} is using legacy PlatformPlugin interface`)
        // Legacy platform - will need schema and conversion
        // Return null for now, will be handled during migration
        if (config.throwOnError) {
          throw new PlatformDiscoveryError(
            `Platform ${platformName} is using legacy PlatformPlugin interface. Migration required.`,
            platformPath
          )
        }
        return null
      }

      // Invalid platform module
      console.log(`  ❌ Platform ${platformName} does not export a valid PlatformModule`)
      if (config.throwOnError) {
        throw new PlatformDiscoveryError(
          `Platform ${platformName} does not export a valid PlatformModule`,
          platformPath
        )
      }
      return null
    }
    
    console.log(`  ✅ Platform ${platformName} is a valid PlatformModule`)

    // Validate schema if enabled
    if (config.validateSchemas && platformModule.schema) {
      try {
        validatePlatformSchema(platformModule.schema)
        console.log(`  ✅ Platform ${platformName} schema is valid`)
      } catch (error) {
        console.log(`  ❌ Platform ${platformName} has invalid schema:`, error)
        if (config.throwOnError) {
          throw new PlatformDiscoveryError(
            `Platform ${platformName} has invalid schema: ${error instanceof Error ? error.message : 'Unknown error'}`,
            platformPath,
            error instanceof Error ? error : undefined
          )
        }
        return null
      }
    }

    console.log(`  ✅ Successfully loaded platform: ${platformName} (${platformModule.metadata.id})`)
    return platformModule
  } catch (error) {
    console.error(`  ❌ Error loading platform ${platformName}:`, error)
    if (config.throwOnError) {
      throw new PlatformDiscoveryError(
        `Failed to load platform ${platformName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        platformPath,
        error instanceof Error ? error : undefined
      )
    }
    return null
  }
}

/**
 * Scan platform directory for available platforms
 */
export async function scanPlatformDirectories(
  platformsPath: string = DEFAULT_CONFIG.platformsPath
): Promise<string[]> {
  try {
    console.log(`📂 Scanning platform directory: ${platformsPath}`)
    const entries = await readdir(platformsPath, { withFileTypes: true })
    console.log(`📋 Found ${entries.length} entries in platforms directory`)
    const platformDirs: string[] = []

    for (const entry of entries) {
      // Skip directories starting with _ (e.g., _blueprint, _templates)
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        const dirPath = join(platformsPath, entry.name)
        console.log(`🔍 Checking platform directory: ${entry.name}`)
        const isValid = await isValidPlatformDirectory(dirPath)
        console.log(`  ${isValid ? '✅' : '❌'} ${entry.name} is ${isValid ? 'valid' : 'invalid'}`)
        if (isValid) {
          platformDirs.push(entry.name)
        }
      }
    }

    console.log(`✅ Found ${platformDirs.length} valid platform directories: ${platformDirs.join(', ')}`)
    return platformDirs.sort()
  } catch (error) {
    console.error(`❌ Failed to scan platform directory ${platformsPath}:`, error)
    throw new PlatformDiscoveryError(
      `Failed to scan platform directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      platformsPath,
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Discover and load all platform modules
 */
export async function discoverPlatforms(
  config: Partial<DiscoveryConfig> = {}
): Promise<Map<string, PlatformModule>> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const platforms = new Map<string, PlatformModule>()

  try {
    // Scan for platform directories
    const platformDirs = await scanPlatformDirectories(finalConfig.platformsPath)
    console.log(`📋 Platform directories found: ${platformDirs.length}`)

    // Load each platform
    for (const platformName of platformDirs) {
      const platformPath = join(finalConfig.platformsPath, platformName)
      try {
        console.log(`🔄 Loading platform: ${platformName}`)
        const platformModule = await loadPlatformModule(
          platformPath,
          platformName,
          finalConfig
        )

        if (platformModule) {
          platforms.set(platformModule.metadata.id, platformModule)
          console.log(`✅ Successfully loaded and registered platform: ${platformName}`)
        } else {
          console.log(`⚠️  Platform ${platformName} loaded but module is null`)
        }
      } catch (error) {
        // Log error but continue with other platforms
        console.error(`❌ Failed to load platform ${platformName}:`, error)
        if (finalConfig.throwOnError) {
          throw error
        }
      }
    }

    console.log(`✅ Total platforms loaded: ${platforms.size}`)
    return platforms
  } catch (error) {
    console.error(`❌ Platform discovery failed:`, error)
    throw new PlatformDiscoveryError(
      `Platform discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      finalConfig.platformsPath,
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Discover a single platform by name
 */
export async function discoverPlatform(
  platformName: string,
  config: Partial<DiscoveryConfig> = {}
): Promise<PlatformModule | null> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const platformPath = join(finalConfig.platformsPath, platformName)

  try {
    const isValid = await isValidPlatformDirectory(platformPath)
    if (!isValid) {
      return null
    }

    return await loadPlatformModule(platformPath, platformName, finalConfig)
  } catch (error) {
    if (finalConfig.throwOnError) {
      throw new PlatformDiscoveryError(
        `Failed to discover platform ${platformName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        platformPath,
        error instanceof Error ? error : undefined
      )
    }
    return null
  }
}

/**
 * Validate platform module structure
 */
export function validatePlatformModule(platform: any): platform is PlatformModule {
  return isPlatformModule(platform)
}

/**
 * Get platform manifest (if available)
 */
export async function getPlatformManifest(
  platformPath: string
): Promise<PlatformManifest | null> {
  try {
    const manifestPath = join(platformPath, 'manifest.json')
    await access(manifestPath)
    
    const manifestModule = await import(manifestPath)
    const manifest = manifestModule.default || manifestModule

    if (manifest && manifest.metadata && manifest.metadata.id) {
      return manifest as PlatformManifest
    }

    return null
  } catch {
    return null
  }
}

