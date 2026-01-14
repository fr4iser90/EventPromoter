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

export interface TwitterPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * Playwright Publisher for Twitter
 */
export class TwitterPlaywrightPublisher implements TwitterPublisher {
  private browser: Browser | null = null

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
    hashtags: string[]
  ): Promise<PostResult> {
    try {
      const credentials = await this.getCredentials()

      if (!credentials.username || !credentials.password) {
        return {
          success: false,
          error: 'Twitter credentials not configured for Playwright publishing'
        }
      }

      this.browser = await chromium.launch({ headless: true })
      const page = await this.browser.newPage()

      try {
        // Navigate to Twitter login
        await page.goto('https://twitter.com/i/flow/login', { waitUntil: 'networkidle' })

        // Enter username/email
        await page.fill('input[autocomplete="username"]', credentials.username || credentials.email)
        await page.click('div[role="button"]:has-text("Next")')
        await page.waitForTimeout(2000)

        // Handle potential phone/email verification
        const phoneInput = await page.$('input[name="text"]').catch(() => null)
        if (phoneInput) {
          // Skip if phone verification is required (user needs to handle manually)
          await page.click('div[role="button"]:has-text("Skip")').catch(() => {})
        }

        // Enter password
        await page.fill('input[name="password"]', credentials.password)
        await page.click('div[data-testid="LoginForm_Login_Button"]')
        await page.waitForURL('**/home', { timeout: 15000 })

        // Navigate to compose tweet
        await page.goto('https://twitter.com/compose/tweet', { waitUntil: 'networkidle' })

        // Format text with hashtags
        let text = content.text || content.body || ''
        if (hashtags.length > 0) {
          const formattedHashtags = hashtags
            .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
            .join(' ')
          text = `${text} ${formattedHashtags}`.trim()
        }

        // Enter tweet text
        const textArea = await page.waitForSelector('div[data-testid="tweetTextarea_0"]', { timeout: 5000 })
        await textArea.fill(text)

        // Upload image if provided
        if (files.length > 0 && files[0].url) {
          const filePaths = await this.downloadFilesIfNeeded(files)
          const fileInput = await page.$('input[type="file"]')
          if (fileInput) {
            await fileInput.setInputFiles(filePaths)
            await page.waitForTimeout(3000) // Wait for upload
          }
        }

        // Post tweet
        await page.click('div[data-testid="tweetButton"]')
        await page.waitForTimeout(3000)

        // Try to get tweet URL
        const tweetUrl = await this.extractTweetUrl(page)

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
