// LinkedIn platform service

import { LinkedInContent, LinkedInConfig } from './types.js'
import { LinkedInValidator } from './validator.js'
import { renderLinkedInPreview } from './preview.js'

export class LinkedInService {
  private config: LinkedInConfig

  constructor(config: LinkedInConfig = {}) {
    this.config = config
  }

  validateContent(content: LinkedInContent) {
    return LinkedInValidator.validateContent(content)
  }

  transformForAPI(content: LinkedInContent) {
    return {
      author: `urn:li:person:${this.config.profileId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.text
          },
          ...(content.link && {
            shareMediaCategory: 'ARTICLE',
            media: [{
              status: 'READY',
              originalUrl: content.link
            }]
          })
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }
  }

  generateHashtags(baseTags: string[]): string[] {
    const linkedinTags = [...baseTags]

    // LinkedIn prefers professional hashtags
    if (!linkedinTags.some(tag => tag.includes('linkedin') || tag.includes('professional'))) {
      linkedinTags.push('#Event', '#Networking')
    }

    return linkedinTags.map(tag =>
      tag.startsWith('#') ? tag : `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`
    ).filter(tag => tag.length > 1 && tag.length <= 100)
  }

  getRequirements() {
    return {
      maxLength: 3000,
      supports: ['text', 'link', 'image'],
      required: ['text'],
      recommended: ['professional-tone', 'industry-hashtags']
    }
  }

  async renderPreview(options: {
    content: Record<string, any>
    schema: any
    mode?: string
    client?: string
    darkMode?: boolean
  }): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
    return renderLinkedInPreview(options)
  }
}
