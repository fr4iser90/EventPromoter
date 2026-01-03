// Facebook Platform Plugin
import { PlatformPlugin, PlatformCapability } from '../../types/index.js'
import { FacebookParser } from './parser.js'
import { FacebookService } from './service.js'
import { FACEBOOK_TEMPLATES } from './templates.js'
import { FacebookValidator } from './validator.js'

const FacebookCapabilities: PlatformCapability[] = [
  { type: 'text', maxLength: 63206, required: true },
  { type: 'image', required: false },
  { type: 'link', required: false },
  { type: 'hashtag', required: false }
]

const FacebookPlugin: PlatformPlugin = {
  name: 'facebook',
  version: '1.0.0',
  displayName: 'Facebook',
  capabilities: FacebookCapabilities,

  parser: FacebookParser,
  service: new FacebookService(),
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

export default FacebookPlugin
