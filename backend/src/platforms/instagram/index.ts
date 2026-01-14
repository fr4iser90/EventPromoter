/**
 * Instagram Platform Module
 * 
 * Self-discovering platform architecture with schema-driven UI.
 * 
 * @module platforms/instagram/index
 */

import { PlatformModule } from '../../types/platformModule.js'
import { InstagramParser } from './parser.js'
import { InstagramService } from './service.js'
import { INSTAGRAM_TEMPLATES } from './templates/index.js'
import { InstagramValidator } from './validator.js'
import { instagramSchema } from './schema/index.js'

/**
 * Instagram Platform Module
 * 
 * Complete platform module using the self-discovering architecture.
 * This module will be automatically discovered by the PlatformRegistry.
 */
export const InstagramPlatformModule: PlatformModule = {
  metadata: {
    id: 'instagram',
    displayName: 'Instagram',
    version: '1.0.0',
    category: 'social',
    icon: '📸',
    color: '#E4405F',
    description: 'Share events on Instagram with images and captions',
    author: 'EventPromoter',
    license: 'MIT',
    dataSource: 'accounts.json'
  },
  schema: instagramSchema,
  capabilities: {
    supportsText: true,
    supportsImages: true,
    supportsVideo: false,
    supportsLinks: false,
    supportsHashtags: true,
    supportsMentions: true,
    supportsPolls: false,
    supportsScheduling: false,
    requiresAuth: true
  },
  service: new InstagramService(),
  parser: InstagramParser,
  validator: {
    validate: (content: any) => InstagramValidator.validateContent(content),
    getLimits: () => ({
      maxLength: 2200,
      maxImages: 1,
      allowedFormats: ['jpg', 'jpeg', 'png']
    })
  },
  templates: INSTAGRAM_TEMPLATES,
  config: {
    apiEndpoints: {
      createPost: 'https://graph.instagram.com/me/media',
      publishPost: 'https://graph.instagram.com/me/media_publish'
    },
    rateLimits: {
      requestsPerHour: 200,
      requestsPerDay: 5000
    },
    supportedFormats: ['jpg', 'jpeg', 'png']
  }
}

// Export as default for discovery
export default InstagramPlatformModule
