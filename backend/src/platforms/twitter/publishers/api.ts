/**
 * Twitter API Publisher
 * 
 * Direct API integration for publishing tweets using Twitter API v2.
 * 
 * @module platforms/twitter/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import { PublisherEventService, EventAwarePublisher } from '../../../services/publisherEventService.js'
import fs from 'fs'

export interface TwitterPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult>
}

const TWITTER_API_STEP_IDS = {
  COMMON_VALIDATE_INPUT: 'common.validate_input',
  AUTH_VALIDATE_CREDENTIALS: 'auth.validate_credentials',
  MEDIA_UPLOAD: 'media.upload',
  PUBLISH_SUBMIT: 'publish.submit',
  PUBLISH_VERIFY_RESULT: 'publish.verify_result'
} as const

/**
 * API Publisher for Twitter
 * 
 * Uses Twitter API v2 to post tweets with media support.
 */
export class TwitterApiPublisher implements TwitterPublisher, EventAwarePublisher {
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
    this.eventEmitter?.stepStarted('twitter', 'api', stepId, message || `Starting ${stepId}`, publishRunId)
    try {
      const result = await fn()
      this.eventEmitter?.stepCompleted('twitter', 'api', stepId, Date.now() - start, publishRunId, data)
      return result
    } catch (error: any) {
      this.eventEmitter?.stepFailed(
        'twitter',
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
    const config = await ConfigService.getConfig('twitter') || {}
    return {
      bearerToken: config.bearerToken || process.env.TWITTER_BEARER_TOKEN,
      apiKey: config.apiKey || process.env.TWITTER_API_KEY,
      apiSecret: config.apiSecret || process.env.TWITTER_API_SECRET,
      accessToken: config.accessToken || process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: config.accessTokenSecret || process.env.TWITTER_ACCESS_TOKEN_SECRET,
    }
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult> {
    const currentPublishRunId = options?.sessionId || this.publishRunId || `twitter-api-${Date.now()}`
    try {
      const credentials = await this.executeContractStep(
        TWITTER_API_STEP_IDS.AUTH_VALIDATE_CREDENTIALS,
        currentPublishRunId,
        async () => {
          const loaded = await this.getCredentials()
          if (!loaded.bearerToken && !loaded.accessToken) {
            throw this.createError('Twitter API credentials not configured (need bearerToken or accessToken)', 'MISSING_CREDENTIALS')
          }
          return loaded
        }
      )

      const text = await this.executeContractStep(
        TWITTER_API_STEP_IDS.COMMON_VALIDATE_INPUT,
        currentPublishRunId,
        async () => {
          let formatted = content.text || content.body || ''
          if (hashtags.length > 0) {
            const formattedHashtags = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
            formatted = `${formatted} ${formattedHashtags}`.trim()
          }
          if (!formatted || formatted.trim().length === 0) {
            throw this.createError('Tweet text is required', 'INVALID_INPUT')
          }
          if (formatted.length > 280) {
            throw this.createError(`Tweet exceeds 280 characters (${formatted.length} chars)`, 'INVALID_INPUT')
          }
          return formatted
        }
      )

      // Upload media if provided
      let mediaId: string | undefined
      if (files.length > 0) {
        try {
          mediaId = await this.executeContractStep(
            TWITTER_API_STEP_IDS.MEDIA_UPLOAD,
            currentPublishRunId,
            async () => await this.uploadMedia(files[0], credentials),
            `Uploading ${files.length} media file(s)`
          )
        } catch (error: any) {
          console.warn('Media upload failed, posting text only:', error.message)
        }
      }

      // Post tweet
      const tweetPayload: any = {
        text: text
      }

      if (mediaId) {
        tweetPayload.media = {
          media_ids: [mediaId]
        }
      }

      const tweetId = await this.executeContractStep(
        TWITTER_API_STEP_IDS.PUBLISH_SUBMIT,
        currentPublishRunId,
        async () => {
          const response = await fetch('https://api.twitter.com/2/tweets', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${credentials.bearerToken || credentials.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tweetPayload)
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw this.createError(errorData.detail || `Twitter API error: ${response.status} ${response.statusText}`, 'SUBMIT_FAILED')
          }

          const data = await response.json()
          return data.data?.id
        }
      )

      const url = await this.executeContractStep(
        TWITTER_API_STEP_IDS.PUBLISH_VERIFY_RESULT,
        currentPublishRunId,
        async () => {
          if (!tweetId) {
            throw this.createError('Missing tweet ID after publish', 'VERIFY_FAILED')
          }
          return `https://twitter.com/i/web/status/${tweetId}`
        }
      )

      return {
        success: true,
        postId: tweetId,
        url
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to publish tweet via API'
      }
    }
  }

  private async uploadMedia(file: any, credentials: any): Promise<string> {
    // Read media directly from filesystem or download from URL
    let mediaBuffer: Buffer

    if (file.path && fs.existsSync(file.path)) {
      // Direct file read from filesystem
      mediaBuffer = fs.readFileSync(file.path)
    } else if (file.url) {
      // Fallback: Download from URL (if path not available)
      const mediaResponse = await fetch(file.url)
      if (!mediaResponse.ok) {
        throw new Error(`Failed to download media: ${mediaResponse.statusText}`)
      }
      const arrayBuffer = await mediaResponse.arrayBuffer()
      mediaBuffer = Buffer.from(arrayBuffer)
    } else {
      throw new Error('File must have either path or url')
    }

    const base64Media = mediaBuffer.toString('base64')

    // Upload to Twitter
    const uploadResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.bearerToken || credentials.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        media_data: base64Media
      })
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}))
      throw new Error(errorData.error || 'Media upload failed')
    }

    const uploadData = await uploadResponse.json()
    return uploadData.media_id_string
  }
}

export default new TwitterApiPublisher()
