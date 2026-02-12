/**
 * Email Platform Module
 * 
 * Self-discovering platform architecture with schema-driven UI.
 * 
 * @module platforms/email/index
 */

import { PlatformModule } from '../../types/platformModule.js'
import { EmailParser } from './parser.js'
import { EmailService } from './service.js'
import { EMAIL_TEMPLATES } from './templates/index.js'
import { EmailValidator } from './validator.js'
import { emailSchema } from './schema/index.js'

/**
 * Email Platform Module
 * 
 * Complete platform module using the self-discovering architecture.
 * This module will be automatically discovered by the PlatformRegistry.
 */
export const EmailPlatformModule: PlatformModule = {
  metadata: {
    id: 'email',
    displayName: 'Email',
    version: '1.0.0',
    category: 'communication',
    icon: '📧',
    color: '#EA4335',
    description: 'Send event announcements via email with rich HTML content',
    author: 'EventPromoter',
    dataSource: 'targets.json',
    publishingModeStatus: {
      n8n: {
        status: 'partial',
        message: 'Working, but needs CID image improvements'
      },
      api: {
        status: 'working',
        message: 'Fully functional'
      },
      playwright: {
        status: 'not-implemented',
        message: 'Not yet implemented'
      }
    }
  },
  schema: emailSchema,
  capabilities: {
    supportsText: true,
    supportsImages: true,
    supportsVideo: false,
    supportsLinks: true,
    supportsHashtags: false,
    supportsMentions: false,
    supportsPolls: false,
    supportsScheduling: false,
    requiresAuth: false
  },
  service: new EmailService(),
  parser: EmailParser,
  validator: {
    validate: (content: any) => EmailValidator.validateContent(content),
    getLimits: () => ({
      maxLength: 50000,
      maxImages: 10,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
    })
  },
  templates: EMAIL_TEMPLATES,
  config: {
    apiEndpoints: {
      sendEmail: '/api/email/send'
    },
    rateLimits: {
      requestsPerHour: 100,
      requestsPerDay: 1000
    },
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
  }
}

// Export as default for discovery
export default EmailPlatformModule
