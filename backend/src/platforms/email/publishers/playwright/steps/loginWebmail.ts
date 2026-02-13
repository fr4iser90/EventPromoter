/**
 * Login
 * 
 * Logs into webmail provider
 * 
 * @module platforms/email/publishers/playwright/steps/loginWebmail
 */

// @ts-ignore - Playwright is optional dependency
import { Page } from 'playwright'
import { login } from '../utils/login.js'

export async function loginWebmail(page: Page, credentials: any): Promise<void> {
  await login(page, credentials)
}
