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

// POST /api/event/:eventId/load-files - Load specific files from event
router.post('/:eventId/load-files', EventController.loadEventFiles)

// GET /api/event/:eventId/load-data - Load complete event data
router.get('/:eventId/load-data', EventController.loadEventData)

// GET /api/event/:eventId/restore - Complete event restore with all data
router.get('/:eventId/restore', EventController.restoreEvent)

// GET /api/event/:eventId/platform-content - Get platform content for event
router.get('/:eventId/platform-content', EventController.getEventPlatformContent)

// PUT /api/event/:eventId/platform-content - Save platform content for event
router.put('/:eventId/platform-content', EventController.saveEventPlatformContent)

export default router
