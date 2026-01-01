// Event routes

import { Router } from 'express'
import { EventController } from '../controllers/eventController.js'

const router = Router()

// GET /api/event - Get current event workspace
router.get('/', EventController.getEventWorkspace)

// POST /api/event - Save event workspace
router.post('/', EventController.saveEventWorkspace)

// GET /api/event/current - Get current event
router.get('/current', EventController.getCurrentEvent)

// PATCH /api/event/current - Update current event
router.patch('/current', EventController.updateCurrentEvent)

// POST /api/event/reset - Reset event workspace to default
router.post('/reset', EventController.resetEventWorkspace)

export default router
