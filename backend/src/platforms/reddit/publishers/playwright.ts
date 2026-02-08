/**
 * Reddit Playwright Publisher
 * 
 * Browser automation for publishing posts using Playwright.
 * 
 * @module platforms/reddit/publishers/playwright
 */

// @ts-ignore - Playwright is optional dependency
import { chromium, Browser, Page } from 'playwright'
import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export interface RedditPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * Playwright Publisher for Reddit
 */
export class RedditPlaywrightPublisher implements RedditPublisher {
  private browser: Browser | null = null

  private async getCredentials(): Promise<any> {
    const config = await ConfigService.getConfig('reddit') || {}
    return {
      username: config.username || process.env.REDDIT_USERNAME,
      password: config.password || process.env.REDDIT_PASSWORD,
    }
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean }
  ): Promise<PostResult> {
    // DRY MODE ist standardmäßig AKTIV - nur Formular ausfüllen, kein Posten
    const dryMode = options?.dryMode ?? true
    
    try {
      const credentials = await this.getCredentials()

      if (!credentials.username || !credentials.password) {
        return {
          success: false,
          error: 'Reddit credentials not configured for Playwright publishing'
        }
      }

      const subreddit = content.subreddit || 'test'
      const title = content.title || content.text?.substring(0, 300) || 'Event Post'
      const text = content.text || content.body || ''

      // DRY MODE: headless false, damit User sehen kann was passiert
      this.browser = await chromium.launch({ headless: false })
      const page = await this.browser.newPage()

      try {
        // Navigate to Reddit login
        await page.goto('https://www.reddit.com/login', { waitUntil: 'networkidle' })

        // Login
        await page.fill('input[name="username"]', credentials.username)
        await page.fill('input[name="password"]', credentials.password)
        await page.click('button[type="submit"]')
        await page.waitForURL('**/reddit.com/**', { timeout: 15000 })

        // Navigate to subreddit
        await page.goto(`https://www.reddit.com/r/${subreddit}/submit`, { waitUntil: 'networkidle' })

        // Select post type
        if (files.length > 0 && files[0].url) {
          // Link or image post
          await page.click('button:has-text("Link")').catch(() => {})
        } else {
          // Text post
          await page.click('button:has-text("Post")').catch(() => {})
        }
        await page.waitForTimeout(1000)

        // Enter title
        await page.fill('textarea[placeholder*="title"]', title)

        // Enter text (for text posts) or URL (for link posts)
        if (files.length > 0 && files[0].url) {
          await page.fill('input[placeholder*="url"]', files[0].url)
        } else {
          const textArea = await page.$('div[contenteditable="true"]')
          if (textArea) {
            await textArea.fill(text)
          }
        }

        // DRY MODE: Stoppe hier, User kann selbst posten
        // Automatisches Posten kommt später - jetzt nur Formular ausfüllen
        console.log('🔍 DRY MODE: Formular ausgefüllt, Browser bleibt offen. User kann jetzt selbst posten.')
        // Browser NICHT schließen, damit User den Post-Button selbst drücken kann
        return {
          success: true,
          url: page.url(),
          postId: undefined
        }

        // TODO: Automatisches Posten kommt später
        // Submit post (nur wenn NICHT dry mode)
        // await page.click('button:has-text("Post")')
        // await page.waitForTimeout(3000)
        // const postUrl = await this.extractPostUrl(page, subreddit)
        // return {
        //   success: true,
        //   url: postUrl,
        //   postId: this.extractPostId(postUrl)
        // }
      } finally {
        // DRY MODE: Browser NICHT schließen, damit User sehen kann was passiert
        // Browser bleibt offen für manuelles Posten
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to publish to Reddit via Playwright'
      }
    } finally {
      // DRY MODE: Browser NICHT schließen, damit User sehen kann was passiert
      // Browser bleibt offen für manuelles Posten
      console.log('🔍 DRY MODE: Browser bleibt offen. Schließe manuell wenn fertig.')
    }
  }

  private async extractPostUrl(page: Page, subreddit: string): Promise<string | undefined> {
    try {
      await page.waitForTimeout(2000)
      const currentUrl = page.url()
      if (currentUrl.includes(`/r/${subreddit}/comments/`)) {
        return currentUrl
      }
    } catch (error) {
      console.warn('Could not extract post URL:', error)
    }
    return undefined
  }

  private extractPostId(url?: string): string | undefined {
    if (!url) return undefined
    const match = url.match(/\/comments\/([^\/\?]+)/)
    return match ? match[1] : undefined
  }
}

export default new RedditPlaywrightPublisher()
