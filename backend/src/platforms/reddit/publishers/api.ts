/**
 * Reddit API Publisher
 * 
 * Direct API integration for publishing posts using Reddit API.
 * 
 * @module platforms/reddit/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export interface RedditPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * API Publisher for Reddit
 * 
 * Uses Reddit API to submit posts to subreddits.
 */
export class RedditApiPublisher implements RedditPublisher {
  private async getCredentials(): Promise<any> {
    const config = await ConfigService.getConfig('reddit') || {}
    return {
      clientId: config.clientId || process.env.REDDIT_CLIENT_ID,
      clientSecret: config.clientSecret || process.env.REDDIT_CLIENT_SECRET,
      username: config.username || process.env.REDDIT_USERNAME,
      password: config.password || process.env.REDDIT_PASSWORD,
      userAgent: config.userAgent || process.env.REDDIT_USER_AGENT || 'EventPromoter/1.0',
    }
  }

  private async getAccessToken(credentials: any): Promise<string> {
    // Reddit uses OAuth2 with client credentials
    const authString = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': credentials.userAgent
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to get Reddit access token')
    }

    const data = await response.json()
    return data.access_token
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult> {
    try {
      const credentials = await this.getCredentials()

      if (!credentials.clientId || !credentials.clientSecret || !credentials.username || !credentials.password) {
        return {
          success: false,
          error: 'Reddit API credentials not configured (need clientId, clientSecret, username, password)'
        }
      }

      const subreddit = content.subreddit || 'test' // Default to test subreddit
      const title = content.title || content.text?.substring(0, 300) || 'Event Post'
      const text = content.text || content.body || ''

      // Get access token
      const accessToken = await this.getAccessToken(credentials)

      // Determine post type
      const isLinkPost = files.length > 0 && files[0].url && !files[0].url.match(/\.(jpg|jpeg|png|gif)$/i)
      const isImagePost = files.length > 0 && files[0].url && files[0].url.match(/\.(jpg|jpeg|png|gif)$/i)

      let payload: any

      if (isLinkPost) {
        // Link post
        payload = {
          kind: 'link',
          sr: subreddit,
          title: title,
          url: files[0].url,
          text: text || undefined
        }
      } else if (isImagePost) {
        // Image post (upload image first)
        // Note: Reddit image upload is complex, for now we'll post as link
        payload = {
          kind: 'link',
          sr: subreddit,
          title: title,
          url: files[0].url,
          text: text || undefined
        }
      } else {
        // Text post
        payload = {
          kind: 'self',
          sr: subreddit,
          title: title,
          text: text
        }
      }

      const response = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': credentials.userAgent
        },
        body: new URLSearchParams(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || `Reddit API error: ${response.status} ${response.statusText}`
        }
      }

      const data = await response.json()
      const postId = data.json?.data?.name || data.json?.data?.id

      if (!postId) {
        return {
          success: false,
          error: 'Failed to get post ID from Reddit response'
        }
      }

      // Extract actual post ID from Reddit's format (e.g., "t3_abc123")
      const actualPostId = postId.replace('t3_', '')

      return {
        success: true,
        postId: actualPostId,
        url: `https://reddit.com/r/${subreddit}/comments/${actualPostId}/`
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to publish to Reddit via API'
      }
    }
  }
}

export default new RedditApiPublisher()
