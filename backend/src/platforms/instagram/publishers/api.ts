/**
 * Instagram API Publisher
 * 
 * Direct API integration for publishing posts using Instagram Graph API.
 * 
 * @module platforms/instagram/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import { PublisherEventService, EventAwarePublisher } from '../../../services/publisherEventService.js'
import { sanitizeTempFilename, assertSafeDownloadUrl } from '../../../utils/securityUtils.js'
import fs from 'fs'
import path from 'path'

export interface InstagramPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult>
}

const INSTAGRAM_API_STEP_IDS = {
  COMMON_VALIDATE_INPUT: 'common.validate_input',
  AUTH_VALIDATE_CREDENTIALS: 'auth.validate_credentials',
  MEDIA_UPLOAD: 'media.upload',
  PUBLISH_SUBMIT: 'publish.submit',
  PUBLISH_VERIFY_RESULT: 'publish.verify_result'
} as const

/**
 * API Publisher for Instagram
 * 
 * Uses Instagram Graph API to post photos.
 * Note: Instagram API requires a Facebook Business account and app.
 */
export class InstagramApiPublisher implements InstagramPublisher, EventAwarePublisher {
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
    this.eventEmitter?.stepStarted('instagram', 'api', stepId, message || `Starting ${stepId}`, publishRunId)
    try {
      const result = await fn()
      this.eventEmitter?.stepCompleted('instagram', 'api', stepId, Date.now() - start, publishRunId, data)
      return result
    } catch (error: any) {
      this.eventEmitter?.stepFailed(
        'instagram',
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
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult> {
    const currentPublishRunId = options?.sessionId || this.publishRunId || `instagram-api-${Date.now()}`
    try {
      const credentials = await this.executeContractStep(
        INSTAGRAM_API_STEP_IDS.AUTH_VALIDATE_CREDENTIALS,
        currentPublishRunId,
        async () => {
          const loaded = await this.getCredentials()
          if (!loaded.accessToken || !loaded.instagramAccountId) {
            throw this.createError('Instagram API credentials not configured (need accessToken and instagramAccountId)', 'MISSING_CREDENTIALS')
          }
          return loaded
        }
      )

      const caption = await this.executeContractStep(
        INSTAGRAM_API_STEP_IDS.COMMON_VALIDATE_INPUT,
        currentPublishRunId,
        async () => {
          if (files.length === 0) {
            throw this.createError('Instagram requires at least one image', 'INVALID_INPUT')
          }
          let formatted = content.caption || content.text || content.body || ''
          if (hashtags.length > 0) {
            const formattedHashtags = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
            formatted = `${formatted} ${formattedHashtags}`.trim()
          }
          return formatted
        }
      )

      // Step 1: Upload image to Facebook Photos first (to get public URL)
      // Instagram Graph API requires publicly accessible image URL
      // We upload to Facebook Photos, then use that URL for Instagram
      const imageUrl = await this.executeContractStep(
        INSTAGRAM_API_STEP_IDS.MEDIA_UPLOAD,
        currentPublishRunId,
        async () => await this.uploadImageToFacebookPhotos(files[0], credentials),
        `Uploading ${files.length} media file(s)`
      )

      // Step 2: Create media container with public image URL
      const mediaId = await this.executeContractStep(
        INSTAGRAM_API_STEP_IDS.PUBLISH_SUBMIT,
        currentPublishRunId,
        async () => {
          const containerResponse = await fetch(
            `https://graph.facebook.com/v18.0/${credentials.instagramAccountId}/media`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image_url: imageUrl,
                caption,
                access_token: credentials.accessToken
              })
            }
          )

          if (!containerResponse.ok) {
            const errorData = await containerResponse.json().catch(() => ({}))
            throw this.createError(errorData.error?.message || `Instagram API error: ${containerResponse.status}`, 'SUBMIT_FAILED')
          }

          const containerData = await containerResponse.json()
          const creationId = containerData.id
          if (!creationId) {
            throw this.createError('Failed to create media container', 'SUBMIT_FAILED')
          }

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
            throw this.createError(errorData.error?.message || `Instagram publish error: ${publishResponse.status}`, 'SUBMIT_FAILED')
          }

          const publishData = await publishResponse.json()
          return publishData.id
        }
      )

      const url = await this.executeContractStep(
        INSTAGRAM_API_STEP_IDS.PUBLISH_VERIFY_RESULT,
        currentPublishRunId,
        async () => {
          if (!mediaId) {
            throw this.createError('Missing Instagram media ID after publish', 'VERIFY_FAILED')
          }
          return `https://instagram.com/p/${mediaId}/`
        }
      )

      return {
        success: true,
        postId: mediaId,
        url
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
      fileName = sanitizeTempFilename(file.name || 'image.jpg', 'image.jpg')
      const tempDir = path.join(process.cwd(), 'temp', 'instagram-uploads')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
      const tempPath = path.join(tempDir, `${Date.now()}-${fileName}`)
      const safeUrl = assertSafeDownloadUrl(String(file.url))

      const response = await fetch(safeUrl)
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
