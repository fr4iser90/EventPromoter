/**
 * Enter Body
 * 
 * Enters email body content
 * 
 * @module platforms/email/publishers/playwright/steps/enterBody
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'
import { htmlToText } from '../utils/htmlToText.js'

export async function enterBody(page: Page, html: string): Promise<void> {
  const bodyField = await page.$('div[aria-label*="Message"]').catch(() => {
    return page.$('div[contenteditable="true"]')
  })
  if (bodyField) {
    const text = htmlToText(html || '')
    await bodyField.fill(text)
  }
}
