/**
 * Instagram API Publisher
 * 
 * Direct API integration for publishing posts using Instagram Graph API.
 * 
 * @module platforms/instagram/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export interface InstagramPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * API Publisher for Instagram
 * 
 * Uses Instagram Graph API to post photos.
 * Note: Instagram API requires a Facebook Business account and app.
 */
export class InstagramApiPublisher implements InstagramPublisher {
  private async getCredentials(): Promise<any> {
    const config = await ConfigService.getConfig('instagram') || {}
    return {
      accessToken: config.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN,
      instagramAccountId: config.instagramAccountId || process.env.INSTAGRAM_ACCOUNT_ID,
      facebookPageId: config.facebookPageId || process.env.FACEBOOK_PAGE_ID,
    }
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult> {
    try {
      const credentials = await this.getCredentials()

      if (!credentials.accessToken || !credentials.instagramAccountId) {
        return {
          success: false,
          error: 'Instagram API credentials not configured (need accessToken and instagramAccountId)'
        }
      }

      if (files.length === 0 || !files[0].url) {
        return {
          success: false,
          error: 'Instagram requires at least one image'
        }
      }

      // Format caption with hashtags
      let caption = content.caption || content.text || content.body || ''
      if (hashtags.length > 0) {
        const formattedHashtags = hashtags
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
          .join(' ')
        caption = `${caption} ${formattedHashtags}`.trim()
      }

      // Step 1: Create media container
      const containerResponse = await fetch(
        `https://graph.facebook.com/v18.0/${credentials.instagramAccountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: files[0].url,
            caption: caption,
            access_token: credentials.accessToken
          })
        }
      )

      if (!containerResponse.ok) {
        const errorData = await containerResponse.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error?.message || `Instagram API error: ${containerResponse.status}`
        }
      }

      const containerData = await containerResponse.json()
      const creationId = containerData.id

      if (!creationId) {
        return {
          success: false,
          error: 'Failed to create media container'
        }
      }

      // Step 2: Publish the media container
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${credentials.instagramAccountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: creationId,
            access_token: credentials.accessToken
          })
        }
      )

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error?.message || `Instagram publish error: ${publishResponse.status}`
        }
      }

      const publishData = await publishResponse.json()
      const mediaId = publishData.id

      return {
        success: true,
        postId: mediaId,
        url: mediaId ? `https://instagram.com/p/${mediaId}/` : undefined
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to publish to Instagram via API'
      }
    }
  }
}

export default new InstagramApiPublisher()
