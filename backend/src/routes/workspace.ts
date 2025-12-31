// Workspace routes

import { Router } from 'express'
import { WorkspaceController } from '../controllers/workspaceController.js'

const router = Router()

// GET /api/workspace - Get current workspace
router.get('/', WorkspaceController.getWorkspace)

// POST /api/workspace - Save workspace
router.post('/', WorkspaceController.saveWorkspace)

// GET /api/workspace/project - Get current project
router.get('/project', WorkspaceController.getCurrentProject)

// PATCH /api/workspace/project - Update current project
router.patch('/project', WorkspaceController.updateCurrentProject)

// POST /api/workspace/reset - Reset workspace to default
router.post('/reset', WorkspaceController.resetWorkspace)

export default router
