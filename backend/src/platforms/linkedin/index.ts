// LinkedIn Platform Plugin
import { PlatformPlugin, PlatformCapability } from '../../types/index.js'
import { LinkedInParser } from './parser.js'
import { LinkedInService } from './service.js'
import { LINKEDIN_TEMPLATES } from './templates.js'
import { LinkedInValidator } from './validator.js'

const LinkedInCapabilities: PlatformCapability[] = [
  { type: 'text', maxLength: 3000, required: true },
  { type: 'link', required: false },
  { type: 'image', required: false },
  { type: 'hashtag', required: false }
]

const LinkedInPlugin: PlatformPlugin = {
  name: 'linkedin',
  version: '1.0.0',
  displayName: 'LinkedIn',
  capabilities: LinkedInCapabilities,

  parser: LinkedInParser,
  service: new LinkedInService(),
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

export default LinkedInPlugin
