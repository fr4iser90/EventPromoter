/**
 * Reddit API Publisher
 * 
 * Direct API integration for publishing posts using Reddit API.
 * 
 * @module platforms/reddit/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import { PublisherEventService, EventAwarePublisher } from '../../../services/publisherEventService.js'
import { RedditTargetService } from '../services/targetService.js'
import { RedditTargets } from '../types.js'
import fs from 'fs'
import path from 'path'

export interface RedditPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult>
}

/**
 * API Publisher for Reddit
 * 
 * Uses Reddit API to submit posts to subreddits.
 */
export class RedditApiPublisher implements RedditPublisher {
  private eventEmitter?: PublisherEventService
  private publishRunId?: string

  setEventEmitter(emitter: PublisherEventService): void {
    this.eventEmitter = emitter
  }

  setPublishRunId(runId: string): void {
    this.publishRunId = runId
  }

  private readonly STEP_IDS = {
    COMMON_VALIDATE_INPUT: 'common.validate_input',
    COMMON_RESOLVE_TARGETS: 'common.resolve_targets',
    AUTH_VALIDATE_CREDENTIALS: 'auth.validate_credentials',
    AUTH_LOGIN_CHECK: 'auth.login_check',
    MEDIA_UPLOAD: 'media.upload',
    PUBLISH_SUBMIT: 'publish.submit',
    PUBLISH_VERIFY_RESULT: 'publish.verify_result'
  } as const

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
    this.eventEmitter?.stepStarted('reddit', 'api', stepId, message || `Starting ${stepId}`, publishRunId)
    const start = Date.now()
    try {
      const result = await fn()
      this.eventEmitter?.stepCompleted('reddit', 'api', stepId, Date.now() - start, publishRunId, data)
      return result
    } catch (error: any) {
      this.eventEmitter?.stepFailed(
        'reddit',
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

  /**
   * Extract subreddit names from targets configuration
   */
  private async extractSubredditsFromTargets(targetsConfig: RedditTargets): Promise<string[]> {
    if (!targetsConfig) return []

    const targetService = new RedditTargetService()
    const allTargets = await targetService.getTargets('subreddit')
    const groups = await targetService.getGroups()

    // targetType is REQUIRED - no fallbacks
    const allSubreddits = allTargets.map((t: any) => {
      if (!t.targetType) {
        console.error('Target missing targetType - this should not happen', { targetId: t.id })
        return undefined
      }
      const baseField = targetService.getBaseField(t.targetType)
      return t[baseField]
    }).filter((subreddit: string | undefined): subreddit is string => subreddit !== undefined)

    if (targetsConfig.mode === 'all') {
      return allSubreddits
    } else if (targetsConfig.mode === 'groups' && targetsConfig.groups && Array.isArray(targetsConfig.groups)) {
      // Collect all subreddits from selected groups
      const subreddits: string[] = []
      const groupsArray = Array.isArray(groups) ? groups : Object.values(groups)
      for (const groupIdentifier of targetsConfig.groups) {
        // Find group by ID or name
        const group = groupsArray.find((g: any) => g.id === groupIdentifier || g.name === groupIdentifier) as any
        if (!group || !group.targetIds || !Array.isArray(group.targetIds)) continue
        
        // Convert target IDs to subreddit names (only subreddit type targets)
        const groupSubreddits = group.targetIds
          .map((targetId: string) => {
            const target = allTargets.find((t: any) => t.id === targetId && t.targetType === 'subreddit')
            if (!target) return undefined
            if (!target.targetType) {
              console.error('Target missing targetType - this should not happen', { targetId: target.id })
              return undefined
            }
            const baseField = targetService.getBaseField(target.targetType)
            return target[baseField]
          })
          .filter((subreddit: string | undefined): subreddit is string => subreddit !== undefined)
        subreddits.push(...groupSubreddits)
      }
      return [...new Set(subreddits)] // Remove duplicates
    } else if (targetsConfig.mode === 'individual' && targetsConfig.individual && Array.isArray(targetsConfig.individual)) {
      // targetType is REQUIRED - no fallbacks
      const targetMapEntries: [string, string][] = []
      for (const t of allTargets) {
        if (!t.targetType) {
          console.error('Target missing targetType - this should not happen', { targetId: t.id })
          continue
        }
        const baseField = targetService.getBaseField(t.targetType)
        const baseValue = t[baseField]
        if (baseValue) {
          targetMapEntries.push([t.id, baseValue])
        }
      }
      const targetMap = new Map(targetMapEntries)
      
      const individualSubreddits: string[] = targetsConfig.individual
        .map((targetId: string) => targetMap.get(targetId))
        .filter((subreddit: string | undefined): subreddit is string => subreddit !== undefined)
      return [...new Set(individualSubreddits)]
    }

    return []
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult> {
    const currentPublishRunId = options?.sessionId || this.publishRunId || `reddit-api-${Date.now()}`
    try {
      const credentials = await this.executeContractStep(
        this.STEP_IDS.AUTH_VALIDATE_CREDENTIALS,
        currentPublishRunId,
        async () => {
          const loaded = await this.getCredentials()
          if (!loaded.clientId || !loaded.clientSecret || !loaded.username || !loaded.password) {
            throw this.createError('Reddit API credentials not configured (need clientId, clientSecret, username, password)', 'MISSING_CREDENTIALS')
          }
          return loaded
        }
      )

      await this.executeContractStep(
        this.STEP_IDS.COMMON_VALIDATE_INPUT,
        currentPublishRunId,
        async () => {
          if (!content.subreddits && !content.users) {
            throw this.createError('At least one target configuration is required (subreddits or users)', 'INVALID_INPUT')
          }
          if (!content.title || content.title.trim().length === 0) {
            throw this.createError('Title is required', 'INVALID_INPUT')
          }
          if (!content.text || content.text.trim().length === 0) {
            throw this.createError('Text is required', 'INVALID_INPUT')
          }
        }
      )

      const title = content.title
      const text = content.text

      // ✅ Support subreddits (posts) OR users (DMs)
      if (content.subreddits) {
        const subreddits = await this.executeContractStep(
          this.STEP_IDS.COMMON_RESOLVE_TARGETS,
          currentPublishRunId,
          async () => await this.extractSubredditsFromTargets(content.subreddits)
        )
        if (subreddits.length === 0) {
          throw this.createError('No subreddits found in targets configuration', 'NO_TARGETS_RESOLVED')
        }

        // Get access token once for all posts
        const accessToken = await this.executeContractStep(
          this.STEP_IDS.AUTH_LOGIN_CHECK,
          currentPublishRunId,
          async () => await this.getAccessToken(credentials)
        )

        // ✅ Post to ALL subreddits
        const results: Array<{ subreddit: string; success: boolean; postId?: string; url?: string; error?: string }> = []
        
        for (const subreddit of subreddits) {
          try {
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
                  const mediaAssetId = await this.executeContractStep(
                    this.STEP_IDS.MEDIA_UPLOAD,
                    currentPublishRunId,
                    async () => await this.uploadImageToReddit(file, accessToken, credentials.userAgent),
                    `Uploading media for r/${subreddit}`
                  )
                  
                  payload = {
                    kind: 'image',
                    sr: subreddit,
                    title: title,
                    media_asset_id: mediaAssetId,
                    resubmit: true,
                    api_type: 'json'
                  }
                } catch (error: any) {
                  results.push({
                    subreddit,
                    success: false,
                    error: `Failed to upload image: ${error.message}`
                  })
                  continue
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
                  results.push({
                    subreddit,
                    success: false,
                    error: 'Non-image files require a URL for Reddit link posts'
                  })
                  continue
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

            const response = await this.executeContractStep(
              this.STEP_IDS.PUBLISH_SUBMIT,
              currentPublishRunId,
              async () => await fetch('https://oauth.reddit.com/api/submit', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'User-Agent': credentials.userAgent
                },
                body: new URLSearchParams(payload as any)
              }),
              `Submitting post to r/${subreddit}`,
              { subreddit }
            )

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              results.push({
                subreddit,
                success: false,
                error: errorData.error || `Reddit API error: ${response.status} ${response.statusText}`
              })
              continue
            }

            const data = await response.json()
            const postId = data.json?.data?.name || data.json?.data?.id

            if (!postId) {
              results.push({
                subreddit,
                success: false,
                error: 'Failed to get post ID from Reddit response'
              })
              continue
            }

            // Extract actual post ID from Reddit's format (e.g., "t3_abc123")
            const actualPostId = postId.replace('t3_', '')
            await this.executeContractStep(
              this.STEP_IDS.PUBLISH_VERIFY_RESULT,
              currentPublishRunId,
              async () => {
                if (!actualPostId) {
                  throw this.createError(`Missing post ID after publish for r/${subreddit}`, 'VERIFY_FAILED')
                }
              },
              `Verifying publish result for r/${subreddit}`,
              { subreddit, postId: actualPostId }
            )

            results.push({
              subreddit,
              success: true,
              postId: actualPostId,
              url: `https://reddit.com/r/${subreddit}/comments/${actualPostId}/`
            })

            // Rate limiting: wait 2 seconds between posts to avoid hitting Reddit's rate limits
            if (subreddits.indexOf(subreddit) < subreddits.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000))
            }
          } catch (error: any) {
            results.push({
              subreddit,
              success: false,
              error: error.message || 'Unknown error'
            })
          }
        }

        // Return aggregated result
        const successful = results.filter(r => r.success)
        const failed = results.filter(r => !r.success)

        if (successful.length === 0) {
          return {
            success: false,
            error: `Failed to post to all subreddits. Errors: ${failed.map(f => `${f.subreddit}: ${f.error}`).join('; ')}`
          }
        }

        // Return first successful post as primary result, but include all results in message
        const firstSuccess = successful[0]
        return {
          success: true,
          postId: firstSuccess.postId,
          url: firstSuccess.url,
          message: `Posted to ${successful.length}/${subreddits.length} subreddits. ${failed.length > 0 ? `Failed: ${failed.map(f => f.subreddit).join(', ')}` : 'All successful.'}`
        }
      } else if (content.users) {
        // ✅ User DMs - not yet implemented
        throw this.createError('User DMs not yet implemented in API publisher', 'NOT_IMPLEMENTED')
      } else {
        throw this.createError('Either subreddits or users target configuration is required', 'INVALID_INPUT')
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
