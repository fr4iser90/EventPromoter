/**
 * LinkedIn Playwright Publisher
 * 
 * Browser automation for publishing posts using Playwright.
 * 
 * @module platforms/linkedin/publishers/playwright
 */

// @ts-ignore - Playwright is optional dependency
import { chromium, Browser, Page } from 'playwright'
import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export interface LinkedInPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * Playwright Publisher for LinkedIn
 */
export class LinkedInPlaywrightPublisher implements LinkedInPublisher {
  private browser: Browser | null = null

  private async getCredentials(): Promise<any> {
    const config = await ConfigService.getConfig('linkedin') || {}
    return {
      email: config.email || process.env.LINKEDIN_EMAIL,
      password: config.password || process.env.LINKEDIN_PASSWORD,
    }
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult> {
    try {
      const credentials = await this.getCredentials()

      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: 'LinkedIn credentials not configured for Playwright publishing'
        }
      }

      this.browser = await chromium.launch({ headless: true })
      const page = await this.browser.newPage()

      try {
        // Navigate to LinkedIn login
        await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' })

        // Login
        await page.fill('input[name="session_key"]', credentials.email)
        await page.fill('input[name="session_password"]', credentials.password)
        await page.click('button[type="submit"]')
        await page.waitForURL('**/feed**', { timeout: 15000 })

        // Click "Start a post"
        await page.click('button[aria-label*="Start a post"]').catch(() => {
          return page.click('div[data-control-name="share_box"]')
        })
        await page.waitForTimeout(2000)

        // Format text with hashtags
        let text = content.text || content.body || ''
        if (hashtags.length > 0) {
          const formattedHashtags = hashtags
            .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
            .join(' ')
          text = `${text} ${formattedHashtags}`.trim()
        }

        // Enter post text
        const textArea = await page.waitForSelector('div[role="textbox"][aria-label*="What do you want to talk about"]', { timeout: 5000 })
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

        // Post
        await page.click('button[aria-label="Post"]').catch(() => {
          return page.click('button:has-text("Post")')
        })
        await page.waitForTimeout(3000)

        // Try to get post URL
        const postUrl = await this.extractPostUrl(page)

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
        error: error.message || 'Failed to publish to LinkedIn via Playwright'
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
      if (currentUrl.includes('/feed/update/')) {
        return currentUrl
      }
    } catch (error) {
      console.warn('Could not extract post URL:', error)
    }
    return undefined
  }

  private extractPostId(url?: string): string | undefined {
    if (!url) return undefined
    const match = url.match(/\/feed\/update\/([^\/\?]+)/)
    return match ? match[1] : undefined
  }
}

export default new LinkedInPlaywrightPublisher()
