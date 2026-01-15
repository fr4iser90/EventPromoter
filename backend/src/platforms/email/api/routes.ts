/**
 * Email Platform Routes
 * 
 * Email-specific API routes for recipient management.
 * These routes are Email-platform-specific, NOT generic!
 * 
 * @module platforms/email/api/routes
 */

import { Router } from 'express'
import { EmailController } from './controller.js'

const router = Router()

// Email-specific recipient management routes
router.get('/recipients', EmailController.getRecipients)
router.post('/recipients', EmailController.addRecipient)
router.delete('/recipients/:email', EmailController.removeRecipient)
router.get('/recipient-groups', EmailController.getRecipientGroups)
router.post('/recipient-groups', EmailController.createRecipientGroup)
router.put('/recipient-groups/:groupName', EmailController.updateRecipientGroup)
router.delete('/recipient-groups/:groupName', EmailController.deleteRecipientGroup)
router.post('/recipient-groups/import', EmailController.importRecipientGroups)
router.get('/recipient-groups/export', EmailController.exportRecipientGroups)

export default router
