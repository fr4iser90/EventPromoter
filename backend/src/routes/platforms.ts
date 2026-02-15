// ✅ GENERIC: Platform routes - Platform metadata and configuration
// NO platform-specific routes here! All platform-specific routes belong in platforms/{platform}/routes.ts
import { Router, Request, Response } from 'express'
import { readdir, access } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PlatformController, UserPreferencesController } from '../controllers/platformController.js'
import { TargetController } from '../controllers/targetController.js'
import { SchemaController } from '../controllers/schemaController.js'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ENFORCE_PLATFORM_ROUTE_GUARD = process.env.ENFORCE_PLATFORM_ROUTE_GUARD !== 'false'

// ⚠️ IMPORTANT: Specific routes must be defined BEFORE parameterized routes
// Otherwise Express will match /preferences as /:platformId with platformId='preferences'

// Get all platforms metadata
router.get('/', PlatformController.getPlatforms)

// Get platforms that support specific capability
router.get('/capability/:capability', PlatformController.getPlatformsByCapability)

// Get configured publishing mode
router.get('/publishing-mode', PlatformController.getConfiguredMode)

// User preferences (must be before /:platformId routes)
router.get('/preferences', UserPreferencesController.getPreferences)
router.post('/preferences', UserPreferencesController.savePreferences)
router.patch('/preferences', UserPreferencesController.updatePreferences)

// Get specific platform metadata and field configuration
router.get('/:platformId', PlatformController.getPlatform)

// Get available publishing modes for a platform
router.get('/:platformId/available-modes', PlatformController.getAvailableModes)

// Get platform schema

// Get available languages for platform
router.get('/:platformId/i18n', PlatformController.getPlatformLanguages)

// Get platform settings configuration
router.get('/:platformId/settings', PlatformController.getPlatformSettings)

// Get platform schema
router.get('/:platformId/schema', SchemaController.getPlatformSchema)

// Update platform settings
router.put('/:platformId/settings', PlatformController.updatePlatformSettings)

// Render preview HTML (schema-driven, backend renders everything)
router.post('/:platformId/preview', PlatformController.renderPreview)

// Render multi-preview HTML (generic - any platform can implement)
router.post('/:platformId/multi-preview', PlatformController.renderMultiPreview)

// Get specific form schemas for edit modals (e.g., recipient edit schema)
router.get('/:platformId/schemas/:schemaId', SchemaController.getSchema)

// ✅ GENERIC: Target management routes (work for all platforms)
// These routes must be defined BEFORE the dynamic platform routes to avoid conflicts
router.get('/:platformId/targets', TargetController.getTargets)
router.post('/:platformId/targets', TargetController.addTarget)
router.get('/:platformId/targets/:targetId', TargetController.getTarget)
router.put('/:platformId/targets/:targetId', TargetController.updateTarget)
router.delete('/:platformId/targets/:targetId', TargetController.deleteTarget)

// Group routes
router.get('/:platformId/target-groups', TargetController.getGroups)
router.get('/:platformId/target-groups/:groupId', TargetController.getGroup)
router.post('/:platformId/target-groups', TargetController.createGroup)
router.put('/:platformId/target-groups/:groupId', TargetController.updateGroup)
router.delete('/:platformId/target-groups/:groupId', TargetController.deleteGroup)

// Import/Export routes
router.post('/:platformId/target-groups/import', TargetController.importGroups)
router.get('/:platformId/target-groups/export', TargetController.exportGroups)

// ✅ GENERIC: Dynamically load platform-specific routes
// Scans platforms/ directory and loads routes.ts from each platform
async function loadPlatformRoutes() {
  try {
    const platformsPath = join(__dirname, '../platforms')
    const fileExists = async (absolutePath: string): Promise<boolean> => {
      try {
        await access(absolutePath)
        return true
      } catch {
        return false
      }
    }
    
    const platformDirs = await readdir(platformsPath, { withFileTypes: true })
    const loadedPlatforms: string[] = []
    
    for (const dirent of platformDirs) {
      if (dirent.isDirectory() && !dirent.name.startsWith('_')) {
        const platformId = dirent.name
        const platformPath = join(platformsPath, platformId)
        const hasRoutesEntrypoint =
          (await fileExists(join(platformPath, 'routes.js'))) ||
          (await fileExists(join(platformPath, 'routes.ts')))
        const hasPlatformLocalController =
          (await fileExists(join(platformPath, 'controller.js'))) ||
          (await fileExists(join(platformPath, 'controller.ts'))) ||
          (await fileExists(join(platformPath, 'api/routes.js'))) ||
          (await fileExists(join(platformPath, 'api/routes.ts')))

        // Hard architecture guard:
        // If a platform defines local controller-style endpoints, it must expose routes.ts/js.
        if (hasPlatformLocalController && !hasRoutesEntrypoint) {
          const message = `Platform ${platformId} has local API controllers/routes but no routes.ts entrypoint`
          if (ENFORCE_PLATFORM_ROUTE_GUARD) {
            throw new Error(message)
          }
          console.warn('Platform validation warning', { message })
          continue
        }
        
        try {
          // Try to import platform routes
          const routesModule = await import(`../platforms/${platformId}/routes.js`)
          if (routesModule.default) {
            router.use(`/${platformId}`, routesModule.default)
            loadedPlatforms.push(platformId)
          } else if (hasRoutesEntrypoint && ENFORCE_PLATFORM_ROUTE_GUARD) {
            throw new Error(`Platform ${platformId} routes entrypoint has no default export`)
          }
        } catch (error: any) {
          const moduleNotFound = error?.message?.includes('Cannot find module')
          // Platform without routes entrypoint is fine when no local controller endpoints exist.
          if (!moduleNotFound || hasRoutesEntrypoint) {
            if (ENFORCE_PLATFORM_ROUTE_GUARD) {
              throw error
            }
            console.info('Failed to load routes for platform', { platformId, error: error.message })
          }
        }
      }
    }
    
    if (loadedPlatforms.length > 0) {
      console.debug('Loaded routes for platforms', { count: loadedPlatforms.length, platforms: loadedPlatforms })
    }
  } catch (error) {
    console.error('Failed to load platform routes:', error)
  }
}

// Load platform routes asynchronously (don't block route registration)
loadPlatformRoutes().catch(console.error)

export default router
