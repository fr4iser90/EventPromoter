// Twitter platform service

import { TwitterContent, TwitterConfig } from './types.js'
import { TwitterValidator } from './validator.js'

export class TwitterService {
  private config: TwitterConfig

  constructor(config: TwitterConfig = {}) {
    this.config = config
  }

  // Validate content for Twitter
  validateContent(content: TwitterContent) {
    return TwitterValidator.validateContent(content)
  }

  // Get character count
  getCharacterCount(content: TwitterContent) {
    return TwitterValidator.getCharacterCount(content)
  }

  // Get remaining characters
  getRemainingChars(content: TwitterContent) {
    return TwitterValidator.getRemainingChars(content)
  }

  // Transform content for Twitter API
  transformForAPI(content: TwitterContent) {
    return {
      text: content.text,
      ...(content.image && { media: { media_ids: [content.image] } }),
      ...(content.link && { text: `${content.text} ${content.link}` })
    }
  }

  // Generate Twitter-specific hashtags
  generateHashtags(baseTags: string[]): string[] {
    const twitterTags = [...baseTags]

    // Add Twitter-specific tags
    if (!twitterTags.some(tag => tag.includes('twitter') || tag.includes('tweet'))) {
      twitterTags.push('#Event')
    }

    // Ensure hashtags are properly formatted
    return twitterTags.map(tag =>
      tag.startsWith('#') ? tag : `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`
    ).filter(tag => tag.length > 1 && tag.length <= 100)
  }

  // Get platform requirements
  getRequirements() {
    return {
      maxLength: 280,
      supports: ['text', 'image', 'link'],
      required: ['text'],
      recommended: ['hashtags', 'link']
    }
  }

  // Check if content is optimized for Twitter
  getOptimizationTips(content: TwitterContent): string[] {
    const tips: string[] = []
    const validation = this.validateContent(content)

    if (validation.characterCount < 100) {
      tips.push('Consider adding more content for better engagement')
    }

    if (!content.text.includes('?') && !content.text.includes('!')) {
      tips.push('Add a question or call-to-action for better engagement')
    }

    if (!content.link && !content.image) {
      tips.push('Add an image or link to increase visibility')
    }

    const hashtags = content.text.match(/#\w+/g) || []
    if (hashtags.length === 0) {
      tips.push('Add 1-2 relevant hashtags')
    } else if (hashtags.length > 3) {
      tips.push('Too many hashtags - consider using 1-3')
    }

    return tips
  }
}
