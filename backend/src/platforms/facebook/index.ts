/**
 * Facebook Platform Module
 * 
 * Self-discovering platform architecture with schema-driven UI.
 * 
 * @module platforms/facebook/index
 */

import { PlatformModule } from '../../types/platformModule.js'
import { FacebookParser } from './parser.js'
import { FacebookService } from './service.js'
import { FACEBOOK_TEMPLATES } from './templates.js'
import { FacebookValidator } from './validator.js'
import { facebookSchema } from './schema/index.js'

/**
 * Facebook Platform Module
 * 
 * Complete platform module using the self-discovering architecture.
 * This module will be automatically discovered by the PlatformRegistry.
 */
export const FacebookPlatformModule: PlatformModule = {
  metadata: {
    id: 'facebook',
    displayName: 'Facebook',
    version: '1.0.0',
    category: 'social',
    icon: '👥',
    color: '#1877F2',
    description: 'Share events on Facebook with rich content',
    author: 'EventPromoter',
    license: 'MIT'
  },
  schema: facebookSchema,
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
  service: new FacebookService(),
  parser: FacebookParser,
  validator: {
    validate: (content: any) => FacebookValidator.validateContent(content),
    getLimits: () => ({
      maxLength: 63206,
      maxImages: 1,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    })
  },
  templates: FACEBOOK_TEMPLATES,
  config: {
    apiEndpoints: {
      postToPage: 'https://graph.facebook.com/v18.0/{pageId}/feed',
      uploadPhoto: 'https://graph.facebook.com/v18.0/{pageId}/photos'
    },
    rateLimits: {
      requestsPerHour: 200,
      requestsPerDay: 5000
    },
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
}

// Export as default for discovery
export default FacebookPlatformModule
