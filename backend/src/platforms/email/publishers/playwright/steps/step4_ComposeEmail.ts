/**
 * Step 4: Compose Email
 * 
 * Clicks compose/new email button
 * 
 * @module platforms/email/publishers/playwright/steps/step4_ComposeEmail
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'

export async function step4_ComposeEmail(page: Page): Promise<void> {
  await page.click('div[role="button"]:has-text("Compose")').catch(() => {
    return page.click('button:has-text("New")')
  })
  await page.waitForTimeout(2000)
}
