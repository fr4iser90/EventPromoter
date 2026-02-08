// History routes

import { Router } from 'express'
import { HistoryController } from '../controllers/historyController.js'

const router = Router()

// GET /api/history - Get Event history
router.get('/', HistoryController.getHistory)

// POST /api/history - Add Event to history
router.post('/', HistoryController.addEvent)

// GET /api/history/analytics - Get analytics
router.get('/analytics', HistoryController.getAnalytics)

// GET /api/history/:eventId - Get single event
router.get('/:eventId', HistoryController.getEvent)

// GET /api/history/:eventId/telemetry - Get telemetry for event
router.get('/:eventId/telemetry', HistoryController.getTelemetry)

// POST /api/history/:eventId/telemetry/refresh - Refresh telemetry
router.post('/:eventId/telemetry/refresh', HistoryController.refreshTelemetry)

// PATCH /api/history/:eventId - Update Event
router.patch('/:eventId', HistoryController.updateEvent)

// DELETE /api/history/:eventId - Delete Event
router.delete('/:eventId', HistoryController.deleteEvent)

export default router
