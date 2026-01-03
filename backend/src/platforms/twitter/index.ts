// Twitter Platform Plugin
import { PlatformPlugin, PlatformCapability } from '../../types/index.js'
import { TwitterParser } from './parser.js'
import { TwitterService } from './service.js'
import { TWITTER_TEMPLATES } from './templates.js'
import { TwitterValidator } from './validator.js'

const TwitterCapabilities: PlatformCapability[] = [
  { type: 'text', maxLength: 280, required: true },
  { type: 'image', required: false },
  { type: 'link', required: false },
  { type: 'hashtag', required: false },
  { type: 'mention', required: false }
]

const TwitterPlugin: PlatformPlugin = {
  name: 'twitter',
  version: '1.0.0',
  displayName: 'Twitter/X',
  capabilities: TwitterCapabilities,

  parser: TwitterParser,
  service: new TwitterService(),
  validator: {
    validate: (content: any) => TwitterValidator.validateContent(content),
    getLimits: () => ({
      maxLength: 280,
      maxImages: 1,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    })
  },
  templates: TWITTER_TEMPLATES,

  config: {
    apiEndpoints: {
      postTweet: 'https://api.twitter.com/2/tweets',
      uploadMedia: 'https://upload.twitter.com/1.1/media/upload.json'
    },
    rateLimits: {
      requestsPerHour: 300,
      requestsPerDay: 3000
    },
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
}

export default TwitterPlugin
