import { Page } from 'playwright'
import { waitForPageFullyLoaded } from '../utils/waitForPageFullyLoaded.js'
import { isLoggedIn } from '../utils/isLoggedIn.js'
import { getLoggedInUsername } from '../utils/getLoggedInUsername.js'
import { login } from '../utils/login.js'

export async function loginCheck(page: Page, credentials: any): Promise<void> {
  // Browser starten (wird bereits vorher gemacht)
  // Navigation zu Reddit
  console.log(`\n🌐 [Step 1] Starting navigation to Reddit...`)
  await page.goto('https://www.reddit.com', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000
  })
  console.log(`✅ [Step 1] Navigation successful!`)
  
  // Warten auf vollständiges Laden
  await waitForPageFullyLoaded(page, 'Step 1: After initial navigation to Reddit')
  
  // Cookie-Banner handhaben (falls vorhanden)
  const pageText = await page.textContent('body').catch(() => '') || ''
  if (pageText.includes('You are already logged in') || pageText.includes('already logged in')) {
    console.log(`🌐 [Step 1] Redirect page detected - handling cookie banner...`)
    
    try {
      const acceptCookiesButton = await page.$('button:has-text("Accept All"), button:has-text("Alle akzeptieren")').catch(() => null)
      if (acceptCookiesButton) {
        const isVisible = await acceptCookiesButton.isVisible().catch(() => false)
        if (isVisible) {
          console.log(`🌐 [Step 1] Cookie banner found - accepting cookies...`)
          await acceptCookiesButton.click()
          await waitForPageFullyLoaded(page, 'Step 1: After accepting cookies')
        }
      }
    } catch (e) {
      console.log(`⚠️ [Step 1] Cookie banner handling failed: ${(e as Error).message}`)
    }
    
    // Redirect handhaben
    try {
      await page.waitForURL('https://www.reddit.com/**', { timeout: 30000 })
      await waitForPageFullyLoaded(page, 'Step 1: After redirect to main page')
    } catch (e) {
      console.log(`⚠️ [Step 1] Redirect timeout, but continuing...`)
    }
  }
  
  // Warten auf Auth-Marker
  await page.waitForSelector('header, nav, [role="navigation"], a[href="/logout"], button[id*="USER_DROPDOWN"], span[avatar], img[alt*="User Avatar"], a[href^="/user/"], button:has-text("Log In"), button:has-text("Anmelden")', { 
    timeout: 30000,
    state: 'visible'
  })
  
  // Warten auf React/JS
  try {
    await page.waitForFunction(() => {
      const isInteractive = document.readyState === 'complete'
      const hasReact = typeof (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' ||
                       document.querySelector('[data-reactroot]') !== null ||
                       document.querySelector('[id*="react"]') !== null
      const authElement = document.querySelector('span[avatar], a[href^="/user/"], button[id*="USER_DROPDOWN"], a[href="/logout"]')
      const hasAuthElements = authElement !== null
      const isAuthVisible = authElement ? (authElement as HTMLElement).offsetParent !== null : false
      return isInteractive && (hasReact || hasAuthElements) && isAuthVisible
    }, { timeout: 20000 })
  } catch (e) {
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 })
    } catch (e2) {
      // Ignore
    }
  }
  
  await waitForPageFullyLoaded(page, 'Step 1: Final check before login check')
  
  // isLoggedIn() prüfen
  console.log(`\n🔍 [Step 1] Starting login check...`)
  const loggedIn = await isLoggedIn(page)
  let needsLogin = !loggedIn
  
  if (loggedIn) {
    // getLoggedInUsername() prüfen
    await page.waitForSelector('a[href^="/user/"], a[href*="/user/"]', { 
      timeout: 10000,
      state: 'visible'
    }).catch(() => {})
    
    const loggedInUser = await getLoggedInUsername(page)
    const expectedUser = credentials.username.toLowerCase().trim()
    const actualUser = loggedInUser ? loggedInUser.toLowerCase().trim() : null
    
    // Username vergleichen
    if (actualUser && actualUser === expectedUser) {
      console.log(`✅ [Step 1] Already logged in as correct user: ${loggedInUser}`)
      needsLogin = false
    } else if (actualUser) {
      console.warn(`⚠️ [Step 1] Wrong user logged in: ${loggedInUser} (expected: ${credentials.username})`)
      needsLogin = true
      // Logout
      try {
        await page.goto('https://www.reddit.com/logout', { 
          waitUntil: 'domcontentloaded',
          timeout: 30000
        }).catch(() => {})
        await waitForPageFullyLoaded(page, 'Step 1: After navigation to logout page').catch(() => {})
      } catch (e) {
        // Ignore
      }
    } else {
      // ✅ FIX: Wenn Username nicht extrahiert werden kann, aber isLoggedIn() true ist,
      // dann sind wir trotzdem eingeloggt - KEIN Login-Versuch!
      console.log(`✅ [Step 1] Already logged in (username detection failed, but login markers present)`)
      needsLogin = false  // ✅ WICHTIG: Nicht versuchen zu loggen!
    }
  }
  
  // Login durchführen (falls nötig)
  if (needsLogin) {
    const loginSuccess = await login(page, credentials)
    if (!loginSuccess) {
      throw new Error('Failed to login to Reddit. Please check credentials and try again.')
    }
    
    // Login verifizieren
    const verifyLoggedIn = await isLoggedIn(page)
    if (!verifyLoggedIn) {
      throw new Error('Login appeared to succeed but user is not logged in. Please check credentials.')
    }
    
    const verifyUser = await getLoggedInUsername(page)
    if (verifyUser && verifyUser.toLowerCase() !== credentials.username.toLowerCase()) {
      throw new Error(`Logged in as wrong user: ${verifyUser} (expected: ${credentials.username})`)
    }
    
    console.log(`✅ [Step 1] Login verification passed!`)
  }
}
