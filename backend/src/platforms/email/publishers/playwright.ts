/**
 * Email Playwright Publisher
 * 
 * Browser automation for sending emails using webmail interfaces.
 * Note: This is less practical than SMTP, but provided for completeness.
 * 
 * @module platforms/email/publishers/playwright
 */

// @ts-ignore - Playwright is optional dependency
import { chromium, Browser, Page } from 'playwright'
import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export interface EmailPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}

/**
 * Playwright Publisher for Email
 * 
 * Uses browser automation to send emails via webmail (Gmail, Outlook, etc.)
 * Note: This is not recommended for production - use SMTP API instead.
 */
export class EmailPlaywrightPublisher implements EmailPublisher {
  private browser: Browser | null = null

  private async getCredentials(): Promise<any> {
    const config = await ConfigService.getConfig('email') || {}
    return {
      email: config.email || process.env.EMAIL_USERNAME,
      password: config.password || process.env.EMAIL_PASSWORD,
      webmailProvider: config.webmailProvider || process.env.EMAIL_WEBMAIL_PROVIDER || 'gmail',
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
          error: 'Email credentials not configured for Playwright publishing'
        }
      }

      // Check for _templates format
      const templates = content._templates || []
      if (templates.length === 0) {
        return {
          success: false,
          error: 'Email content must use _templates format with targets configuration. Legacy recipients format is no longer supported.'
        }
      }
      
      // For Playwright, we'll use the first template's recipients
      // (Playwright typically sends to one recipient at a time)
      const firstTemplate = templates[0]
      if (!firstTemplate.targets) {
        return {
          success: false,
          error: 'Template targets configuration is required'
        }
      }
      
      // Extract recipients from first template (simplified for Playwright)
      // Note: Playwright publisher may need to be refactored to handle multiple templates
      const recipients: string[] = []
      // This is a simplified extraction - full extraction would require EmailTargetService
      if (firstTemplate.targets.mode === 'individual' && firstTemplate.targets.individual) {
        // We can't resolve target IDs to emails here without EmailTargetService
        // For now, return error suggesting to use API publisher instead
        return {
          success: false,
          error: 'Playwright publisher does not fully support _templates format. Please use API publisher instead.'
        }
      }

      this.browser = await chromium.launch({ headless: true })
      const page = await this.browser.newPage()

      try {
        // Navigate to webmail based on provider
        const webmailUrl = this.getWebmailUrl(credentials.webmailProvider)
        await page.goto(webmailUrl, { waitUntil: 'networkidle' })

        // Login (provider-specific)
        await this.login(page, credentials)

        // Compose email
        await page.click('div[role="button"]:has-text("Compose")').catch(() => {
          return page.click('button:has-text("New")')
        })
        await page.waitForTimeout(2000)

        // Enter recipients
        const toField = await page.waitForSelector('input[aria-label*="To"]', { timeout: 5000 })
        await toField.fill(recipients.join(', '))

        // Enter subject
        const subjectField = await page.$('input[name="subjectbox"]').catch(() => {
          return page.$('input[placeholder*="Subject"]')
        })
        if (subjectField) {
          await subjectField.fill(content.subject || 'Event Notification')
        }

        // Enter body
        const bodyField = await page.$('div[aria-label*="Message"]').catch(() => {
          return page.$('div[contenteditable="true"]')
        })
        if (bodyField) {
          const html = content.html || content.body || ''
          await bodyField.fill(this.htmlToText(html))
        }

        // Attach files if provided
        if (files.length > 0) {
          const filePaths = await this.downloadFilesIfNeeded(files)
          const fileInput = await page.$('input[type="file"]')
          if (fileInput) {
            await fileInput.setInputFiles(filePaths)
            await page.waitForTimeout(2000)
          }
        }

        // Send
        await page.click('div[role="button"]:has-text("Send")').catch(() => {
          return page.click('button:has-text("Send")')
        })
        await page.waitForTimeout(2000)

        return {
          success: true,
          postId: `email-${Date.now()}`,
          url: undefined // Emails don't have URLs
        }
      } finally {
        await page.close()
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send email via Playwright'
      }
    } finally {
      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }
    }
  }

  private getWebmailUrl(provider: string): string {
    const urls: Record<string, string> = {
      gmail: 'https://mail.google.com',
      outlook: 'https://outlook.live.com',
      yahoo: 'https://mail.yahoo.com',
    }
    return urls[provider.toLowerCase()] || urls.gmail
  }

  private async login(page: Page, credentials: any): Promise<void> {
    // Gmail login flow
    if (credentials.webmailProvider === 'gmail') {
      await page.fill('input[type="email"]', credentials.email)
      await page.click('button:has-text("Next")')
      await page.waitForTimeout(2000)
      await page.fill('input[type="password"]', credentials.password)
      await page.click('button:has-text("Next")')
      await page.waitForURL('**/mail/**', { timeout: 15000 })
    } else {
      // Generic login (may need customization per provider)
      await page.fill('input[type="email"]', credentials.email)
      await page.fill('input[type="password"]', credentials.password)
      await page.click('button[type="submit"]')
      await page.waitForTimeout(5000)
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
        const fileName = file.name || `file-${Date.now()}.${file.type?.split('/')[1] || 'pdf'}`
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

  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }
}

export default new EmailPlaywrightPublisher()
