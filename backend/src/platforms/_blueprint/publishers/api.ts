/**
 * PLATFORM_ID API Publisher
 * 
 * Direct API integration for publishing content without n8n.
 * 
 * @module platforms/PLATFORM_ID/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export interface PlatformPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * API Publisher for PLATFORM_ID
 * 
 * Implements direct API calls to the platform's API.
 */
export class PLATFORM_IDApiPublisher implements PlatformPublisher {
  private async getCredentials(): Promise<any> {
    // Load credentials from config or environment
    const config = await ConfigService.getConfig('PLATFORM_ID') || {}
    return {
      apiKey: config.apiKey || process.env.PLATFORM_ID_API_KEY,
      apiSecret: config.apiSecret || process.env.PLATFORM_ID_API_SECRET,
      accessToken: config.accessToken || process.env.PLATFORM_ID_ACCESS_TOKEN,
      // Add other required credentials
    }
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult> {
    try {
      const credentials = await this.getCredentials()

      if (!credentials.apiKey || !credentials.accessToken) {
        return {
          success: false,
          error: 'API credentials not configured'
        }
      }

      // Transform content for API
      const apiPayload = this.transformContent(content, files, hashtags)

      // Make API call
      const response = await fetch('https://api.PLATFORM_ID.com/v1/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.message || `API error: ${response.status} ${response.statusText}`
        }
      }

      const data = await response.json()

      return {
        success: true,
        postId: data.id || data.postId,
        url: data.url || data.permalink
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to publish via API'
      }
    }
  }

  private transformContent(content: any, files: any[], hashtags: string[]): any {
    // Transform content to platform-specific API format
    return {
      text: content.text || content.body,
      media: files.map(f => f.url || f.path),
      hashtags: hashtags,
      // Add platform-specific fields
    }
  }
}

export default new PLATFORM_IDApiPublisher()
