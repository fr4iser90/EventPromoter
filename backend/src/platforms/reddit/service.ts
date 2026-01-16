// Reddit platform service

import { RedditContent, RedditConfig } from './types.js'
import { RedditValidator } from './validator.js'
import { renderRedditPreview } from './preview.js'

export class RedditService {
  private config: RedditConfig

  constructor(config: RedditConfig = {}) {
    this.config = config
  }

  validateContent(content: RedditContent) {
    return RedditValidator.validateContent(content)
  }

  formatSubreddit(subreddit: string) {
    return RedditValidator.formatSubreddit(subreddit)
  }

  getSubredditUrl(subreddit: string) {
    return RedditValidator.getSubredditUrl(subreddit)
  }

  transformForAPI(content: RedditContent) {
    return {
      title: content.title,
      text: content.text,
      sr: content.subreddit,
      ...(content.link && { url: content.link }),
      ...(content.image && { media: content.image })
    }
  }

  generateHashtags(baseTags: string[]): string[] {
    const redditTags = [...baseTags]

    // Reddit doesn't use traditional hashtags, but we can add relevant terms
    if (!redditTags.some(tag => tag.toLowerCase().includes('reddit'))) {
      redditTags.push('discussion')
    }

    return redditTags
  }

  getRequirements() {
    return {
      maxTitleLength: 300,
      supports: ['text', 'image', 'link'],
      required: ['title', 'text', 'subreddit'],
      recommended: ['image', 'link', 'detailed-description']
    }
  }

  getOptimizationTips(content: RedditContent): string[] {
    const tips: string[] = []
    const validation = this.validateContent(content)

    if (validation.titleLength < 30) {
      tips.push('Consider a more descriptive title (30+ characters)')
    }

    if (validation.titleLength > 100) {
      tips.push('Very long title - consider shortening for better visibility')
    }

    if (!content.text.includes('?')) {
      tips.push('Consider asking a question to encourage discussion')
    }

    if (content.text.length < 200) {
      tips.push('Reddit posts with more content tend to get better engagement')
    }

    if (!content.image && !content.link) {
      tips.push('Add an image or link to make your post more engaging')
    }

    // Subreddit-specific tips
    if (content.subreddit) {
      const sub = content.subreddit.toLowerCase()
      if (sub.includes('event') || sub.includes('party')) {
        tips.push('This appears to be an event subreddit - ensure you follow posting rules')
      }
    }

    return tips
  }

  getPostUrl(subreddit: string, postId?: string): string {
    const baseUrl = this.getSubredditUrl(subreddit)
    return postId ? `${baseUrl}/${postId}` : baseUrl
  }

  async renderPreview(options: {
    content: Record<string, any>
    schema: any
    mode?: string
    client?: string
    darkMode?: boolean
  }): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
    return renderRedditPreview(options)
  }

  /**
   * Extract human-readable target from Reddit content
   * Returns subreddit with r/ prefix
   */
  extractTarget(content: RedditContent): string {
    if (content.subreddit) {
      const subreddit = content.subreddit.toString()
      return subreddit.startsWith('r/') ? subreddit : `r/${subreddit}`
    }
    return 'No subreddit'
  }

  /**
   * Extract response data from n8n/API/Playwright response
   * Reddit API returns: { json: { id, name, url, permalink } }
   */
  extractResponseData(response: any): { postId?: string, url?: string, success: boolean, error?: string } {
    // Handle n8n response format: { json: { id, name, url, permalink } }
    if (response.json) {
      const data = response.json
      const postId = data.id || data.name?.replace('t3_', '')
      const url = data.url || data.permalink || (postId ? `https://reddit.com${data.permalink || ''}` : undefined)
      
      return {
        success: true,
        postId,
        url: url?.startsWith('http') ? url : url ? `https://reddit.com${url}` : undefined
      }
    }

    // Handle direct API response format: { id, name, url, permalink }
    if (response.id || response.name) {
      const postId = response.id || response.name?.replace('t3_', '')
      const url = response.url || response.permalink || (response.name ? `https://reddit.com/r/${response.subreddit}/comments/${postId}/` : undefined)
      
      return {
        success: true,
        postId,
        url: url?.startsWith('http') ? url : url ? `https://reddit.com${url}` : undefined
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

    // Default: assume success if we have any data
    return {
      success: true,
      postId: response.postId,
      url: response.url
    }
  }
}
