// Platform routes - Platform metadata and configuration
import { Router } from 'express'
import { PlatformController, UserPreferencesController } from '../controllers/platformController.js'

const router = Router()

// Get all platforms metadata
router.get('/', PlatformController.getPlatforms)

// Get specific platform metadata and field configuration
router.get('/:platformId', PlatformController.getPlatform)

// Get platform settings configuration
router.get('/:platformId/settings', PlatformController.getPlatformSettings)

// Update platform settings
router.put('/:platformId/settings', PlatformController.updatePlatformSettings)

// Get platforms that support specific capability
router.get('/capability/:capability', PlatformController.getPlatformsByCapability)

// User preferences
router.get('/preferences', UserPreferencesController.getPreferences)
router.post('/preferences', UserPreferencesController.savePreferences)
router.patch('/preferences', UserPreferencesController.updatePreferences)

export default router
