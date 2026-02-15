import { Page } from 'playwright'

/**
 * State-based authentication detection
 * Uses POSITIVE markers (logged-in) and NEGATIVE markers (logged-out)
 * Handles redirect pages ("You are already logged in")
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  
  try {
    // ✅ STEP 1: Check for login page (explicit state)
    if (page.url().includes('/login')) {
      return false
    }
    
    // ✅ STEP 1.5: Check for redirect page with "You are already logged in" message
    // This is a positive marker - user IS logged in, just on a redirect page
    const pageText = await page.textContent('body').catch(() => '') || ''
    if (pageText.includes('You are already logged in') || pageText.includes('already logged in')) {
      
      // Wait for redirect to complete (max 10 seconds)
      try {
        await page.waitForURL('https://www.reddit.com/**', { timeout: 10000 }).catch(() => {})
      } catch (e) {
        return true
      }
    }
    
    // ✅ STEP 2: Check for POSITIVE logged-in markers (one is enough)
    // These are stable, state-defining elements
    const loggedInMarkers = [
      'a[href="/logout"]',                    // Logout link (most stable)
      'a[href*="/logout"]',                    // Logout link variants
      'button[id*="USER_DROPDOWN"]',          // User dropdown button
      'button[aria-label*="User"]',           // User button variants
      'span[avatar]',                         // Avatar element (from HTML)
      'img[alt*="User Avatar"]',              // Avatar image
      'a[href^="/user/"]',                    // User profile link
    ]
    
    for (const selector of loggedInMarkers) {
      const element = await page.$(selector).catch(() => null)
      if (element) {
        const isVisible = await element.isVisible().catch(() => false)
        
        if (isVisible) {
          return true
        }
      }
    }
    
    // ✅ STEP 3: Check for NEGATIVE logged-out markers
    const loggedOutMarkers = [
      'button:has-text("Log In")',
      'button:has-text("Anmelden")',
      'a[href*="/login"]',
    ]
    
    for (const selector of loggedOutMarkers) {
      const element = await page.$(selector).catch(() => null)
      if (element) {
        const isVisible = await element.isVisible().catch(() => false)
        
        if (isVisible) {
          return false
        }
      }
    }
    
    // ⚠️ STEP 4: Unknown state (neither marker found)
    // This should rarely happen if waiting was done correctly before
    return false
    
  } catch (error: any) {
    return false
  }
}
