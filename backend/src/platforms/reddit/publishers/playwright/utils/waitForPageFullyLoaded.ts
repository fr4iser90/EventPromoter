import { Page } from 'playwright'

/**
 * ✅ CRITICAL: Wait for page to be fully loaded before proceeding
 * 
 * Based on official Playwright documentation:
 * - networkidle is discouraged for testing, rely on web assertions instead
 * - https://playwright.dev/docs/navigations#waiting-for-network-idle
 * 
 * This function waits for:
 * 1. Load event (current navigation, not first one)
 * 2. DOM ready state
 * 3. Specific elements to be visible (web assertions)
 */
export async function waitForPageFullyLoaded(page: Page, stepName: string = 'Unknown step'): Promise<void> {
  console.log(`⏳ [Page Load] ${stepName} - Waiting for page to be fully loaded...`)
  
  try {
    // Step 1: Wait for load event (current navigation)
    await page.waitForLoadState('load', { timeout: 30000 })
    console.log(`✅ [Page Load] ${stepName} - Page load event completed`)
    
    // Step 2: Wait for DOM to be ready
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
    
    // Step 3: Wait for page to be interactive
    await page.waitForFunction(() => {
      return document.readyState === 'complete'
    }, { timeout: 10000 })
    
    // Step 4: Web assertions - wait for specific elements (recommended by Playwright docs)
    // Wait for body to be visible (confirms page is rendered)
    await page.waitForSelector('body', { state: 'visible', timeout: 5000 })
    
    // Wait for common page elements that indicate page is ready
    await page.waitForSelector('header, nav, [role="navigation"], main, body > *', { 
      state: 'visible', 
      timeout: 10000 
    }).catch(() => {
      // If no header/nav found, at least body should be visible
      console.log(`⚠️ [Page Load] ${stepName} - No header/nav found, but body is visible`)
    })
    
    console.log(`✅ [Page Load] ${stepName} - Page is fully loaded and ready`)
  } catch (error: any) {
    console.error(`❌ [Page Load] ${stepName} - Error waiting for page load: ${error.message}`)
    throw error
  }
}
