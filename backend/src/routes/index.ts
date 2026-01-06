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

const router = Router()

// Mount route modules
router.use('/event', eventRoutes)
router.use('/parsing', parsingRoutes)
router.use('/publish', publishRoutes)
router.use('/history', historyRoutes)
router.use('/config', configRoutes)
router.use('/submit', submitRoutes)
router.use('/files', fileRoutes)
router.use('/platforms', platformRoutes)
router.use('/templates', templateRoutes)

// Health check (could be moved to a health controller)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

export default router
