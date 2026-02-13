/**
 * Launch Browser
 * 
 * Launches Chromium browser for Playwright
 * 
 * @module platforms/email/publishers/playwright/steps/launchBrowser
 */

// @ts-ignore - Playwright is optional dependency
import { chromium, Browser } from 'playwright'

export async function launchBrowser(): Promise<Browser> {
  return await chromium.launch({ headless: true })
}
