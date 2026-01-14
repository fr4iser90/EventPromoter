/**
 * LinkedIn Platform Module
 * 
 * Self-discovering platform architecture with schema-driven UI.
 * 
 * @module platforms/linkedin/index
 */

import { PlatformModule } from '../../types/platformModule.js'
import { LinkedInParser } from './parser.js'
import { LinkedInService } from './service.js'
import { LINKEDIN_TEMPLATES } from './templates/index.js'
import { LinkedInValidator } from './validator.js'
import { linkedinSchema } from './schema/index.js'

/**
 * LinkedIn Platform Module
 * 
 * Complete platform module using the self-discovering architecture.
 * This module will be automatically discovered by the PlatformRegistry.
 */
export const LinkedInPlatformModule: PlatformModule = {
  metadata: {
    id: 'linkedin',
    displayName: 'LinkedIn',
    version: '1.0.0',
    category: 'professional',
    icon: '💼',
    color: '#0A66C2',
    description: 'Share events on LinkedIn with professional content',
    author: 'EventPromoter',
    license: 'MIT',
    dataSource: 'connections.json'
  },
  schema: linkedinSchema,
  capabilities: {
    supportsText: true,
    supportsImages: true,
    supportsVideo: false,
    supportsLinks: true,
    supportsHashtags: true,
    supportsMentions: false,
    supportsPolls: false,
    supportsScheduling: false,
    requiresAuth: true
  },
  service: new LinkedInService(),
  parser: LinkedInParser,
  validator: {
    validate: (content: any) => LinkedInValidator.validateContent(content),
    getLimits: () => ({
      maxLength: 3000,
      maxImages: 1,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif']
    })
  },
  templates: LINKEDIN_TEMPLATES,
  config: {
    apiEndpoints: {
      postShare: 'https://api.linkedin.com/v2/ugcPosts',
      uploadImage: 'https://api.linkedin.com/v2/assets'
    },
    rateLimits: {
      requestsPerHour: 100,
      requestsPerDay: 1000
    },
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif']
  }
}

// Export as default for discovery
export default LinkedInPlatformModule
