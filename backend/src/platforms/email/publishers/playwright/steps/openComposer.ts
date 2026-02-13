/**
 * Compose Email
 * 
 * Clicks compose/new email button
 * 
 * @module platforms/email/publishers/playwright/steps/openComposer
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'

export async function openComposer(page: Page): Promise<void> {
  await page.click('div[role="button"]:has-text("Compose")').catch(() => {
    return page.click('button:has-text("New")')
  })
  await page.waitForTimeout(2000)
}
