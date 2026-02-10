/**
 * Step 5: Enter Recipients
 * 
 * Enters recipient email addresses
 * 
 * @module platforms/email/publishers/playwright/steps/step5_EnterRecipients
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'

export async function step5_EnterRecipients(page: Page, recipients: string[]): Promise<void> {
  const toField = await page.waitForSelector('input[aria-label*="To"]', { timeout: 5000 })
  await toField.fill(recipients.join(', '))
}
