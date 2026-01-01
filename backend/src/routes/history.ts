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

// PATCH /api/history/:eventId - Update Event
router.patch('/:eventId', HistoryController.updateEvent)

// DELETE /api/history/:eventId - Delete Event
router.delete('/:eventId', HistoryController.deleteEvent)

export default router
