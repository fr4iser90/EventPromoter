// Instagram Platform Plugin
import { PlatformPlugin, PlatformCapability } from '../../types/index.js'
import { InstagramParser } from './parser.js'
import { InstagramService } from './service.js'
import { INSTAGRAM_TEMPLATES } from './templates.js'
import { InstagramValidator } from './validator.js'

const InstagramCapabilities: PlatformCapability[] = [
  { type: 'text', maxLength: 2200, required: true },
  { type: 'image', required: true },
  { type: 'hashtag', required: false }
]

const InstagramPlugin: PlatformPlugin = {
  name: 'instagram',
  version: '1.0.0',
  displayName: 'Instagram',
  capabilities: InstagramCapabilities,

  parser: InstagramParser,
  service: new InstagramService(),
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

export default InstagramPlugin
