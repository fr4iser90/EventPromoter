/**
 * Twitter Playwright Publisher
 * 
 * Browser automation for publishing tweets using Playwright.
 * 
 * @module platforms/twitter/publishers/playwright
 */

// @ts-ignore - Playwright is optional dependency
import { chromium, Browser, Page } from 'playwright'
import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import { PublisherEventService, EventAwarePublisher } from '../../../services/publisherEventService.js'

export interface TwitterPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult>
}

const TWITTER_STEP_IDS = {
  COMMON_VALIDATE_INPUT: 'common.validate_input',
  AUTH_VALIDATE_CREDENTIALS: 'auth.validate_credentials',
  AUTH_LOGIN_CHECK: 'auth.login_check',
  COMPOSE_OPEN_EDITOR: 'compose.open_editor',
  COMPOSE_FILL_CONTENT: 'compose.fill_content',
  MEDIA_UPLOAD: 'media.upload',
  PUBLISH_SUBMIT: 'publish.submit',
  PUBLISH_VERIFY_RESULT: 'publish.verify_result'
} as const

/**
 * Playwright Publisher for Twitter
 */
export class TwitterPlaywrightPublisher implements TwitterPublisher, EventAwarePublisher {
  private browser: Browser | null = null
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
    this.eventEmitter?.stepStarted('twitter', 'playwright', stepId, message || `Starting ${stepId}`, publishRunId)
    try {
      const result = await fn()
      this.eventEmitter?.stepCompleted('twitter', 'playwright', stepId, Date.now() - start, publishRunId, data)
      return result
    } catch (error: any) {
      this.eventEmitter?.stepFailed(
        'twitter',
        'playwright',
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
      username: config.username || process.env.TWITTER_USERNAME,
      password: config.password || process.env.TWITTER_PASSWORD,
      email: config.email || process.env.TWITTER_EMAIL,
    }
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult> {
    const currentPublishRunId = options?.sessionId || this.publishRunId || `twitter-${Date.now()}`
    try {
      const credentials = await this.executeContractStep(
        TWITTER_STEP_IDS.AUTH_VALIDATE_CREDENTIALS,
        currentPublishRunId,
        async () => {
          const loaded = await this.getCredentials()
          if (!loaded.username || !loaded.password) {
            throw this.createError('Twitter credentials not configured for Playwright publishing', 'MISSING_CREDENTIALS')
          }
          return loaded
        },
        'Loading and validating Twitter credentials'
      )

      const text = await this.executeContractStep(
        TWITTER_STEP_IDS.COMMON_VALIDATE_INPUT,
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
        },
        'Validating tweet content'
      )

      this.browser = await chromium.launch({ headless: true })
      const page = await this.browser.newPage()

      try {
        await this.executeContractStep(
          TWITTER_STEP_IDS.AUTH_LOGIN_CHECK,
          currentPublishRunId,
          async () => {
            await page.goto('https://twitter.com/i/flow/login', { waitUntil: 'networkidle' })
            await page.fill('input[autocomplete="username"]', credentials.username || credentials.email)
            await page.click('div[role="button"]:has-text("Next")')
            await page.waitForTimeout(2000)
            const phoneInput = await page.$('input[name="text"]').catch(() => null)
            if (phoneInput) {
              await page.click('div[role="button"]:has-text("Skip")').catch(() => {})
            }
            await page.fill('input[name="password"]', credentials.password)
            await page.click('div[data-testid="LoginForm_Login_Button"]')
            await page.waitForURL('**/home', { timeout: 15000 })
          },
          'Logging into Twitter'
        )

        await this.executeContractStep(
          TWITTER_STEP_IDS.COMPOSE_OPEN_EDITOR,
          currentPublishRunId,
          async () => {
            await page.goto('https://twitter.com/compose/tweet', { waitUntil: 'networkidle' })
          },
          'Opening tweet composer'
        )

        await this.executeContractStep(
          TWITTER_STEP_IDS.COMPOSE_FILL_CONTENT,
          currentPublishRunId,
          async () => {
            const textArea = await page.waitForSelector('div[data-testid="tweetTextarea_0"]', { timeout: 5000 })
            await textArea.fill(text)
          },
          'Filling tweet content'
        )

        if (files.length > 0 && files[0].url) {
          await this.executeContractStep(
            TWITTER_STEP_IDS.MEDIA_UPLOAD,
            currentPublishRunId,
            async () => {
              const filePaths = await this.downloadFilesIfNeeded(files)
              const fileInput = await page.$('input[type="file"]')
              if (fileInput) {
                await fileInput.setInputFiles(filePaths)
                await page.waitForTimeout(3000)
              }
            },
            `Uploading ${files.length} media file(s)`
          )
        }

        await this.executeContractStep(
          TWITTER_STEP_IDS.PUBLISH_SUBMIT,
          currentPublishRunId,
          async () => {
            await page.click('div[data-testid="tweetButton"]')
            await page.waitForTimeout(3000)
          },
          'Submitting tweet'
        )

        const tweetUrl = await this.executeContractStep(
          TWITTER_STEP_IDS.PUBLISH_VERIFY_RESULT,
          currentPublishRunId,
          async () => {
            const url = await this.extractTweetUrl(page)
            const postId = this.extractTweetId(url)
            if (!url || !postId) {
              throw this.createError('Missing tweet URL or postId after publish', 'VERIFY_FAILED')
            }
            return url
          },
          'Verifying tweet result'
        )

        return {
          success: true,
          url: tweetUrl,
          postId: this.extractTweetId(tweetUrl)
        }
      } finally {
        await page.close()
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to publish tweet via Playwright'
      }
    } finally {
      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }
    }
  }

  private async downloadFilesIfNeeded(files: any[]): Promise<string[]> {
    const fsPromises = await import('fs/promises')
    const fs = await import('fs')
    const path = await import('path')
    const https = await import('https')
    const http = await import('http')

    const tempDir = path.join(process.cwd(), 'temp', 'playwright-uploads')
    await fsPromises.mkdir(tempDir, { recursive: true })

    const filePaths: string[] = []

    for (const file of files) {
      if (file.path) {
        filePaths.push(file.path)
      } else if (file.url) {
        const fileName = file.name || `file-${Date.now()}.${file.type?.split('/')[1] || 'jpg'}`
        const filePath = path.join(tempDir, fileName)

        await new Promise<void>((resolve, reject) => {
          const protocol = file.url.startsWith('https') ? https : http
          const fileStream = fs.createWriteStream(filePath)

          protocol.get(file.url, (response) => {
            response.pipe(fileStream)
            fileStream.on('finish', () => {
              fileStream.close()
              resolve()
            })
          }).on('error', reject)
        })

        filePaths.push(filePath)
      }
    }

    return filePaths
  }

  private async extractTweetUrl(page: Page): Promise<string | undefined> {
    try {
      // Wait for tweet to appear in timeline
      await page.waitForTimeout(2000)
      const currentUrl = page.url()
      if (currentUrl.includes('/status/')) {
        return currentUrl
      }
    } catch (error) {
      console.warn('Could not extract tweet URL:', error)
    }
    return undefined
  }

  private extractTweetId(url?: string): string | undefined {
    if (!url) return undefined
    const match = url.match(/\/status\/(\d+)/)
    return match ? match[1] : undefined
  }
}

export default new TwitterPlaywrightPublisher()
