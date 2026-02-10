/**
 * Step 3: Login
 * 
 * Logs into webmail provider
 * 
 * @module platforms/email/publishers/playwright/steps/step3_Login
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'
import { login } from '../utils/login.js'

export async function step3_Login(page: Page, credentials: any): Promise<void> {
  await login(page, credentials)
}
