// History routes

import { Router } from 'express'
import { HistoryController } from '../controllers/historyController.js'

const router = Router()

// GET /api/history - Get project history
router.get('/', HistoryController.getHistory)

// POST /api/history - Add project to history
router.post('/', HistoryController.addProject)

// GET /api/history/analytics - Get analytics
router.get('/analytics', HistoryController.getAnalytics)

// PATCH /api/history/:projectId - Update project
router.patch('/:projectId', HistoryController.updateProject)

// DELETE /api/history/:projectId - Delete project
router.delete('/:projectId', HistoryController.deleteProject)

export default router
