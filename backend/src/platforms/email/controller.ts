/**
 * Email Platform Controller
 * 
 * Email-specific API endpoints for recipient management.
 * This is Email-platform-specific, NOT generic!
 * 
 * @module platforms/email/controller
 */

import { Request, Response } from 'express'
import { EmailRecipientService } from './recipientService.js'

export class EmailController {
  /**
   * Get all recipients and groups
   * GET /api/platforms/email/recipients
   * Returns data in format ready for frontend (no transformation needed)
   */
  static async getRecipients(req: Request, res: Response) {
    try {
      const result = await EmailRecipientService.getRecipients()
      // Transform to frontend-ready format
      const options = (result.available || []).map((email: string) => ({
        label: email,
        value: email
      }))
      return res.json({ 
        success: true, 
        options, // Frontend-ready format
        available: result.available, // Keep for backward compatibility
        groups: result.groups,
        selected: result.selected
      })
    } catch (error: any) {
      console.error('Get recipients error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get recipients',
        details: error.message
      })
    }
  }

  /**
   * Add a recipient
   * POST /api/platforms/email/recipients
   */
  static async addRecipient(req: Request, res: Response) {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        })
      }

      const result = await EmailRecipientService.addRecipient(email)
      if (result.success) {
        return res.json(result)
      }
      return res.status(400).json(result)
    } catch (error: any) {
      console.error('Add recipient error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to add recipient',
        details: error.message
      })
    }
  }

  /**
   * Remove a recipient
   * DELETE /api/platforms/email/recipients/:email
   */
  static async removeRecipient(req: Request, res: Response) {
    try {
      const { email } = req.params

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        })
      }

      const result = await EmailRecipientService.removeRecipient(decodeURIComponent(email))
      return res.json(result)
    } catch (error: any) {
      console.error('Remove recipient error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to remove recipient',
        details: error.message
      })
    }
  }

  /**
   * Get recipient groups
   * GET /api/platforms/email/recipient-groups
   */
  static async getRecipientGroups(req: Request, res: Response) {
    try {
      const result = await EmailRecipientService.getRecipients()
      return res.json({
        success: true,
        groups: result.groups || {}
      })
    } catch (error: any) {
      console.error('Get recipient groups error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get recipient groups',
        details: error.message
      })
    }
  }

  /**
   * Create a recipient group
   * POST /api/platforms/email/recipient-groups
   */
  static async createRecipientGroup(req: Request, res: Response) {
    try {
      const { groupName, emails } = req.body

      if (!groupName || !emails || !Array.isArray(emails)) {
        return res.status(400).json({
          success: false,
          error: 'Group name and emails array are required'
        })
      }

      const result = await EmailRecipientService.createGroup(groupName, emails)
      if (result.success) {
        return res.json(result)
      }
      return res.status(400).json(result)
    } catch (error: any) {
      console.error('Create recipient group error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create recipient group',
        details: error.message
      })
    }
  }

  /**
   * Update a recipient group
   * PUT /api/platforms/email/recipient-groups/:groupName
   */
  static async updateRecipientGroup(req: Request, res: Response) {
    try {
      const { groupName } = req.params
      const { emails } = req.body

      if (!emails || !Array.isArray(emails)) {
        return res.status(400).json({
          success: false,
          error: 'Emails array is required'
        })
      }

      const result = await EmailRecipientService.updateGroup(decodeURIComponent(groupName), emails)
      if (result.success) {
        return res.json(result)
      }
      return res.status(400).json(result)
    } catch (error: any) {
      console.error('Update recipient group error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update recipient group',
        details: error.message
      })
    }
  }

  /**
   * Delete a recipient group
   * DELETE /api/platforms/email/recipient-groups/:groupName
   */
  static async deleteRecipientGroup(req: Request, res: Response) {
    try {
      const { groupName } = req.params
      const result = await EmailRecipientService.deleteGroup(decodeURIComponent(groupName))
      return res.json(result)
    } catch (error: any) {
      console.error('Delete recipient group error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete recipient group',
        details: error.message
      })
    }
  }

  /**
   * Import recipient groups
   * POST /api/platforms/email/recipient-groups/import
   */
  static async importRecipientGroups(req: Request, res: Response) {
    try {
      const { groups } = req.body

      if (!groups || typeof groups !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Groups object is required'
        })
      }

      const result = await EmailRecipientService.importGroups(groups)
      return res.json(result)
    } catch (error: any) {
      console.error('Import recipient groups error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to import recipient groups',
        details: error.message
      })
    }
  }

  /**
   * Export recipient groups
   * GET /api/platforms/email/recipient-groups/export
   */
  static async exportRecipientGroups(req: Request, res: Response) {
    try {
      const result = await EmailRecipientService.exportGroups()
      return res.json(result)
    } catch (error: any) {
      console.error('Export recipient groups error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to export recipient groups',
        details: error.message
      })
    }
  }
}

