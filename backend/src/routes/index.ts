// Main routes index - combines all route modules

import { Router } from 'express'
import workspaceRoutes from './workspace.js'
import historyRoutes from './history.js'
import configRoutes from './config.js'
import submitRoutes from './submit.js'

const router = Router()

// Mount route modules
router.use('/workspace', workspaceRoutes)
router.use('/history', historyRoutes)
router.use('/config', configRoutes)
router.use('/submit', submitRoutes)

// Health check (could be moved to a health controller)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

export default router
