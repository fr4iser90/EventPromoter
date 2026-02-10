/**
 * Login to Webmail
 * 
 * Logs into webmail provider (Gmail, Outlook, etc.)
 * 
 * @module platforms/email/publishers/playwright/utils/login
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'

export async function login(page: Page, credentials: any): Promise<void> {
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
