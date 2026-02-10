/**
 * Step 9: Send Email
 * 
 * Clicks send button to send email
 * 
 * @module platforms/email/publishers/playwright/steps/step9_SendEmail
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'

export async function step9_SendEmail(page: Page): Promise<void> {
  await page.click('div[role="button"]:has-text("Send")').catch(() => {
    return page.click('button:has-text("Send")')
  })
  await page.waitForTimeout(2000)
}
