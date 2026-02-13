/**
 * LinkedIn API Publisher
 * 
 * Direct API integration for publishing posts using LinkedIn API.
 * 
 * @module platforms/linkedin/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import { PublisherEventService, EventAwarePublisher } from '../../../services/publisherEventService.js'
import fs from 'fs'
import path from 'path'

export interface LinkedInPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult>
}

const LINKEDIN_API_STEP_IDS = {
  COMMON_VALIDATE_INPUT: 'common.validate_input',
  AUTH_VALIDATE_CREDENTIALS: 'auth.validate_credentials',
  MEDIA_UPLOAD: 'media.upload',
  PUBLISH_SUBMIT: 'publish.submit',
  PUBLISH_VERIFY_RESULT: 'publish.verify_result'
} as const

/**
 * API Publisher for LinkedIn
 * 
 * Uses LinkedIn API to post updates.
 */
export class LinkedInApiPublisher implements LinkedInPublisher, EventAwarePublisher {
  private eventEmitter?: PublisherEventService
  private publishRunId?: string

  setEventEmitter(emitter: PublisherEventService): void {
    this.eventEmitter = emitter
  }

  setPublishRunId(runId: string): void {
    this.publishRunId = runId
  }

  private getErrorCode(error: any): string {
    if (error?.code) return String(error.code)
    if (error?.status) return `HTTP_${error.status}`
    if (error?.type) return String(error.type)
    return 'UNKNOWN_ERROR'
  }

  private isRetryableError(error: any): boolean {
    const code = error?.code
    const status = error?.status
    if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND') return true
    if (typeof status === 'number' && status >= 500 && status < 600) return true
    if (status === 429) return true
    return false
  }

  private createError(message: string, code: string): Error {
    const err = new Error(message) as Error & { code?: string }
    err.code = code
    return err
  }

  private async executeContractStep<T>(
    stepId: string,
    publishRunId: string,
    fn: () => Promise<T> | T,
    message?: string,
    data?: any
  ): Promise<T> {
    const start = Date.now()
    this.eventEmitter?.stepStarted('linkedin', 'api', stepId, message || `Starting ${stepId}`, publishRunId)
    try {
      const result = await fn()
      this.eventEmitter?.stepCompleted('linkedin', 'api', stepId, Date.now() - start, publishRunId, data)
      return result
    } catch (error: any) {
      this.eventEmitter?.stepFailed(
        'linkedin',
        'api',
        stepId,
        error?.message || 'Unknown error',
        this.getErrorCode(error),
        this.isRetryableError(error),
        publishRunId
      )
      throw error
    }
  }

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
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult> {
    const currentPublishRunId = options?.sessionId || this.publishRunId || `linkedin-api-${Date.now()}`
    try {
      const credentials = await this.executeContractStep(
        LINKEDIN_API_STEP_IDS.AUTH_VALIDATE_CREDENTIALS,
        currentPublishRunId,
        async () => {
          const loaded = await this.getCredentials()
          if (!loaded.accessToken) {
            throw this.createError('LinkedIn API credentials not configured (need accessToken)', 'MISSING_CREDENTIALS')
          }
          return loaded
        }
      )

      const text = await this.executeContractStep(
        LINKEDIN_API_STEP_IDS.COMMON_VALIDATE_INPUT,
        currentPublishRunId,
        async () => {
          let formatted = content.text || content.body || ''
          if (hashtags.length > 0) {
            const formattedHashtags = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
            formatted = `${formatted} ${formattedHashtags}`.trim()
          }
          if (!formatted || formatted.trim().length === 0) {
            throw this.createError('LinkedIn post text is required', 'INVALID_INPUT')
          }
          return formatted
        }
      )

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
          const assetUrn = await this.executeContractStep(
            LINKEDIN_API_STEP_IDS.MEDIA_UPLOAD,
            currentPublishRunId,
            async () => await this.uploadMediaAsset(files[0], credentials),
            `Uploading ${files.length} media file(s)`
          )
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

      const postId = await this.executeContractStep(
        LINKEDIN_API_STEP_IDS.PUBLISH_SUBMIT,
        currentPublishRunId,
        async () => {
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
            throw this.createError(
              errorData.message || errorData.error?.message || `LinkedIn API error: ${response.status} ${response.statusText}`,
              'SUBMIT_FAILED'
            )
          }

          const data = await response.json()
          return data.id
        }
      )

      const url = await this.executeContractStep(
        LINKEDIN_API_STEP_IDS.PUBLISH_VERIFY_RESULT,
        currentPublishRunId,
        async () => {
          if (!postId) {
            throw this.createError('Missing LinkedIn post ID after publish', 'VERIFY_FAILED')
          }
          return `https://linkedin.com/feed/update/${postId}`
        }
      )

      return {
        success: true,
        postId,
        url
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
    // Convert Buffer to Uint8Array for fetch() compatibility
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'image/jpeg'
      },
      body: new Uint8Array(fileBuffer)
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file to LinkedIn: ${uploadResponse.statusText}`)
    }

    return assetUrn
  }
}

export default new LinkedInApiPublisher()
