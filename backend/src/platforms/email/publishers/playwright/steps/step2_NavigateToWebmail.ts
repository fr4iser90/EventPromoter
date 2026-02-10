/**
 * Step 2: Navigate to Webmail
 * 
 * Navigates to webmail provider URL
 * 
 * @module platforms/email/publishers/playwright/steps/step2_NavigateToWebmail
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'
import { getWebmailUrl } from '../utils/getWebmailUrl.js'

export async function step2_NavigateToWebmail(page: Page, webmailProvider: string): Promise<void> {
  const webmailUrl = getWebmailUrl(webmailProvider)
  await page.goto(webmailUrl, { waitUntil: 'networkidle' })
}
