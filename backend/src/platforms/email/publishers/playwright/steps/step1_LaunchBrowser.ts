/**
 * Step 1: Launch Browser
 * 
 * Launches Chromium browser for Playwright
 * 
 * @module platforms/email/publishers/playwright/steps/step1_LaunchBrowser
 */

// @ts-ignore - Playwright is optional dependency
import { chromium, Browser } from 'playwright'

export async function step1_LaunchBrowser(): Promise<Browser> {
  return await chromium.launch({ headless: true })
}
