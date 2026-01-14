/**
 * Hashtag Routes
 * 
 * API routes for hashtag management.
 * 
 * @module routes/hashtags
 */

import { Router } from 'express'
import { HashtagController } from '../controllers/hashtagController.js'

const router = Router()

// Get all hashtags (optionally filtered by platform)
router.get('/', HashtagController.getHashtags)

// Get suggested hashtags based on event data
router.post('/suggest', HashtagController.getSuggestedHashtags)

// Add a hashtag
router.post('/', HashtagController.addHashtag)

// Remove a hashtag
router.delete('/:hashtag', HashtagController.removeHashtag)

// Create a hashtag group
router.post('/groups', HashtagController.createGroup)

// Update selected hashtags
router.put('/selected', HashtagController.updateSelected)

export default router
