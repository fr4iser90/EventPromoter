/**
 * LinkedIn API Publisher
 * 
 * Direct API integration for publishing posts using LinkedIn API.
 * 
 * @module platforms/linkedin/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export interface LinkedInPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * API Publisher for LinkedIn
 * 
 * Uses LinkedIn API to post updates.
 */
export class LinkedInApiPublisher implements LinkedInPublisher {
  private async getCredentials(): Promise<any> {
    const config = await ConfigService.getConfig('linkedin') || {}
    return {
      accessToken: config.accessToken || process.env.LINKEDIN_ACCESS_TOKEN,
      profileId: config.profileId || process.env.LINKEDIN_PROFILE_ID,
      organizationId: config.organizationId || process.env.LINKEDIN_ORGANIZATION_ID,
    }
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult> {
    try {
      const credentials = await this.getCredentials()

      if (!credentials.accessToken) {
        return {
          success: false,
          error: 'LinkedIn API credentials not configured (need accessToken)'
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

      // Determine author (profile or organization)
      const authorId = credentials.organizationId 
        ? `urn:li:organization:${credentials.organizationId}`
        : `urn:li:person:${credentials.profileId}`

      // Build payload
      const payload: any = {
        author: authorId,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      }

      // Add link if provided
      if (content.link) {
        payload.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE'
        payload.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          originalUrl: content.link
        }]
      }

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.message || errorData.error?.message || `LinkedIn API error: ${response.status} ${response.statusText}`
        }
      }

      const data = await response.json()
      const postId = data.id

      return {
        success: true,
        postId: postId,
        url: postId ? `https://linkedin.com/feed/update/${postId}` : undefined
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to publish to LinkedIn via API'
      }
    }
  }
}

export default new LinkedInApiPublisher()
