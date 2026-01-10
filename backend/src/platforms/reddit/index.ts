/**
 * Reddit Platform Module
 * 
 * Self-discovering platform architecture with schema-driven UI.
 * 
 * @module platforms/reddit/index
 */

import { PlatformModule } from '../../types/platformModule.js'
import { RedditParser } from './parser.js'
import { RedditService } from './service.js'
import { REDDIT_TEMPLATES } from './templates.js'
import { RedditValidator } from './validator.js'
import { redditSchema } from './schema/index.js'

/**
 * Reddit Platform Module
 * 
 * Complete platform module using the self-discovering architecture.
 * This module will be automatically discovered by the PlatformRegistry.
 */
export const RedditPlatformModule: PlatformModule = {
  metadata: {
    id: 'reddit',
    displayName: 'Reddit',
    version: '1.0.0',
    category: 'social',
    icon: '🔴',
    color: '#FF4500',
    description: 'Share events on Reddit with text posts and images',
    author: 'EventPromoter',
    license: 'MIT'
  },
  schema: redditSchema,
  capabilities: {
    supportsText: true,
    supportsImages: true,
    supportsVideo: false,
    supportsLinks: true,
    supportsHashtags: false,
    supportsMentions: false,
    supportsPolls: false,
    supportsScheduling: false,
    requiresAuth: true
  },
  service: new RedditService(),
  parser: RedditParser,
  validator: {
    validate: (content: any) => RedditValidator.validateContent(content),
    getLimits: () => ({
      maxLength: 40000,
      maxImages: 1,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    })
  },
  templates: REDDIT_TEMPLATES,
  config: {
    apiEndpoints: {
      submitPost: 'https://oauth.reddit.com/api/submit',
      uploadImage: 'https://oauth.reddit.com/api/upload_sr_img'
    },
    rateLimits: {
      requestsPerHour: 600,
      requestsPerDay: 10000
    },
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
}

// Export as default for discovery
export default RedditPlatformModule
