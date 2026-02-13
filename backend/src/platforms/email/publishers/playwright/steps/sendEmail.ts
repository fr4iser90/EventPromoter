/**
 * Send Email
 * 
 * Clicks send button to send email
 * 
 * @module platforms/email/publishers/playwright/steps/sendEmail
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'

export async function sendEmail(page: Page): Promise<void> {
  await page.click('div[role="button"]:has-text("Send")').catch(() => {
    return page.click('button:has-text("Send")')
  })
  await page.waitForTimeout(2000)
}
