/**
 * PLATFORM_ID Playwright Publisher
 * 
 * Browser automation for publishing content using Playwright.
 * Useful when API is not available or for platforms without official APIs.
 * 
 * @module platforms/PLATFORM_ID/publishers/playwright
 * 
 * NOTE: Playwright is optional. Install with: npm install playwright
 */

// @ts-ignore - Playwright is optional dependency
import { chromium, Browser, Page } from 'playwright'
import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export interface PlatformPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * Playwright Publisher for PLATFORM_ID
 * 
 * Uses browser automation to publish content.
 */
export class PLATFORM_IDPlaywrightPublisher implements PlatformPublisher {
  private browser: Browser | null = null

  private async getCredentials(): Promise<any> {
    const config = await ConfigService.getConfig('PLATFORM_ID') || {}
    return {
      username: config.username || process.env.PLATFORM_ID_USERNAME,
      password: config.password || process.env.PLATFORM_ID_PASSWORD,
      // Add other required credentials
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
          error: 'Credentials not configured for Playwright publishing'
        }
      }

      // Launch browser
      this.browser = await chromium.launch({
        headless: true, // Set to false for debugging
      })

      const page = await this.browser.newPage()

      try {
        // Navigate to login page
        await page.goto('https://PLATFORM_ID.com/login')

        // Login
        await page.fill('input[name="username"]', credentials.username)
        await page.fill('input[name="password"]', credentials.password)
        await page.click('button[type="submit"]')

        // Wait for navigation after login
        await page.waitForURL('**/home', { timeout: 10000 })

        // Navigate to create post page
        await page.goto('https://PLATFORM_ID.com/create')

        // Fill in content
        const textArea = await page.waitForSelector('textarea[placeholder*="post"]', { timeout: 5000 })
        await textArea.fill(this.formatContent(content, hashtags))

        // Upload files if provided
        if (files.length > 0) {
          const fileInput = await page.$('input[type="file"]')
          if (fileInput) {
            // Convert file URLs to local paths if needed
            const filePaths = await this.downloadFilesIfNeeded(files)
            await fileInput.setInputFiles(filePaths)
            await page.waitForTimeout(2000) // Wait for upload
          }
        }

        // Submit post
        await page.click('button:has-text("Post")')
        await page.waitForTimeout(3000) // Wait for post to be created

        // Try to get post URL/ID from page
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
        error: error.message || 'Failed to publish via Playwright'
      }
    } finally {
      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }
    }
  }

  private formatContent(content: any, hashtags: string[]): string {
    let text = content.text || content.body || ''
    
    // Append hashtags
    if (hashtags.length > 0) {
      const formattedHashtags = hashtags
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ')
      text += ` ${formattedHashtags}`
    }

    return text
  }

  private async downloadFilesIfNeeded(files: any[]): Promise<string[]> {
    // If files are URLs, download them to temp directory
    // Otherwise return local paths
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
        // Already a local path
        filePaths.push(file.path)
      } else if (file.url) {
        // Download from URL
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
      // Try to find post URL in various ways
      // This is platform-specific and needs to be customized
      const urlSelectors = [
        'a[href*="/post/"]',
        'a[href*="/status/"]',
        '[data-post-url]'
      ]

      for (const selector of urlSelectors) {
        const element = await page.$(selector)
        if (element) {
          const href = await element.getAttribute('href')
          if (href) {
            return href.startsWith('http') ? href : `https://PLATFORM_ID.com${href}`
          }
        }
      }

      // Fallback: return current URL if we're on a post page
      const currentUrl = page.url()
      if (currentUrl.includes('/post/') || currentUrl.includes('/status/')) {
        return currentUrl
      }
    } catch (error) {
      console.warn('Could not extract post URL:', error)
    }

    return undefined
  }

  private extractPostId(url?: string): string | undefined {
    if (!url) return undefined
    
    // Extract ID from URL patterns like /post/123 or /status/456
    const match = url.match(/\/(?:post|status)\/([^\/\?]+)/)
    return match ? match[1] : undefined
  }
}

export default new PLATFORM_IDPlaywrightPublisher()
