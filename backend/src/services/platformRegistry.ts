/**
 * Platform Registry Service
 * 
 * Central registry for managing discovered platform modules.
 * Handles platform discovery, registration, caching, and retrieval.
 * 
 * @module services/platformRegistry
 */

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PlatformModule, PlatformMetadata, PlatformCapabilities } from '../types/platformModule.js'
import { PlatformSchema } from '../types/platformSchema.js'
import { discoverPlatforms, discoverPlatform, scanPlatformDirectories, DiscoveryConfig } from '../utils/platformDiscovery.js'
import { validatePlatformSchema } from '../utils/schemaValidator.js'
import { PlatformValidationError, PlatformDiscoveryError } from '../types/validationErrors.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Platform registry class
 */
export class PlatformRegistry {
  private platforms: Map<string, PlatformModule> = new Map()
  private initialized: boolean = false
  private discoveryConfig: DiscoveryConfig

  constructor(config: Partial<DiscoveryConfig> = {}) {
    // In production (Docker), __dirname is dist/services/, so platforms should be at dist/platforms
    const defaultPath = config.platformsPath || join(__dirname, '../platforms')
    console.log(`📂 Platform registry using path: ${defaultPath}`)
    this.discoveryConfig = {
      platformsPath: defaultPath,
      validateSchemas: config.validateSchemas !== false,
      throwOnError: config.throwOnError || false,
      entryPointExtensions: config.entryPointExtensions || ['index.ts', 'index.js']
    }
  }

  /**
   * Discover and register all platforms
   */
  async discoverPlatforms(): Promise<void> {
    try {
      console.log(`🔍 Discovering platforms from: ${this.discoveryConfig.platformsPath}`)
      const discoveredPlatforms = await discoverPlatforms(this.discoveryConfig)
      console.log(`✅ Discovered ${discoveredPlatforms.size} platforms`)

      // Register all discovered platforms
      for (const [id, platform] of discoveredPlatforms.entries()) {
        await this.register(platform)
        console.log(`✅ Registered platform: ${id}`)
      }

      this.initialized = true
      console.log(`✅ Platform registry initialized with ${this.platforms.size} platforms`)
    } catch (error) {
      console.error('❌ Platform discovery failed:', error)
      throw new PlatformDiscoveryError(
        `Failed to discover platforms: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.discoveryConfig.platformsPath,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Register a platform module
   */
  async register(platform: PlatformModule): Promise<void> {
    // Validate platform
    this.validatePlatform(platform)

    // Validate schema if present
    if (platform.schema) {
      try {
        validatePlatformSchema(platform.schema)
      } catch (error) {
        throw new PlatformValidationError(
          `Platform ${platform.metadata.id} has invalid schema: ${error instanceof Error ? error.message : 'Unknown error'}`,
          platform.metadata.id,
          error instanceof Error && 'errors' in error ? (error as any).errors : undefined
        )
      }
    }

    // Register platform
    this.platforms.set(platform.metadata.id, platform)
  }

  /**
   * Get platform by ID
   */
  getPlatform(id: string): PlatformModule | undefined {
    return this.platforms.get(id)
  }

  /**
   * Get all platforms
   */
  getAllPlatforms(): PlatformModule[] {
    return Array.from(this.platforms.values())
  }

  /**
   * Get platforms by category
   */
  getPlatformsByCategory(category: string): PlatformModule[] {
    return this.getAllPlatforms().filter(
      platform => platform.metadata.category === category
    )
  }

  /**
   * Get platform metadata
   */
  getPlatformMetadata(id: string): PlatformMetadata | undefined {
    const platform = this.getPlatform(id)
    return platform?.metadata
  }

  /**
   * Get platform schema
   */
  getPlatformSchema(id: string): PlatformSchema | undefined {
    const platform = this.getPlatform(id)
    return platform?.schema
  }

  /**
   * Get platform capabilities
   */
  getPlatformCapabilities(id: string): PlatformCapabilities | undefined {
    const platform = this.getPlatform(id)
    return platform?.capabilities
  }

  /**
   * Check if platform exists
   */
  hasPlatform(id: string): boolean {
    return this.platforms.has(id)
  }

  /**
   * Get all platform IDs
   */
  getPlatformIds(): string[] {
    return Array.from(this.platforms.keys())
  }

  /**
   * Get platform count
   */
  getPlatformCount(): number {
    return this.platforms.size
  }

  /**
   * Validate platform module
   */
  validatePlatform(platform: PlatformModule): void {
    const errors: Array<{ field: string; message: string }> = []

    // Validate metadata
    if (!platform.metadata) {
      errors.push({ field: 'metadata', message: 'Platform metadata is required' })
    } else {
      if (!platform.metadata.id || typeof platform.metadata.id !== 'string') {
        errors.push({ field: 'metadata.id', message: 'Platform ID is required and must be a string' })
      }
      if (!platform.metadata.displayName || typeof platform.metadata.displayName !== 'string') {
        errors.push({ field: 'metadata.displayName', message: 'Display name is required and must be a string' })
      }
      if (!platform.metadata.version || typeof platform.metadata.version !== 'string') {
        errors.push({ field: 'metadata.version', message: 'Version is required and must be a string' })
      }
    }

    // Validate schema
    if (!platform.schema) {
      errors.push({ field: 'schema', message: 'Platform schema is required' })
    }

    // Validate capabilities
    if (!platform.capabilities) {
      errors.push({ field: 'capabilities', message: 'Platform capabilities are required' })
    }

    // Validate service
    if (!platform.service) {
      errors.push({ field: 'service', message: 'Platform service is required' })
    }

    // Validate parser
    if (!platform.parser) {
      errors.push({ field: 'parser', message: 'Platform parser is required' })
    }

    // Validate validator
    if (!platform.validator) {
      errors.push({ field: 'validator', message: 'Platform validator is required' })
    }

    if (errors.length > 0) {
      throw new PlatformValidationError(
        `Platform validation failed: ${errors.map(e => e.message).join('; ')}`,
        platform.metadata?.id,
        errors
      )
    }
  }

  /**
   * Check if registry is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Clear all registered platforms
   */
  clear(): void {
    this.platforms.clear()
    this.initialized = false
  }

  /**
   * Reload platforms (useful for dev mode)
   */
  async reload(): Promise<void> {
    this.clear()
    await this.discoverPlatforms()
  }

  /**
   * Get platform service instance
   */
  getPlatformService(id: string): any {
    const platform = this.getPlatform(id)
    if (!platform) {
      throw new Error(`Platform ${id} not found`)
    }
    return platform.service
  }

  /**
   * Get platform parser
   */
  getPlatformParser(id: string): any {
    const platform = this.getPlatform(id)
    if (!platform) {
      throw new Error(`Platform ${id} not found`)
    }
    return platform.parser
  }

  /**
   * Get platform validator
   */
  getPlatformValidator(id: string): any {
    const platform = this.getPlatform(id)
    if (!platform) {
      throw new Error(`Platform ${id} not found`)
    }
    return platform.validator
  }
}

/**
 * Singleton instance of PlatformRegistry
 */
let registryInstance: PlatformRegistry | null = null

/**
 * Get or create the singleton PlatformRegistry instance
 */
export function getPlatformRegistry(config?: Partial<DiscoveryConfig>): PlatformRegistry {
  if (!registryInstance) {
    registryInstance = new PlatformRegistry(config)
  }
  return registryInstance
}

/**
 * Initialize the platform registry
 */
export async function initializePlatformRegistry(config?: Partial<DiscoveryConfig>): Promise<PlatformRegistry> {
  const registry = getPlatformRegistry(config)
  if (!registry.isInitialized()) {
    await registry.discoverPlatforms()
  }
  return registry
}

