/**
 * Hashtag Controller
 * 
 * API endpoints for hashtag management.
 * 
 * @module controllers/hashtagController
 */

import { Request, Response } from 'express'
import { HashtagService } from '../services/hashtagService.js'

export class HashtagController {
  /**
   * Get all hashtags (optionally filtered by platform)
   * GET /api/hashtags?platform=instagram
   */
  static async getHashtags(req: Request, res: Response) {
    try {
      const { platform } = req.query
      const result = await HashtagService.getHashtags(platform as string)
      return res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Get hashtags error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get hashtags',
        details: error.message
      })
    }
  }

  /**
   * Get suggested hashtags based on event data
   * POST /api/hashtags/suggest
   */
  static async getSuggestedHashtags(req: Request, res: Response) {
    try {
      const { eventData } = req.body
      const suggestions = await HashtagService.getSuggestedHashtags(eventData || {})
      return res.json({ success: true, suggestions })
    } catch (error: any) {
      console.error('Get suggested hashtags error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get suggested hashtags',
        details: error.message
      })
    }
  }

  /**
   * Add a hashtag
   * POST /api/hashtags
   */
  static async addHashtag(req: Request, res: Response) {
    try {
      const { hashtag, group } = req.body

      if (!hashtag) {
        return res.status(400).json({
          success: false,
          error: 'Hashtag is required'
        })
      }

      const result = await HashtagService.addHashtag(hashtag, group)
      if (result.success) {
        return res.json(result)
      }
      return res.status(400).json(result)
    } catch (error: any) {
      console.error('Add hashtag error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to add hashtag',
        details: error.message
      })
    }
  }

  /**
   * Remove a hashtag
   * DELETE /api/hashtags/:hashtag
   */
  static async removeHashtag(req: Request, res: Response) {
    try {
      const { hashtag } = req.params

      if (!hashtag) {
        return res.status(400).json({
          success: false,
          error: 'Hashtag is required'
        })
      }

      const result = await HashtagService.removeHashtag(decodeURIComponent(hashtag))
      return res.json(result)
    } catch (error: any) {
      console.error('Remove hashtag error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to remove hashtag',
        details: error.message
      })
    }
  }

  /**
   * Create a hashtag group
   * POST /api/hashtags/groups
   */
  static async createGroup(req: Request, res: Response) {
    try {
      const { groupName, hashtags } = req.body

      if (!groupName || !hashtags || !Array.isArray(hashtags)) {
        return res.status(400).json({
          success: false,
          error: 'Group name and hashtags array are required'
        })
      }

      const result = await HashtagService.createGroup(groupName, hashtags)
      if (result.success) {
        return res.json(result)
      }
      return res.status(400).json(result)
    } catch (error: any) {
      console.error('Create hashtag group error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create hashtag group',
        details: error.message
      })
    }
  }

  /**
   * Update selected hashtags
   * PUT /api/hashtags/selected
   */
  static async updateSelected(req: Request, res: Response) {
    try {
      const { selected } = req.body

      if (!selected || !Array.isArray(selected)) {
        return res.status(400).json({
          success: false,
          error: 'Selected array is required'
        })
      }

      const result = await HashtagService.updateSelected(selected)
      return res.json(result)
    } catch (error: any) {
      console.error('Update selected hashtags error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update selected hashtags',
        details: error.message
      })
    }
  }
}
