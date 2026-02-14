// Main routes index - combines all route modules

import { Router } from 'express'
import eventRoutes from './event.js'
import parsingRoutes from './parsing.js'
import publishRoutes from './publish.js'
import historyRoutes from './history.js'
import configRoutes from './config.js'
import submitRoutes from './submit.js'
import fileRoutes from './files.js'
import platformRoutes from './platforms.js'
import templateRoutes from './templates.js'
import translationRoutes from './translations.js'
import hashtagRoutes from './hashtags.js'
import helperRoutes from './helpers.js'
import telemetryRoutes from './telemetry.js'
import authRoutes from './auth.js'
import { authRequiredMiddleware } from '../middleware/auth.js'

const router = Router()

// Protect all routes by default. Public exceptions are handled in authRequiredMiddleware.
router.use(authRequiredMiddleware)
router.use('/auth', authRoutes)
router.use('/event', eventRoutes)
router.use('/parsing', parsingRoutes)
router.use('/publish', publishRoutes)
router.use('/history', historyRoutes)
router.use('/config', configRoutes)
router.use('/submit', submitRoutes)
router.use('/files', fileRoutes)
router.use('/platforms', platformRoutes)
router.use('/templates', templateRoutes)
router.use('/translations', translationRoutes)
router.use('/hashtags', hashtagRoutes)
router.use('/helpers', helperRoutes)
router.use('/telemetry', telemetryRoutes)

// Health check (could be moved to a health controller)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

export default router
