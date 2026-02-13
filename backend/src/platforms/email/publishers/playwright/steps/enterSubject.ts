/**
 * Enter Subject
 * 
 * Enters email subject
 * 
 * @module platforms/email/publishers/playwright/steps/enterSubject
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'

export async function enterSubject(page: Page, subject: string): Promise<void> {
  const subjectField = await page.$('input[name="subjectbox"]').catch(() => {
    return page.$('input[placeholder*="Subject"]')
  })
  if (subjectField) {
    await subjectField.fill(subject || 'Event Notification')
  }
}
