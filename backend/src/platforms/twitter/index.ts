/**
 * Twitter Platform Module
 * 
 * Self-discovering platform architecture with schema-driven UI.
 * 
 * @module platforms/twitter/index
 */

import { PlatformModule } from '../../types/platformModule.js'
import { TwitterParser } from './parser.js'
import { TwitterService } from './service.js'
import { TWITTER_TEMPLATES } from './templates/index.js'
import { TwitterValidator } from './validator.js'
import { twitterSchema } from './schema/index.js'

/**
 * Twitter Platform Module
 * 
 * Complete platform module using the self-discovering architecture.
 * This module will be automatically discovered by the PlatformRegistry.
 */
export const TwitterPlatformModule: PlatformModule = {
  metadata: {
    id: 'twitter',
    displayName: 'Twitter/X',
    version: '1.0.0',
    category: 'social',
    icon: '🐦',
    color: '#1DA1F2',
    description: 'Share events on Twitter/X with character-limited posts',
    author: 'EventPromoter',
    license: 'MIT'
  },
  schema: twitterSchema,
  capabilities: {
    supportsText: true,
    supportsImages: true,
    supportsVideo: false,
    supportsLinks: true,
    supportsHashtags: true,
    supportsMentions: true,
    supportsPolls: false,
    supportsScheduling: false,
    requiresAuth: true
  },
  service: new TwitterService(),
  parser: TwitterParser,
  validator: {
    validate: (content: any) => TwitterValidator.validateContent(content),
    getLimits: () => ({
      maxLength: 280,
      maxImages: 1,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    })
  },
  templates: TWITTER_TEMPLATES,
  config: {
    apiEndpoints: {
      postTweet: 'https://api.twitter.com/2/tweets',
      uploadMedia: 'https://upload.twitter.com/1.1/media/upload.json'
    },
    rateLimits: {
      requestsPerHour: 300,
      requestsPerDay: 3000
    },
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
}

// Export as default for discovery
export default TwitterPlatformModule
