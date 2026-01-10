/**
 * PLATFORM_ID Platform Module
 * 
 * Self-discovering platform architecture with schema-driven UI.
 * 
 * @module platforms/PLATFORM_ID/index
 */

import { PlatformModule } from '../../types/platformModule.js'
import { PLATFORM_IDParser } from './parser.js'
import { PLATFORM_IDService } from './service.js'
import { PLATFORM_IDValidator } from './validator.js'
import { platformIdSchema } from './schema.js'
import { convertPlatformPluginToModule } from '../../types/platformModule.js'

// Legacy plugin for conversion (temporary - can be removed after full migration)
const PLATFORM_IDPlugin = {
  name: 'PLATFORM_ID',
  version: '1.0.0',
  displayName: 'PLATFORM_DISPLAY_NAME',
  capabilities: [
    { type: 'text', required: true },
    { type: 'image', required: false },
    { type: 'link', required: false }
  ],
  parser: PLATFORM_IDParser,
  service: new PLATFORM_IDService(),
  validator: {
    validate: (content: any) => PLATFORM_IDValidator.validateContent(content),
    getLimits: () => ({
      maxLength: 1000,
      maxImages: 5,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif']
    })
  },
  config: {
    apiEndpoints: {
      post: 'https://api.PLATFORM_ID.com/v1/posts'
    },
    rateLimits: {
      requestsPerHour: 100,
      requestsPerDay: 1000
    },
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif']
  }
}

/**
 * PLATFORM_ID Platform Module
 * 
 * Complete platform module using the new self-discovering architecture.
 * This module will be automatically discovered by the PlatformRegistry.
 */
export const PLATFORM_IDPlatformModule: PlatformModule = convertPlatformPluginToModule(
  PLATFORM_IDPlugin as any,
  platformIdSchema,
  {
    id: 'PLATFORM_ID',
    displayName: 'PLATFORM_DISPLAY_NAME',
    version: '1.0.0',
    category: 'social', // 'social' | 'communication' | etc.
    icon: '📱', // Platform icon
    color: '#000000', // Platform brand color
    description: 'PLATFORM_DESCRIPTION',
    author: 'EventPromoter',
    license: 'MIT'
  }
)

// Export as default for discovery
export default PLATFORM_IDPlatformModule

