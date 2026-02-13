/**
 * Attach Files
 * 
 * Attaches files to email
 * 
 * @module platforms/email/publishers/playwright/steps/attachFiles
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'
import { downloadFilesIfNeeded } from '../utils/downloadFilesIfNeeded.js'

export async function attachFiles(page: Page, files: any[]): Promise<void> {
  if (files.length > 0) {
    const filePaths = await downloadFilesIfNeeded(files)
    const fileInput = await page.$('input[type="file"]')
    if (fileInput) {
      await fileInput.setInputFiles(filePaths)
      await page.waitForTimeout(2000)
    }
  }
}
