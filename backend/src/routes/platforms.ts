// Platform routes - Platform metadata and configuration
import { Router } from 'express'
import { PlatformController } from '../controllers/platformController.js'

const router = Router()

// Get all platforms metadata
router.get('/', PlatformController.getPlatforms)

// Get specific platform metadata and field configuration
router.get('/:platformId', PlatformController.getPlatform)

// Get platforms that support specific capability
router.get('/capability/:capability', PlatformController.getPlatformsByCapability)

export default router
