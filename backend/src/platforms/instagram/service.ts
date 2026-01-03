// Instagram platform service

import { InstagramContent, InstagramConfig } from './types.js'
import { InstagramValidator } from './validator.js'

export class InstagramService {
  private config: InstagramConfig

  constructor(config: InstagramConfig = {}) {
    this.config = config
  }

  validateContent(content: InstagramContent) {
    return InstagramValidator.validateContent(content)
  }

  transformForAPI(content: InstagramContent) {
    return {
      caption: content.caption,
      ...(content.image && { image_url: content.image })
    }
  }

  generateHashtags(baseTags: string[]): string[] {
    const instagramTags = [...baseTags]

    // Instagram loves hashtags
    if (!instagramTags.some(tag => tag.includes('instagram') || tag.includes('insta'))) {
      instagramTags.push('#Event', '#Nightlife')
    }

    return instagramTags.map(tag =>
      tag.startsWith('#') ? tag : `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`
    ).filter(tag => tag.length > 1 && tag.length <= 100)
  }

  getRequirements() {
    return {
      maxLength: 2200,
      supports: ['text', 'image'],
      required: ['caption', 'image'],
      recommended: ['hashtags', 'location']
    }
  }
}
