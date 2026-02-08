/**
 * Reddit Platform Routes
 * 
 * Reddit-specific API routes.
 * Note: Target management routes are now generic and handled in routes/platforms.ts
 * 
 * @module platforms/reddit/routes
 */

import { Router } from 'express'
import { RedditController } from './controller.js'

const router = Router()

// Subreddit modes endpoint (for composite block)
router.get('/subreddit-modes', RedditController.getSubredditModes)

// Locales endpoint (for composite block)
router.get('/locales', RedditController.getLocales)

// Templates endpoint (for composite block)
router.get('/templates', RedditController.getTemplates)

export default router
