/**
 * Helper Controller
 * 
 * Handles helper content requests.
 * 
 * @module controllers/helperController
 */

import { Request, Response } from 'express'
import { getHelperContent, getPlatformHelpers } from '../services/helperService.js'

export class HelperController {
  /**
   * GET /api/helpers/:helperId?platform={platformId}&lang={lang}
   * Get a specific helper content
   */
  static async getHelper(req: Request, res: Response) {
    try {
      const { helperId } = req.params
      const { platform, lang = 'en' } = req.query
      
      if (!helperId) {
        return res.status(400).json({
          success: false,
          error: 'Helper ID is required'
        })
      }

      const helper = await getHelperContent(
        helperId,
        platform as string | undefined,
        lang as string
      )

      if (!helper) {
        return res.status(404).json({
          success: false,
          error: 'Helper not found'
        })
      }

      return res.json({
        success: true,
        helper
      })
    } catch (error: any) {
      console.error('Get helper error:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to get helper',
        details: error.message
      })
    }
  }

  /**
   * GET /api/helpers?platform={platformId}&lang={lang}
   * Get all helpers for a platform (merged with global)
   */
  static async getHelpers(req: Request, res: Response) {
    try {
      const { platform, lang = 'en' } = req.query
      
      const platformId = (platform as string) || 'global'
      const helpers = await getPlatformHelpers(platformId, lang as string)

      return res.json({
        success: true,
        helpers
      })
    } catch (error: any) {
      console.error('Get helpers error:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to get helpers',
        details: error.message
      })
    }
  }
}
