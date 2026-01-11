// ✅ GENERIC: Platform routes - Platform metadata and configuration
// NO platform-specific routes here! All platform-specific routes belong in platforms/{platform}/routes.ts
import { Router } from 'express'
import { readdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PlatformController, UserPreferencesController } from '../controllers/platformController.js'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ⚠️ IMPORTANT: Specific routes must be defined BEFORE parameterized routes
// Otherwise Express will match /preferences as /:platformId with platformId='preferences'

// Get all platforms metadata
router.get('/', PlatformController.getPlatforms)

// Get platforms that support specific capability
router.get('/capability/:capability', PlatformController.getPlatformsByCapability)

// User preferences (must be before /:platformId routes)
router.get('/preferences', UserPreferencesController.getPreferences)
router.post('/preferences', UserPreferencesController.savePreferences)
router.patch('/preferences', UserPreferencesController.updatePreferences)

// Get specific platform metadata and field configuration
router.get('/:platformId', PlatformController.getPlatform)

// Get platform schema
router.get('/:platformId/schema', PlatformController.getPlatformSchema)

// Get platform translations
router.get('/:platformId/i18n/:lang', PlatformController.getPlatformTranslations)

// Get available languages for platform
router.get('/:platformId/i18n', PlatformController.getPlatformLanguages)

// Get platform settings configuration
router.get('/:platformId/settings', PlatformController.getPlatformSettings)

// Update platform settings
router.put('/:platformId/settings', PlatformController.updatePlatformSettings)

// Render preview HTML (schema-driven, backend renders everything)
router.post('/:platformId/preview', PlatformController.renderPreview)

// ✅ GENERIC: Dynamically load platform-specific routes
// Scans platforms/ directory and loads routes.ts from each platform
async function loadPlatformRoutes() {
  try {
    const platformsPath = join(__dirname, '../platforms')
    
    const platformDirs = await readdir(platformsPath, { withFileTypes: true })
    
    for (const dirent of platformDirs) {
      if (dirent.isDirectory() && !dirent.name.startsWith('_')) {
        const platformId = dirent.name
        const routesPath = join(platformsPath, platformId, 'routes.ts')
        
        try {
          // Try to import platform routes
          const routesModule = await import(`../platforms/${platformId}/routes.js`)
          if (routesModule.default) {
            router.use(`/${platformId}`, routesModule.default)
            console.log(`✅ Loaded routes for platform: ${platformId}`)
          }
        } catch (error: any) {
          // Platform doesn't have routes.ts - that's OK, not all platforms need custom routes
          if (!error.message.includes('Cannot find module')) {
            console.warn(`⚠️  Failed to load routes for ${platformId}:`, error.message)
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to load platform routes:', error)
  }
}

// Load platform routes asynchronously (don't block route registration)
loadPlatformRoutes().catch(console.error)

export default router
