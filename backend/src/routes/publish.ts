import { Router } from 'express'
import { PublishController } from '../controllers/publishController.js'

const router = Router()

// SSE stream for real-time publisher feedback
router.get('/stream/:sessionId', PublishController.streamEvents)

// Get publish session results
router.get('/results/:eventId/:sessionId', PublishController.getPublishResults)

// Get publish history for event
router.get('/history/:eventId', PublishController.getEventPublishHistory)

// Get latest publish results for event
router.get('/latest/:eventId', PublishController.getLatestPublishResults)

export default router
