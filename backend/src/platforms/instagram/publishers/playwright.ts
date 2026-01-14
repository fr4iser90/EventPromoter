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

export interface InstagramPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * Playwright Publisher for Instagram
 */
export class InstagramPlaywrightPublisher implements InstagramPublisher {
  private browser: Browser | null = null

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
    hashtags: string[]
  ): Promise<PostResult> {
    try {
      const credentials = await this.getCredentials()

      if (!credentials.username || !credentials.password) {
        return {
          success: false,
          error: 'Instagram credentials not configured for Playwright publishing'
        }
      }

      if (files.length === 0 || !files[0].url) {
        return {
          success: false,
          error: 'Instagram requires at least one image'
        }
      }

      this.browser = await chromium.launch({ headless: true })
      const page = await this.browser.newPage()

      try {
        // Navigate to Instagram login
        await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle' })

        // Login
        await page.fill('input[name="username"]', credentials.username)
        await page.fill('input[name="password"]', credentials.password)
        await page.click('button[type="submit"]')
        await page.waitForURL('**/accounts/onetap/**', { timeout: 15000 }).catch(() => {
          // May not always redirect
        })

        // Handle "Save Your Login Info" prompt
        await page.click('button:has-text("Not Now")').catch(() => {})
        await page.waitForTimeout(2000)

        // Navigate to create post
        await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' })
        await page.click('svg[aria-label="New post"]').catch(() => {
          return page.click('a[href*="/create/"]')
        })
        await page.waitForTimeout(2000)

        // Upload image
        const filePaths = await this.downloadFilesIfNeeded(files)
        const fileInput = await page.$('input[type="file"]')
        if (fileInput) {
          await fileInput.setInputFiles(filePaths[0])
          await page.waitForTimeout(3000) // Wait for upload
        }

        // Click Next
        await page.click('button:has-text("Next")')
        await page.waitForTimeout(2000)

        // Format caption with hashtags
        let caption = content.caption || content.text || content.body || ''
        if (hashtags.length > 0) {
          const formattedHashtags = hashtags
            .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
            .join(' ')
          caption = `${caption} ${formattedHashtags}`.trim()
        }

        // Enter caption
        const captionArea = await page.waitForSelector('textarea[aria-label*="Write a caption"]', { timeout: 5000 })
        await captionArea.fill(caption)

        // Click Share
        await page.click('button:has-text("Share")')
        await page.waitForTimeout(5000) // Wait for post to be created

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
