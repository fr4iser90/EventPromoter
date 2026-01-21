/**
 * Helper Routes
 * 
 * API routes for helper content.
 * 
 * @module routes/helpers
 */

import { Router } from 'express'
import { HelperController } from '../controllers/helperController.js'

const router = Router()

// GET /api/helpers - Get all helpers for a platform
router.get('/', HelperController.getHelpers)

// GET /api/helpers/:helperId - Get specific helper
router.get('/:helperId', HelperController.getHelper)

export default router
