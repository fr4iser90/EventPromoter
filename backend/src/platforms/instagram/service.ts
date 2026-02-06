// Instagram platform service

import { InstagramContent, InstagramConfig } from './types.js'
import { InstagramValidator } from './validator.js'
import { renderInstagramPreview } from './preview.js'

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

  async renderPreview(options: {
    content: Record<string, any>
    schema: any
    mode?: string
    client?: string
  }): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
    return renderInstagramPreview(options)
  }

  /**
   * Extract human-readable target from Instagram content
   * Returns account or "Feed"
   */
  extractTarget(content: InstagramContent): string {
    if (content.account) {
      return content.account
    }
    return 'Feed'
  }

  /**
   * Extract response data from n8n/API/Playwright response
   * Instagram API returns: { json: { id } }
   */
  extractResponseData(response: any): { postId?: string, url?: string, success: boolean, error?: string } {
    // Handle n8n Instagram node response: { json: { id } }
    if (response.json) {
      const data = response.json
      const postId = data.id || data.media_id
      const url = data.url || (postId ? `https://instagram.com/p/${postId}/` : undefined)
      
      return {
        success: true,
        postId: postId?.toString(),
        url
      }
    }

    // Handle direct API response
    if (response.id || response.media_id) {
      const postId = response.id || response.media_id
      return {
        success: true,
        postId: postId?.toString(),
        url: response.url || `https://instagram.com/p/${postId}/`
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
