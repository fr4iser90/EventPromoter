/**
 * Instagram API Publisher
 * 
 * Direct API integration for publishing posts using Instagram Graph API.
 * 
 * @module platforms/instagram/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import fs from 'fs'
import path from 'path'

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

      if (files.length === 0) {
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

      // Step 1: Upload image to Facebook Photos first (to get public URL)
      // Instagram Graph API requires publicly accessible image URL
      // We upload to Facebook Photos, then use that URL for Instagram
      const imageUrl = await this.uploadImageToFacebookPhotos(files[0], credentials)

      // Step 2: Create media container with public image URL
      const containerResponse = await fetch(
        `https://graph.facebook.com/v18.0/${credentials.instagramAccountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: imageUrl,
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

  /**
   * Upload image to Facebook Photos to get publicly accessible URL
   * Instagram Graph API requires publicly accessible image URLs
   */
  private async uploadImageToFacebookPhotos(file: any, credentials: any): Promise<string> {
    // If file has a path, read from filesystem
    let imagePath: string
    let fileName: string

    if (file.path && fs.existsSync(file.path)) {
      // Direct file upload from filesystem
      imagePath = file.path
      fileName = file.name || path.basename(file.path) || 'image.jpg'
    } else if (file.url) {
      // Fallback: Download from URL to temp file (if path not available)
      fileName = file.name || 'image.jpg'
      const tempDir = path.join(process.cwd(), 'temp', 'instagram-uploads')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
      const tempPath = path.join(tempDir, `${Date.now()}-${fileName}`)
      
      const response = await fetch(file.url)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      fs.writeFileSync(tempPath, Buffer.from(arrayBuffer))
      imagePath = tempPath
    } else {
      throw new Error('File must have either path or url')
    }

    // Upload to Facebook Photos using FormData with file stream
    const FormData = (await import('form-data')).default
    const formData = new FormData()
    formData.append('source', fs.createReadStream(imagePath), fileName)
    formData.append('access_token', credentials.accessToken)

    // Use Facebook Page ID if available, otherwise use Instagram Account ID's associated page
    const pageId = credentials.facebookPageId || credentials.instagramAccountId

    const uploadResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/photos`,
      {
        method: 'POST',
        body: formData as any
      }
    )

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Failed to upload image to Facebook Photos')
    }

    const uploadData = await uploadResponse.json()
    // Return the public URL of the uploaded photo
    return uploadData.images?.[0]?.source || `https://graph.facebook.com/v18.0/${uploadData.id}/picture`
  }
}

export default new InstagramApiPublisher()
