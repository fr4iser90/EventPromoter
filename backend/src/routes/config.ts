// Config routes

import { Router } from 'express'
import { ConfigController } from '../controllers/configController.js'

const router = Router()

// ✅ GENERIC: Config routes (works for any config name)
// GET /api/config/:name - Get config by name
router.get('/:name', ConfigController.getConfig)

// POST /api/config/:name - Save config by name
router.post('/:name', ConfigController.saveConfig)

// App config routes
// GET /api/config/app - Get app config
router.get('/app', ConfigController.getAppConfig)

// POST /api/config/app - Save app config
router.post('/app', ConfigController.saveAppConfig)

// PATCH /api/config/app - Update app config
router.patch('/app', ConfigController.updateAppConfig)

// Event ID pattern routes
// GET /api/config/event-id-patterns - Get available patterns
router.get('/event-id-patterns', ConfigController.getEventIdPatterns)

// POST /api/config/event-id-pattern - Set current pattern
router.post('/event-id-pattern', ConfigController.setEventIdPattern)

export default router
