/**
 * Twitter API Publisher
 * 
 * Direct API integration for publishing tweets using Twitter API v2.
 * 
 * @module platforms/twitter/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export interface TwitterPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * API Publisher for Twitter
 * 
 * Uses Twitter API v2 to post tweets with media support.
 */
export class TwitterApiPublisher implements TwitterPublisher {
  private async getCredentials(): Promise<any> {
    const config = await ConfigService.getConfig('twitter') || {}
    return {
      bearerToken: config.bearerToken || process.env.TWITTER_BEARER_TOKEN,
      apiKey: config.apiKey || process.env.TWITTER_API_KEY,
      apiSecret: config.apiSecret || process.env.TWITTER_API_SECRET,
      accessToken: config.accessToken || process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: config.accessTokenSecret || process.env.TWITTER_ACCESS_TOKEN_SECRET,
    }
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult> {
    try {
      const credentials = await this.getCredentials()

      if (!credentials.bearerToken && !credentials.accessToken) {
        return {
          success: false,
          error: 'Twitter API credentials not configured (need bearerToken or accessToken)'
        }
      }

      // Format text with hashtags
      let text = content.text || content.body || ''
      if (hashtags.length > 0) {
        const formattedHashtags = hashtags
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
          .join(' ')
        text = `${text} ${formattedHashtags}`.trim()
      }

      // Validate length (280 chars for Twitter)
      if (text.length > 280) {
        return {
          success: false,
          error: `Tweet exceeds 280 characters (${text.length} chars)`
        }
      }

      // Upload media if provided
      let mediaId: string | undefined
      if (files.length > 0 && files[0].url) {
        try {
          mediaId = await this.uploadMedia(files[0].url, credentials)
        } catch (error: any) {
          console.warn('Media upload failed, posting text only:', error.message)
        }
      }

      // Post tweet
      const tweetPayload: any = {
        text: text
      }

      if (mediaId) {
        tweetPayload.media = {
          media_ids: [mediaId]
        }
      }

      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.bearerToken || credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tweetPayload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.detail || `Twitter API error: ${response.status} ${response.statusText}`
        }
      }

      const data = await response.json()
      const tweetId = data.data?.id

      return {
        success: true,
        postId: tweetId,
        url: tweetId ? `https://twitter.com/i/web/status/${tweetId}` : undefined
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to publish tweet via API'
      }
    }
  }

  private async uploadMedia(mediaUrl: string, credentials: any): Promise<string> {
    // Download media first
    const mediaResponse = await fetch(mediaUrl)
    if (!mediaResponse.ok) {
      throw new Error(`Failed to download media: ${mediaResponse.statusText}`)
    }

    const mediaBuffer = await mediaResponse.arrayBuffer()
    const base64Media = Buffer.from(mediaBuffer).toString('base64')

    // Upload to Twitter
    const uploadResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.bearerToken || credentials.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        media_data: base64Media
      })
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}))
      throw new Error(errorData.error || 'Media upload failed')
    }

    const uploadData = await uploadResponse.json()
    return uploadData.media_id_string
  }
}

export default new TwitterApiPublisher()
