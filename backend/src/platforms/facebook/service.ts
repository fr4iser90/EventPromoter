// Facebook platform service

import { FacebookContent, FacebookConfig } from './types.js'
import { FacebookValidator } from './validator.js'
import { renderFacebookPreview } from './preview.js'

export class FacebookService {
  private config: FacebookConfig

  constructor(config: FacebookConfig = {}) {
    this.config = config
  }

  validateContent(content: FacebookContent) {
    return FacebookValidator.validateContent(content)
  }

  getCharacterCount(content: FacebookContent) {
    return FacebookValidator.getCharacterCount(content)
  }

  transformForAPI(content: FacebookContent) {
    return {
      message: content.text,
      ...(content.link && { link: content.link }),
      ...(content.image && { picture: content.image }),
      ...(this.config.pageId && { id: this.config.pageId })
    }
  }

  generateHashtags(baseTags: string[]): string[] {
    const facebookTags = [...baseTags]

    // Add Facebook-specific tags
    if (!facebookTags.some(tag => tag.includes('facebook') || tag.includes('fb'))) {
      facebookTags.push('#Event')
    }

    // Ensure hashtags are properly formatted
    return facebookTags.map(tag =>
      tag.startsWith('#') ? tag : `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`
    ).filter(tag => tag.length > 1 && tag.length <= 100)
  }

  getRequirements() {
    return {
      maxLength: 63206,
      supports: ['text', 'image', 'link'],
      required: ['text'],
      recommended: ['image', 'link']
    }
  }

  getOptimizationTips(content: FacebookContent): string[] {
    const tips: string[] = []
    const validation = this.validateContent(content)

    if (validation.characterCount < 50) {
      tips.push('Consider adding more content for better engagement')
    }

    if (!content.image) {
      tips.push('Facebook posts with images get 2.3x more engagement')
    }

    if (!content.link && !content.image) {
      tips.push('Add an image or link to increase visibility')
    }

    const hashtags = content.text.match(/#\w+/g) || []
    if (hashtags.length > 2) {
      tips.push('Facebook recommends 1-2 hashtags per post')
    }

    return tips
  }

  async renderPreview(options: {
    content: Record<string, any>
    schema: any
    mode?: string
    client?: string
    darkMode?: boolean
  }): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
    return renderFacebookPreview(options)
  }
}
