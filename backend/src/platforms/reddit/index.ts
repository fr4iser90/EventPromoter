// Reddit Platform Plugin
import { PlatformPlugin, PlatformCapability } from '../../types/index.js'
import { RedditParser } from './parser.js'
import { RedditService } from './service.js'
import { REDDIT_TEMPLATES } from './templates.js'
import { RedditValidator } from './validator.js'

const RedditCapabilities: PlatformCapability[] = [
  { type: 'text', maxLength: 40000, required: true },
  { type: 'link', required: false },
  { type: 'image', required: false },
  { type: 'hashtag', required: false }
]

const RedditPlugin: PlatformPlugin = {
  name: 'reddit',
  version: '1.0.0',
  displayName: 'Reddit',
  capabilities: RedditCapabilities,

  parser: RedditParser,
  service: new RedditService(),
  validator: {
    validate: (content: any) => RedditValidator.validateContent(content),
    getLimits: () => ({
      maxLength: 40000, // Reddit text posts can be long
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
      requestsPerHour: 600, // Reddit has generous rate limits
      requestsPerDay: 10000
    },
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
}

export default RedditPlugin
