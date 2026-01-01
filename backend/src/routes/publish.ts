import { Router } from 'express'
import { PublishController } from '../controllers/publishController.js'

const router = Router()

// Get publish session results
router.get('/results/:eventId/:sessionId', PublishController.getPublishResults)

// Get publish history for event
router.get('/history/:eventId', PublishController.getEventPublishHistory)

// Get latest publish results for event
router.get('/latest/:eventId', PublishController.getLatestPublishResults)

export default router
