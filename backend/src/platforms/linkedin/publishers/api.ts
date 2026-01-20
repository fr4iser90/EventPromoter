/**
 * LinkedIn API Publisher
 * 
 * Direct API integration for publishing posts using LinkedIn API.
 * 
 * @module platforms/linkedin/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import fs from 'fs'
import path from 'path'

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

      // Add media if files provided
      if (files.length > 0) {
        try {
          const assetUrn = await this.uploadMediaAsset(files[0], credentials)
          payload.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE'
          payload.specificContent['com.linkedin.ugc.ShareContent'].media = [{
            status: 'READY',
            media: assetUrn
          }]
        } catch (error: any) {
          console.warn('LinkedIn media upload failed, posting text only:', error.message)
        }
      } else if (content.link) {
        // Add link if provided (fallback)
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

  /**
   * Upload media asset to LinkedIn and return URN
   * LinkedIn Assets API requires a two-step process:
   * 1. Register upload (get upload URL)
   * 2. Upload file to that URL
   * 3. Get asset URN
   */
  private async uploadMediaAsset(file: any, credentials: any): Promise<string> {
    // Read file from filesystem or download from URL
    let fileBuffer: Buffer
    let fileName: string
    let fileSize: number

    if (file.path && fs.existsSync(file.path)) {
      // Direct file read from filesystem
      fileBuffer = fs.readFileSync(file.path)
      fileName = file.name || path.basename(file.path) || 'image.jpg'
      fileSize = fs.statSync(file.path).size
    } else if (file.url) {
      // Fallback: Download from URL (if path not available)
      const response = await fetch(file.url)
      if (!response.ok) {
        throw new Error(`Failed to download media: ${response.statusText}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
      fileName = file.name || 'image.jpg'
      fileSize = fileBuffer.length
    } else {
      throw new Error('File must have either path or url')
    }

    // Determine author (profile or organization)
    const authorId = credentials.organizationId 
      ? `urn:li:organization:${credentials.organizationId}`
      : `urn:li:person:${credentials.profileId}`

    // Step 1: Register upload
    const registerResponse = await fetch(
      'https://api.linkedin.com/v2/assets?action=registerUpload',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: authorId,
            serviceRelationships: [{
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }]
          }
        })
      }
    )

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to register upload with LinkedIn')
    }

    const registerData = await registerResponse.json()
    const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl
    const assetUrn = registerData.value.asset

    // Step 2: Upload file to LinkedIn
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'image/jpeg'
      },
      body: fileBuffer
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file to LinkedIn: ${uploadResponse.statusText}`)
    }

    return assetUrn
  }
}

export default new LinkedInApiPublisher()
