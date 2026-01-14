/**
 * Reddit Platform Controller
 * 
 * Reddit-specific API endpoints for subreddit management.
 * This is Reddit-platform-specific, NOT generic!
 * 
 * @module platforms/reddit/controller
 */

import { Request, Response } from 'express'
import { RedditSubredditService } from './subredditService.js'

export class RedditController {
  /**
   * Get all subreddits and groups
   * GET /api/platforms/reddit/subreddits
   */
  static async getSubreddits(req: Request, res: Response) {
    try {
      const result = await RedditSubredditService.getSubreddits()
      return res.json({ success: true, ...result })
    } catch (error: any) {
      console.error('Get subreddits error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get subreddits',
        details: error.message
      })
    }
  }

  /**
   * Add a subreddit
   * POST /api/platforms/reddit/subreddits
   */
  static async addSubreddit(req: Request, res: Response) {
    try {
      const { subreddit } = req.body

      if (!subreddit) {
        return res.status(400).json({
          success: false,
          error: 'Subreddit is required'
        })
      }

      const result = await RedditSubredditService.addSubreddit(subreddit)
      if (result.success) {
        return res.json(result)
      }
      return res.status(400).json(result)
    } catch (error: any) {
      console.error('Add subreddit error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to add subreddit',
        details: error.message
      })
    }
  }

  /**
   * Remove a subreddit
   * DELETE /api/platforms/reddit/subreddits/:subreddit
   */
  static async removeSubreddit(req: Request, res: Response) {
    try {
      const { subreddit } = req.params

      if (!subreddit) {
        return res.status(400).json({
          success: false,
          error: 'Subreddit is required'
        })
      }

      const result = await RedditSubredditService.removeSubreddit(decodeURIComponent(subreddit))
      return res.json(result)
    } catch (error: any) {
      console.error('Remove subreddit error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to remove subreddit',
        details: error.message
      })
    }
  }

  /**
   * Get subreddit groups
   * GET /api/platforms/reddit/subreddit-groups
   */
  static async getSubredditGroups(req: Request, res: Response) {
    try {
      const result = await RedditSubredditService.getSubreddits()
      return res.json({
        success: true,
        groups: result.groups || {}
      })
    } catch (error: any) {
      console.error('Get subreddit groups error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get subreddit groups',
        details: error.message
      })
    }
  }

  /**
   * Create a subreddit group
   * POST /api/platforms/reddit/subreddit-groups
   */
  static async createSubredditGroup(req: Request, res: Response) {
    try {
      const { groupName, subreddits } = req.body

      if (!groupName || !subreddits || !Array.isArray(subreddits)) {
        return res.status(400).json({
          success: false,
          error: 'Group name and subreddits array are required'
        })
      }

      const result = await RedditSubredditService.createGroup(groupName, subreddits)
      if (result.success) {
        return res.json(result)
      }
      return res.status(400).json(result)
    } catch (error: any) {
      console.error('Create subreddit group error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create subreddit group',
        details: error.message
      })
    }
  }

  /**
   * Update a subreddit group
   * PUT /api/platforms/reddit/subreddit-groups/:groupName
   */
  static async updateSubredditGroup(req: Request, res: Response) {
    try {
      const { groupName } = req.params
      const { subreddits } = req.body

      if (!subreddits || !Array.isArray(subreddits)) {
        return res.status(400).json({
          success: false,
          error: 'Subreddits array is required'
        })
      }

      const result = await RedditSubredditService.updateGroup(decodeURIComponent(groupName), subreddits)
      if (result.success) {
        return res.json(result)
      }
      return res.status(400).json(result)
    } catch (error: any) {
      console.error('Update subreddit group error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update subreddit group',
        details: error.message
      })
    }
  }

  /**
   * Delete a subreddit group
   * DELETE /api/platforms/reddit/subreddit-groups/:groupName
   */
  static async deleteSubredditGroup(req: Request, res: Response) {
    try {
      const { groupName } = req.params
      const result = await RedditSubredditService.deleteGroup(decodeURIComponent(groupName))
      return res.json(result)
    } catch (error: any) {
      console.error('Delete subreddit group error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete subreddit group',
        details: error.message
      })
    }
  }

  /**
   * Import subreddit groups
   * POST /api/platforms/reddit/subreddit-groups/import
   */
  static async importSubredditGroups(req: Request, res: Response) {
    try {
      const { groups } = req.body

      if (!groups || typeof groups !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Groups object is required'
        })
      }

      const result = await RedditSubredditService.importGroups(groups)
      return res.json(result)
    } catch (error: any) {
      console.error('Import subreddit groups error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to import subreddit groups',
        details: error.message
      })
    }
  }

  /**
   * Export subreddit groups
   * GET /api/platforms/reddit/subreddit-groups/export
   */
  static async exportSubredditGroups(req: Request, res: Response) {
    try {
      const result = await RedditSubredditService.exportGroups()
      return res.json(result)
    } catch (error: any) {
      console.error('Export subreddit groups error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to export subreddit groups',
        details: error.message
      })
    }
  }
}
