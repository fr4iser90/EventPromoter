/**
 * Email Platform Routes
 * 
 * Email-specific API routes.
 * Note: Target management routes are now generic and handled in routes/platforms.ts
 * 
 * @module platforms/email/api/routes
 */

import { Router } from 'express'
import { EmailController } from './controller.js'

const router = Router()

// Composite block endpoints
router.get('/recipient-modes', EmailController.getRecipientModes)
router.get('/templates', EmailController.getTemplates)

export default router
