/**
 * Facebook API Publisher
 * 
 * Direct API integration for publishing posts using Facebook Graph API.
 * 
 * @module platforms/facebook/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import { PublisherEventService, EventAwarePublisher } from '../../../services/publisherEventService.js'
import { sanitizeTempFilename, assertSafeDownloadUrl } from '../../../utils/securityUtils.js'
import fs from 'fs'
import path from 'path'

export interface FacebookPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult>
}

const FACEBOOK_API_STEP_IDS = {
  COMMON_VALIDATE_INPUT: 'common.validate_input',
  AUTH_VALIDATE_CREDENTIALS: 'auth.validate_credentials',
  MEDIA_UPLOAD: 'media.upload',
  PUBLISH_SUBMIT: 'publish.submit',
  PUBLISH_VERIFY_RESULT: 'publish.verify_result'
} as const

/**
 * API Publisher for Facebook
 * 
 * Uses Facebook Graph API to post to pages.
 */
export class FacebookApiPublisher implements FacebookPublisher, EventAwarePublisher {
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
    this.eventEmitter?.stepStarted('facebook', 'api', stepId, message || `Starting ${stepId}`, publishRunId)
    try {
      const result = await fn()
      this.eventEmitter?.stepCompleted('facebook', 'api', stepId, Date.now() - start, publishRunId, data)
      return result
    } catch (error: any) {
      this.eventEmitter?.stepFailed(
        'facebook',
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
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult> {
    const currentPublishRunId = options?.sessionId || this.publishRunId || `facebook-api-${Date.now()}`
    try {
      const credentials = await this.executeContractStep(
        FACEBOOK_API_STEP_IDS.AUTH_VALIDATE_CREDENTIALS,
        currentPublishRunId,
        async () => {
          const loaded = await this.getCredentials()
          if (!loaded.pageAccessToken || !loaded.pageId) {
            throw this.createError('Facebook API credentials not configured (need pageAccessToken and pageId)', 'MISSING_CREDENTIALS')
          }
          return loaded
        }
      )

      const message = await this.executeContractStep(
        FACEBOOK_API_STEP_IDS.COMMON_VALIDATE_INPUT,
        currentPublishRunId,
        async () => {
          let formatted = content.text || content.body || content.message || ''
          if (hashtags.length > 0) {
            const formattedHashtags = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
            formatted = `${formatted} ${formattedHashtags}`.trim()
          }
          if (!formatted || formatted.trim().length === 0) {
            throw this.createError('Facebook post message is required', 'INVALID_INPUT')
          }
          return formatted
        }
      )

      // Upload photo if provided
      if (files.length > 0) {
        const mediaResult = await this.executeContractStep(
          FACEBOOK_API_STEP_IDS.MEDIA_UPLOAD,
          currentPublishRunId,
          async () => await this.postWithPhoto(credentials, message, files[0]),
          `Uploading ${files.length} media file(s)`
        )
        await this.executeContractStep(
          FACEBOOK_API_STEP_IDS.PUBLISH_VERIFY_RESULT,
          currentPublishRunId,
          async () => {
            if (!mediaResult.success || !mediaResult.postId || !mediaResult.url) {
              throw this.createError('Missing Facebook post URL or postId after media publish', 'VERIFY_FAILED')
            }
          }
        )
        return mediaResult
      }

      const postId = await this.executeContractStep(
        FACEBOOK_API_STEP_IDS.PUBLISH_SUBMIT,
        currentPublishRunId,
        async () => {
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${credentials.pageId}/feed`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message,
                access_token: credentials.pageAccessToken
              })
            }
          )

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw this.createError(
              errorData.error?.message || `Facebook API error: ${response.status} ${response.statusText}`,
              'SUBMIT_FAILED'
            )
          }

          const data = await response.json()
          return data.id
        }
      )

      const url = await this.executeContractStep(
        FACEBOOK_API_STEP_IDS.PUBLISH_VERIFY_RESULT,
        currentPublishRunId,
        async () => {
          if (!postId) {
            throw this.createError('Missing Facebook post ID after publish', 'VERIFY_FAILED')
          }
          return `https://facebook.com/${postId.replace('_', '/posts/')}`
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
      const safeFileName = sanitizeTempFilename(file.name || 'photo.jpg', 'photo.jpg')
      const tempPath = path.join(tempDir, `${Date.now()}-${safeFileName}`)
      const safeUrl = assertSafeDownloadUrl(String(file.url))

      const photoResponse = await fetch(safeUrl)
      if (!photoResponse.ok) {
        throw new Error(`Failed to download photo: ${photoResponse.statusText}`)
      }
      const arrayBuffer = await photoResponse.arrayBuffer()
      fs.writeFileSync(tempPath, Buffer.from(arrayBuffer))
      photoPath = tempPath
      fileName = safeFileName
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
