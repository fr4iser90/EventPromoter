/**
 * Reddit Platform Controller
 * 
 * Reddit-specific API endpoints.
 * Note: Target management routes are now generic and handled in routes/platforms.ts
 * 
 * @module platforms/reddit/controller
 */

import { Request, Response } from 'express'

export class RedditController {
  /**
   * Get subreddit modes (for composite block)
   * GET /api/platforms/reddit/subreddit-modes
   */
  static async getSubredditModes(req: Request, res: Response) {
    try {
      return res.json({
        success: true,
        options: [
          { label: '🔴 Alle', value: 'all' },
          { label: '👥 Gruppen', value: 'groups' },
          { label: '📌 Einzelne', value: 'individual' }
        ]
      })
    } catch (error: any) {
      console.error('Get subreddit modes error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get subreddit modes',
        details: error.message
      })
    }
  }

  /**
   * Get available locales (for composite block)
   * GET /api/platforms/reddit/locales
   */
  static async getLocales(req: Request, res: Response) {
    try {
      return res.json({
        success: true,
        options: [
          { label: '🇩🇪 Deutsch', value: 'de' },
          { label: '🇬🇧 English', value: 'en' },
          { label: '🇪🇸 Español', value: 'es' }
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

  /**
   * Get templates (for composite block)
   * GET /api/platforms/reddit/templates
   */
  static async getTemplates(req: Request, res: Response) {
    try {
      // Import template service directly
      const { TemplateService } = await import('../../services/templateService.js')
      const templates = await TemplateService.getAllTemplates('reddit')
      
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
