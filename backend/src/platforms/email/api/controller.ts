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
          { label: '📬 Alle', value: 'all' },
          { label: '👥 Gruppen', value: 'groups' },
          { label: '✉️ Einzelne', value: 'individual' }
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

}
