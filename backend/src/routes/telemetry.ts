/**
 * Telemetry Routes
 * 
 * Routes for platform telemetry/statistics
 * 
 * @module routes/telemetry
 */

import { Router } from 'express'
import { HistoryController } from '../controllers/historyController.js'

const router = Router()

// Get platform-specific telemetry
router.get('/:platform/stats/:postId', HistoryController.getPlatformTelemetry)

export default router
