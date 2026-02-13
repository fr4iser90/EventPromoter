/**
 * Instagram Playwright Publisher
 * 
 * Browser automation for publishing posts using Playwright.
 * 
 * @module platforms/instagram/publishers/playwright
 */

// @ts-ignore - Playwright is optional dependency
import { chromium, Browser, Page } from 'playwright'
import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import { PublisherEventService, EventAwarePublisher } from '../../../services/publisherEventService.js'

export interface InstagramPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult>
}

const INSTAGRAM_STEP_IDS = {
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
 * Playwright Publisher for Instagram
 */
export class InstagramPlaywrightPublisher implements InstagramPublisher, EventAwarePublisher {
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
    this.eventEmitter?.stepStarted('instagram', 'playwright', stepId, message || `Starting ${stepId}`, publishRunId)
    try {
      const result = await fn()
      this.eventEmitter?.stepCompleted('instagram', 'playwright', stepId, Date.now() - start, publishRunId, data)
      return result
    } catch (error: any) {
      this.eventEmitter?.stepFailed(
        'instagram',
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
    const config = await ConfigService.getConfig('instagram') || {}
    return {
      username: config.username || process.env.INSTAGRAM_USERNAME,
      password: config.password || process.env.INSTAGRAM_PASSWORD,
    }
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult> {
    const currentPublishRunId = options?.sessionId || this.publishRunId || `instagram-${Date.now()}`
    try {
      const credentials = await this.executeContractStep(
        INSTAGRAM_STEP_IDS.AUTH_VALIDATE_CREDENTIALS,
        currentPublishRunId,
        async () => {
          const loaded = await this.getCredentials()
          if (!loaded.username || !loaded.password) {
            throw this.createError('Instagram credentials not configured for Playwright publishing', 'MISSING_CREDENTIALS')
          }
          return loaded
        },
        'Loading and validating Instagram credentials'
      )

      const caption = await this.executeContractStep(
        INSTAGRAM_STEP_IDS.COMMON_VALIDATE_INPUT,
        currentPublishRunId,
        async () => {
          if (files.length === 0 || !files[0].url) {
            throw this.createError('Instagram requires at least one image', 'INVALID_INPUT')
          }
          let formatted = content.caption || content.text || content.body || ''
          if (hashtags.length > 0) {
            const formattedHashtags = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
            formatted = `${formatted} ${formattedHashtags}`.trim()
          }
          return formatted
        },
        'Validating Instagram content and media'
      )

      this.browser = await chromium.launch({ headless: true })
      const page = await this.browser.newPage()

      try {
        await this.executeContractStep(
          INSTAGRAM_STEP_IDS.AUTH_LOGIN_CHECK,
          currentPublishRunId,
          async () => {
            await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle' })
            await page.fill('input[name="username"]', credentials.username)
            await page.fill('input[name="password"]', credentials.password)
            await page.click('button[type="submit"]')
            await page.waitForURL('**/accounts/onetap/**', { timeout: 15000 }).catch(() => {})
            await page.click('button:has-text("Not Now")').catch(() => {})
            await page.waitForTimeout(2000)
          },
          'Logging into Instagram'
        )

        await this.executeContractStep(
          INSTAGRAM_STEP_IDS.COMPOSE_OPEN_EDITOR,
          currentPublishRunId,
          async () => {
            await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' })
            await page.click('svg[aria-label="New post"]').catch(() => {
              return page.click('a[href*="/create/"]')
            })
            await page.waitForTimeout(2000)
          },
          'Opening Instagram post composer'
        )

        await this.executeContractStep(
          INSTAGRAM_STEP_IDS.MEDIA_UPLOAD,
          currentPublishRunId,
          async () => {
            const filePaths = await this.downloadFilesIfNeeded(files)
            const fileInput = await page.$('input[type="file"]')
            if (fileInput) {
              await fileInput.setInputFiles(filePaths[0])
              await page.waitForTimeout(3000)
            }
            await page.click('button:has-text("Next")')
            await page.waitForTimeout(2000)
          },
          'Uploading Instagram media'
        )

        await this.executeContractStep(
          INSTAGRAM_STEP_IDS.COMPOSE_FILL_CONTENT,
          currentPublishRunId,
          async () => {
            const captionArea = await page.waitForSelector('textarea[aria-label*="Write a caption"]', { timeout: 5000 })
            await captionArea.fill(caption)
          },
          'Filling Instagram caption'
        )

        await this.executeContractStep(
          INSTAGRAM_STEP_IDS.PUBLISH_SUBMIT,
          currentPublishRunId,
          async () => {
            await page.click('button:has-text("Share")')
            await page.waitForTimeout(5000)
          },
          'Submitting Instagram post'
        )

        const postUrl = await this.executeContractStep(
          INSTAGRAM_STEP_IDS.PUBLISH_VERIFY_RESULT,
          currentPublishRunId,
          async () => {
            const url = await this.extractPostUrl(page)
            const postId = this.extractPostId(url)
            if (!url || !postId) {
              throw this.createError('Missing Instagram post URL or postId after publish', 'VERIFY_FAILED')
            }
            return url
          },
          'Verifying Instagram post result'
        )

        return {
          success: true,
          url: postUrl,
          postId: this.extractPostId(postUrl)
        }
      } finally {
        await page.close()
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to publish to Instagram via Playwright'
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

  private async extractPostUrl(page: Page): Promise<string | undefined> {
    try {
      await page.waitForTimeout(2000)
      const currentUrl = page.url()
      if (currentUrl.includes('/p/')) {
        return currentUrl
      }
    } catch (error) {
      console.warn('Could not extract post URL:', error)
    }
    return undefined
  }

  private extractPostId(url?: string): string | undefined {
    if (!url) return undefined
    const match = url.match(/\/p\/([^\/\?]+)/)
    return match ? match[1] : undefined
  }
}

export default new InstagramPlaywrightPublisher()
