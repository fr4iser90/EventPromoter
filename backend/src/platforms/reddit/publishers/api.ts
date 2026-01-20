/**
 * Reddit API Publisher
 * 
 * Direct API integration for publishing posts using Reddit API.
 * 
 * @module platforms/reddit/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import fs from 'fs'
import path from 'path'

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

      // Determine post type and handle images
      let payload: any

      if (files.length > 0) {
        const file = files[0]
        
        // Check if it's an image file
        const isImage = file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                       file.type?.startsWith('image/')

        if (isImage) {
          // Image post using Reddit's 3-step lease-based upload system
          try {
            const mediaAssetId = await this.uploadImageToReddit(file, accessToken, credentials.userAgent)
            
            payload = {
              kind: 'image',
              sr: subreddit,
              title: title,
              media_asset_id: mediaAssetId,
              resubmit: true,
              api_type: 'json'
            }
          } catch (error: any) {
            return {
              success: false,
              error: `Failed to upload image to Reddit: ${error.message}`
            }
          }
        } else {
          // Link post (non-image file) - use URL if available
          if (file.url) {
            payload = {
              kind: 'link',
              sr: subreddit,
              title: title,
              url: file.url,
              text: text || undefined,
              api_type: 'json'
            }
          } else {
            return {
              success: false,
              error: 'Non-image files require a URL for Reddit link posts'
            }
          }
        }
      } else {
        // Text post
        payload = {
          kind: 'self',
          sr: subreddit,
          title: title,
          text: text,
          api_type: 'json'
        }
      }

      const response = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': credentials.userAgent
        },
        body: new URLSearchParams(payload as any)
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

  /**
   * Reddit's 3-step lease-based image upload system
   * 
   * Step 1: Request upload lease (get asset_id and S3 upload details)
   * Step 2: Upload image to S3 (temporary storage, not public!)
   * Step 3: Return asset_id (used in submit, NOT URL!)
   */
  private async uploadImageToReddit(file: any, accessToken: string, userAgent: string): Promise<string> {
    // Read file from filesystem or download from URL
    let fileBuffer: Buffer
    let fileName: string
    let mimeType: string

    if (file.path && fs.existsSync(file.path)) {
      // Direct file read from filesystem
      fileBuffer = fs.readFileSync(file.path)
      fileName = file.name || path.basename(file.path) || 'image.jpg'
      mimeType = file.type || this.getMimeTypeFromFilename(fileName)
    } else if (file.url) {
      // Fallback: Download from URL (if path not available)
      const response = await fetch(file.url)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
      fileName = file.name || 'image.jpg'
      mimeType = file.type || response.headers.get('content-type') || 'image/jpeg'
    } else {
      throw new Error('File must have either path or url')
    }

    // Step 1: Request upload lease
    const leaseResponse = await fetch('https://oauth.reddit.com/api/media/asset.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': userAgent
      },
      body: JSON.stringify({
        filepath: fileName,
        mimetype: mimeType
      })
    })

    if (!leaseResponse.ok) {
      const errorData = await leaseResponse.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to get upload lease: ${leaseResponse.statusText}`)
    }

    const leaseData = await leaseResponse.json()
    const assetId = leaseData.asset?.asset_id
    const uploadAction = leaseData.args?.action
    const uploadFields = leaseData.args?.fields

    if (!assetId || !uploadAction || !uploadFields) {
      throw new Error('Invalid lease response from Reddit')
    }

    // Step 2: Upload image to S3 (temporary storage, not public!)
    const FormData = (await import('form-data')).default
    const formData = new FormData()

    // Add all fields Reddit gave us (required for S3 upload)
    for (const [key, value] of Object.entries(uploadFields)) {
      formData.append(key, value as string)
    }

    // Add the file
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: mimeType
    })

    // Upload to S3 (this is Reddit's internal S3, not public!)
    const uploadUrl = uploadAction.startsWith('https:') ? uploadAction : `https:${uploadAction}`
    const s3Response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData as any
    })

    if (!s3Response.ok) {
      throw new Error(`Failed to upload to S3: ${s3Response.statusText}`)
    }

    // Step 3: Return asset_id (NOT the S3 URL!)
    // The asset_id will be used in the submit request
    return assetId
  }

  /**
   * Get MIME type from filename
   */
  private getMimeTypeFromFilename(filename: string): string {
    const ext = path.extname(filename).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }
    return mimeTypes[ext] || 'image/jpeg'
  }
}

export default new RedditApiPublisher()
