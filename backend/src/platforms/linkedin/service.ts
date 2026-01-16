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

  /**
   * Extract human-readable target from LinkedIn content
   * Returns profile or "Company Page"
   */
  extractTarget(content: LinkedInContent): string {
    if (content.profile) {
      return content.profile
    }
    if (content.companyPage) {
      return content.companyPage
    }
    return 'Company Page'
  }

  /**
   * Extract response data from n8n/API/Playwright response
   * LinkedIn API returns: { json: { id } }
   */
  extractResponseData(response: any): { postId?: string, url?: string, success: boolean, error?: string } {
    // Handle n8n LinkedIn node response: { json: { id } }
    if (response.json) {
      const data = response.json
      const postId = data.id || data.urn?.split(':').pop()
      const url = data.url || (postId ? `https://linkedin.com/feed/update/${postId}` : undefined)
      
      return {
        success: true,
        postId: postId?.toString(),
        url
      }
    }

    // Handle direct API response
    if (response.id || response.urn) {
      const postId = response.id || response.urn?.split(':').pop()
      return {
        success: true,
        postId: postId?.toString(),
        url: response.url || `https://linkedin.com/feed/update/${postId}`
      }
    }

    // Handle error response
    if (response.error || response.success === false) {
      return {
        success: false,
        error: response.error || response.message || 'Unknown error'
      }
    }

    // If response has success field, use it
    if (typeof response.success === 'boolean') {
      return {
        success: response.success,
        postId: response.postId,
        url: response.url,
        error: response.error
      }
    }

    // Default: assume success
    return {
      success: true,
      postId: response.postId,
      url: response.url
    }
  }
}
