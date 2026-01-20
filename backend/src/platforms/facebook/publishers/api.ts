/**
 * Facebook API Publisher
 * 
 * Direct API integration for publishing posts using Facebook Graph API.
 * 
 * @module platforms/facebook/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import fs from 'fs'
import path from 'path'

export interface FacebookPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * API Publisher for Facebook
 * 
 * Uses Facebook Graph API to post to pages.
 */
export class FacebookApiPublisher implements FacebookPublisher {
  private async getCredentials(): Promise<any> {
    const config = await ConfigService.getConfig('facebook') || {}
    return {
      pageAccessToken: config.pageAccessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      pageId: config.pageId || process.env.FACEBOOK_PAGE_ID,
      appId: config.appId || process.env.FACEBOOK_APP_ID,
      appSecret: config.appSecret || process.env.FACEBOOK_APP_SECRET,
    }
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult> {
    try {
      const credentials = await this.getCredentials()

      if (!credentials.pageAccessToken || !credentials.pageId) {
        return {
          success: false,
          error: 'Facebook API credentials not configured (need pageAccessToken and pageId)'
        }
      }

      // Format message with hashtags
      let message = content.text || content.body || content.message || ''
      if (hashtags.length > 0) {
        const formattedHashtags = hashtags
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
          .join(' ')
        message = `${message} ${formattedHashtags}`.trim()
      }

      // Upload photo if provided
      if (files.length > 0) {
        return await this.postWithPhoto(credentials, message, files[0])
      }

      // Post text only
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${credentials.pageId}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            access_token: credentials.pageAccessToken
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error?.message || `Facebook API error: ${response.status} ${response.statusText}`
        }
      }

      const data = await response.json()
      const postId = data.id

      return {
        success: true,
        postId: postId,
        url: postId ? `https://facebook.com/${postId.replace('_', '/posts/')}` : undefined
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to publish to Facebook via API'
      }
    }
  }

  private async postWithPhoto(credentials: any, message: string, file: any): Promise<PostResult> {
    // Upload photo directly from filesystem
    let photoPath: string
    let fileName: string

    if (file.path && fs.existsSync(file.path)) {
      // Direct file upload from filesystem
      photoPath = file.path
      fileName = file.name || path.basename(file.path) || 'photo.jpg'
    } else if (file.url) {
      // Fallback: Download from URL to temp file (if path not available)
      const tempDir = path.join(process.cwd(), 'temp', 'facebook-uploads')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
      const tempPath = path.join(tempDir, `${Date.now()}-${file.name || 'photo.jpg'}`)
      
      const photoResponse = await fetch(file.url)
      if (!photoResponse.ok) {
        throw new Error(`Failed to download photo: ${photoResponse.statusText}`)
      }
      const arrayBuffer = await photoResponse.arrayBuffer()
      fs.writeFileSync(tempPath, Buffer.from(arrayBuffer))
      photoPath = tempPath
      fileName = file.name || 'photo.jpg'
    } else {
      throw new Error('File must have either path or url')
    }

    // Upload to Facebook Photos using FormData with file stream
    const FormData = (await import('form-data')).default
    const formData = new FormData()
    formData.append('message', message)
    formData.append('access_token', credentials.pageAccessToken)
    formData.append('source', fs.createReadStream(photoPath), fileName)

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.pageId}/photos`,
      {
        method: 'POST',
        body: formData as any
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error?.message || `Facebook photo upload error: ${response.status}`
      }
    }

    const data = await response.json()
    const postId = data.post_id || data.id

    return {
      success: true,
      postId: postId,
      url: postId ? `https://facebook.com/${postId.replace('_', '/posts/')}` : undefined
    }
  }
}

export default new FacebookApiPublisher()
