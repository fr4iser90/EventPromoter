/**
 * Reddit Platform Routes
 * 
 * Reddit-specific API routes for subreddit management.
 * These routes are Reddit-platform-specific, NOT generic!
 * 
 * @module platforms/reddit/routes
 */

import { Router } from 'express'
import { RedditController } from './controller.js'

const router = Router()

// Reddit-specific subreddit management routes
router.get('/subreddits', RedditController.getSubreddits)
router.post('/subreddits', RedditController.addSubreddit)
router.delete('/subreddits/:subreddit', RedditController.removeSubreddit)
router.get('/subreddit-groups', RedditController.getSubredditGroups)
router.post('/subreddit-groups', RedditController.createSubredditGroup)
router.put('/subreddit-groups/:groupName', RedditController.updateSubredditGroup)
router.delete('/subreddit-groups/:groupName', RedditController.deleteSubredditGroup)
router.post('/subreddit-groups/import', RedditController.importSubredditGroups)
router.get('/subreddit-groups/export', RedditController.exportSubredditGroups)

export default router
