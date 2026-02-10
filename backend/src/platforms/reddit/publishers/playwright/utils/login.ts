import { Page } from 'playwright'
import { waitForPageFullyLoaded } from './waitForPageFullyLoaded.js'
import { isLoggedIn } from './isLoggedIn.js'
import { getLoggedInUsername } from './getLoggedInUsername.js'

/**
 * Login to Reddit with improved selectors and error handling
 */
export async function login(page: Page, credentials: any): Promise<boolean> {
  try {
    console.log('🔐 Attempting to login to Reddit...')
    console.log('🌐 [Login] Navigating to login page...')
    await page.goto('https://www.reddit.com/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })
    console.log('✅ [Login] Login page loaded')
    
    // ✅ CRITICAL: Wait for page to be fully loaded
    await waitForPageFullyLoaded(page, 'After navigation to login page')
    
    console.log('🌐 [Login] Waiting for username input field...')
    await page.waitForSelector('input[name="username"], input[id*="loginUsername"], input[type="text"]', { timeout: 10000 })
    console.log('✅ [Login] Username input field found')
    
    const usernameSelectors = [
      'input[name="username"]',
      'input[id*="loginUsername"]',
      'input[placeholder*="Username"]',
      'input[type="text"]'
    ]
    
    let usernameFilled = false
    for (const selector of usernameSelectors) {
      try {
        const input = await page.$(selector)
        if (input) {
          await input.fill(credentials.username)
          usernameFilled = true
          console.log(`✅ Filled username using selector: ${selector}`)
          break
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!usernameFilled) {
      throw new Error('Username input not found - tried multiple selectors')
    }

    // Fill password (try multiple selectors)
    const passwordSelectors = [
      'input[name="password"]',
      'input[id*="loginPassword"]',
      'input[type="password"]'
    ]
    
    let passwordFilled = false
    for (const selector of passwordSelectors) {
      try {
        const input = await page.$(selector)
        if (input) {
          await input.fill(credentials.password)
          passwordFilled = true
          console.log(`✅ Filled password using selector: ${selector}`)
          break
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!passwordFilled) {
      throw new Error('Password input not found - tried multiple selectors')
    }

    const submitSelectors = [
      'button.login', // Class-based selector
      'button[class*="login"]', // Contains "login" in class
      'button.button-brand', // Brand button class
      'button:has-text("Anmelden")', // German "Log In"
      'button:has-text("Log In")', // English
      'button:has-text("Sign in")', // Alternative English
      'button:has-text("Login")', // Simple
      'button[type="submit"]', // Standard submit
      'button[id*="login"]', // ID contains login
      'form button[type="submit"]', // Form submit
      'form button.login', // Form button with login class
      'button[class*="button-brand"]' // Brand button
    ]
    
    let submitClicked = false
    for (const selector of submitSelectors) {
      try {
        const button = await page.$(selector)
        if (button) {
          const isVisible = await button.isVisible().catch(() => false)
          if (isVisible) {
            await button.click()
            submitClicked = true
            console.log(`✅ Clicked submit using selector: ${selector}`)
            
            // ✅ CRITICAL: Wait for page to be fully loaded after login submit
            await waitForPageFullyLoaded(page, 'After clicking login submit button')
            break
          }
        }
      } catch (e) {
        // Try next selector
      }
    }

    // If still not found, try to find by text content
    if (!submitClicked) {
      try {
        const allButtons = await page.$$('button')
        for (const button of allButtons) {
          const text = await button.textContent().catch(() => '')
          const className = await button.getAttribute('class').catch(() => '')
          if ((text && (text.includes('Anmelden') || text.includes('Log In') || text.includes('Sign in') || text.includes('Login'))) ||
              (className && className.includes('login'))) {
            const isVisible = await button.isVisible().catch(() => false)
            if (isVisible) {
              await button.click()
              submitClicked = true
              console.log(`✅ Clicked submit by text/class: "${text}" / "${className}"`)
              
              // ✅ CRITICAL: Wait for page to be fully loaded after login submit
              await waitForPageFullyLoaded(page, 'After clicking login submit button (text content)')
              break
            }
          }
        }
      } catch (e) {
        console.warn('Failed to find button by text content:', e)
      }
    }

    if (!submitClicked) {
      throw new Error('Submit button not found - tried multiple selectors and text matching')
    }

    // ✅ CRITICAL: Wait for page to be fully loaded after login
    await waitForPageFullyLoaded(page, 'After login submit (final check)')
    
    console.log(`\n🔍 [Login] Checking if login was successful...`)
    const loggedIn = await isLoggedIn(page)
    console.log(`🔍 [Login] Is logged in check result: ${loggedIn}`)
    
    if (loggedIn) {
      console.log(`\n📋 [Login] Login check passed, now detecting username...`)
      console.log(`📋 [Login] Calling getLoggedInUsername() to verify which user is logged in...`)
      const loggedInUser = await getLoggedInUsername(page)
      console.log(`\n✅ [Login] Login successful! Detected logged in user: ${loggedInUser || 'unknown'}`)
      return true
    }
    const errorSelectors = [
      '.error',
      '[role="alert"]',
      '.AnimatedForm__errorMessage',
      '[class*="error"]',
      '[class*="Error"]',
      '.error-message'
    ]
    
    for (const selector of errorSelectors) {
      try {
        const errorMsg = await page.$(selector)
        if (errorMsg) {
          const errorText = await errorMsg.textContent()
          if (errorText && errorText.trim().length > 0) {
            throw new Error(`Login failed: ${errorText.trim()}`)
          }
        }
      } catch (e) {
        // Not an error element or already thrown
        if (e instanceof Error && e.message.startsWith('Login failed')) {
          throw e
        }
      }
    }

    console.warn('⚠️ Login status unclear - no error message found but not logged in')
    return false
  } catch (error: any) {
    console.error('❌ Login error:', error.message)
    return false
  }
}
