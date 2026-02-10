import { Page } from 'playwright'

/**
 * State-based authentication detection
 * Uses POSITIVE markers (logged-in) and NEGATIVE markers (logged-out)
 * Handles redirect pages ("You are already logged in")
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  console.log(`\n🔍 [Auth State] Detecting authentication state...`)
  console.log(`🔍 [Auth State] Current URL: ${page.url()}`)
  
  try {
    // ✅ STEP 1: Check for login page (explicit state)
    if (page.url().includes('/login')) {
      console.log(`  ✅ [Auth State] Login page detected - NOT LOGGED IN`)
      return false
    }
    
    // ✅ STEP 1.5: Check for redirect page with "You are already logged in" message
    // This is a positive marker - user IS logged in, just on a redirect page
    const pageText = await page.textContent('body').catch(() => '') || ''
    if (pageText.includes('You are already logged in') || pageText.includes('already logged in')) {
      console.log(`  ✅ [Auth State] Redirect page with "already logged in" message detected - LOGGED IN`)
      console.log(`  ⏳ [Auth State] Waiting for redirect to complete...`)
      
      // Wait for redirect to complete (max 10 seconds)
      try {
        await page.waitForURL('https://www.reddit.com/**', { timeout: 10000 }).catch(() => {})
        console.log(`  ✅ [Auth State] Redirect completed, checking markers on main page...`)
      } catch (e) {
        console.log(`  ⚠️ [Auth State] Redirect timeout, but user is logged in based on message`)
        return true
      }
    }
    
    // ✅ STEP 2: Check for POSITIVE logged-in markers (one is enough)
    // These are stable, state-defining elements
    console.log(`  🔎 [Auth State] Checking for logged-in markers...`)
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
        console.log(`  ${isVisible ? '✅' : '❌'} [Auth State] Found logged-in marker: ${selector}, visible: ${isVisible}`)
        
        if (isVisible) {
          console.log(`\n✅ [Auth State] LOGGED IN - Found positive marker: ${selector}`)
          return true
        }
      }
    }
    
    // ✅ STEP 3: Check for NEGATIVE logged-out markers
    console.log(`  🔎 [Auth State] Checking for logged-out markers...`)
    const loggedOutMarkers = [
      'button:has-text("Log In")',
      'button:has-text("Anmelden")',
      'a[href*="/login"]',
    ]
    
    for (const selector of loggedOutMarkers) {
      const element = await page.$(selector).catch(() => null)
      if (element) {
        const isVisible = await element.isVisible().catch(() => false)
        console.log(`  ${isVisible ? '✅' : '❌'} [Auth State] Found logged-out marker: ${selector}, visible: ${isVisible}`)
        
        if (isVisible) {
          console.log(`\n❌ [Auth State] NOT LOGGED IN - Found negative marker: ${selector}`)
          return false
        }
      }
    }
    
    // ⚠️ STEP 4: Unknown state (neither marker found)
    // This should rarely happen if waiting was done correctly before
    console.log(`  ⚠️ [Auth State] Unknown state - neither logged-in nor logged-out marker found`)
    console.log(`  ⚠️ [Auth State] This might indicate page not fully loaded or unexpected UI state`)
    console.log(`\n❌ [Auth State] NOT LOGGED IN (defaulting to false for safety)`)
    return false
    
  } catch (error: any) {
    console.error(`  ❌ [Auth State] Error detecting auth state: ${error.message}`)
    console.error(`  📍 [Auth State] Stack: ${error.stack}`)
    return false
  }
}
