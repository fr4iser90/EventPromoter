/**
 * Email Platform Controller
 * 
 * Email-specific API endpoints.
 * Note: Target management routes are now generic and handled in routes/platforms.ts
 * 
 * @module platforms/email/api/controller
 */

import { Request, Response } from 'express'

export class EmailController {

  /**
   * Get recipient modes (for composite block)
   * GET /api/platforms/email/recipient-modes
   */
  static async getRecipientModes(req: Request, res: Response) {
    try {
      return res.json({
        success: true,
        options: [
          { label: 'platform.email.recipients.modeAll', value: 'all' },
          { label: 'platform.email.recipients.modeGroups', value: 'groups' },
          { label: 'platform.email.recipients.modeIndividual', value: 'individual' }
        ]
      })
    } catch (error: any) {
      console.error('Get recipient modes error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get recipient modes',
        details: error.message
      })
    }
  }


  /**
   * Get templates (for composite block)
   * GET /api/platforms/email/templates
   */
  static async getTemplates(req: Request, res: Response) {
    try {
      // Import template service directly
      const { TemplateService } = await import('../../../services/templateService.js')
      const templates = await TemplateService.getAllTemplates('email')
      
      // Transform to frontend-ready format
      const options = templates.map((template: any) => ({
        label: template.name || template.id,
        value: template.id,
        metadata: template
      }))

      return res.json({
        success: true,
        options,
        templates
      })
    } catch (error: any) {
      console.error('Get templates error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get templates',
        details: error.message
      })
    }
  }

  /**
   * Get available locales (for composite block)
   * GET /api/platforms/email/locales
   */
  static async getLocales(req: Request, res: Response) {
    try {
      return res.json({
        success: true,
        options: [
          { label: 'platform.email.locales.de', value: 'de' },
          { label: 'platform.email.locales.en', value: 'en' },
          { label: 'platform.email.locales.es', value: 'es' }
        ]
      })
    } catch (error: any) {
      console.error('Get locales error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get locales',
        details: error.message
      })
    }
  }

}
