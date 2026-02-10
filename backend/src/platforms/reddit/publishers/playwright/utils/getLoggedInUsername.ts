import { Page } from 'playwright'
import { waitForPageFullyLoaded } from './waitForPageFullyLoaded.js'

/**
 * Get the username of the currently logged in user
 * ONLY searches in Header/User-Menu area, NOT in feed content
 */
export async function getLoggedInUsername(page: Page): Promise<string | null> {
  console.log('\n🔍 [Username Detection] Starting username detection...')
  console.log(`🔍 [Username Detection] Current URL: ${page.url()}`)
  
  // ✅ Log what elements are currently visible on the page
  console.log(`🔍 [Username Detection] Checking what elements are visible on the page...`)
  const avatarCount = await page.$$('span[avatar], img[alt*="User Avatar"]').then(els => els.length).catch(() => 0)
  const userLinkCount = await page.$$('a[href^="/user/"], a[href*="/user/"]').then(els => els.length).catch(() => 0)
  const logoutLinkCount = await page.$$('a[href="/logout"], a[href*="/logout"]').then(els => els.length).catch(() => 0)
  console.log(`  📊 [Username Detection] Page state:`)
  console.log(`    - Avatar elements: ${avatarCount}`)
  console.log(`    - User profile links: ${userLinkCount}`)
  console.log(`    - Logout links: ${logoutLinkCount}`)
  
  try {
    // STEP 1: Find header/navigation area first (NOT in feed)
    console.log(`\n📋 [Username Detection] STEP 1: Finding header/navigation area...`)
    const headerSelectors = [
      'header',
      'nav',
      '[role="navigation"]',
      '[id*="header"]',
      '[class*="header"]',
      '[class*="Header"]',
      '[class*="navbar"]',
      '[class*="Navbar"]'
    ]
    
    let headerElement = null
    for (const selector of headerSelectors) {
      try {
        console.log(`  🔎 [Username Detection] Trying header selector: ${selector}`)
        const element = await page.$(selector).catch(() => null)
        if (element) {
          const isVisible = await element.isVisible().catch(() => false)
          console.log(`  ${isVisible ? '✅' : '❌'} [Username Detection] Found element with selector "${selector}", visible: ${isVisible}`)
          if (isVisible) {
            headerElement = element
            console.log(`  ✅ [Username Detection] Using header element from selector: ${selector}`)
            break
          }
        } else {
          console.log(`  ❌ [Username Detection] No element found with selector: ${selector}`)
        }
      } catch (e: any) {
        console.log(`  ❌ [Username Detection] Error with selector "${selector}": ${e.message}`)
      }
    }
    
    if (!headerElement) {
      console.log(`  ⚠️ [Username Detection] No header found, will search in entire page (less reliable)`)
    }

    // STEP 2: Find User Menu Button in Header
    console.log(`\n📋 [Username Detection] STEP 2: Finding user menu button in header...`)
    const userButtonSelectors = [
      'button[id*="USER_DROPDOWN"]',
      'button[aria-label*="User"]',
      'button[aria-label*="user"]',
      'button[id*="user-menu"]',
      'button[id*="userMenu"]',
      'button[data-testid*="user"]',
      'button[class*="user-menu"]',
      'button[class*="UserMenu"]'
    ]
    
    let userButton = null
    for (const selector of userButtonSelectors) {
      try {
        console.log(`  🔎 [Username Detection] Trying user button selector: ${selector}`)
        let element = null
        if (headerElement) {
          // Search only in header
          element = await headerElement.$(selector).catch(() => null)
          console.log(`  📍 [Username Detection] Searching in header element`)
        } else {
          // Search in entire page
          element = await page.$(selector).catch(() => null)
          console.log(`  📍 [Username Detection] Searching in entire page`)
        }
        
        if (element) {
          const isVisible = await element.isVisible().catch(() => false)
          const buttonText = await element.textContent().catch(() => '')
          const buttonId = await element.getAttribute('id').catch(() => '')
          const buttonAriaLabel = await element.getAttribute('aria-label').catch(() => '')
          
          console.log(`  ${isVisible ? '✅' : '❌'} [Username Detection] Found button with selector "${selector}"`)
          console.log(`    - Visible: ${isVisible}`)
          console.log(`    - Text: "${buttonText}"`)
          console.log(`    - ID: "${buttonId}"`)
          console.log(`    - Aria-label: "${buttonAriaLabel}"`)
          
          if (isVisible && buttonText && buttonText.trim().length > 0 && !buttonText.includes('Log In') && !buttonText.includes('Anmelden')) {
            const username = buttonText.trim()
            console.log(`  ✅ [Username Detection] Found username from button text: "${username}"`)
            return username
          }
          
          if (isVisible) {
            userButton = element
            console.log(`  ✅ [Username Detection] Found user button (text not usable), will try to open menu`)
            break
          }
        } else {
          console.log(`  ❌ [Username Detection] No button found with selector: ${selector}`)
        }
      } catch (e: any) {
        console.log(`  ❌ [Username Detection] Error with selector "${selector}": ${e.message}`)
      }
    }

    // STEP 3: Open user menu and extract username
    if (userButton) {
      console.log(`\n📋 [Username Detection] STEP 3: Opening user menu dropdown...`)
      try {
        const isVisible = await userButton.isVisible().catch(() => false)
        console.log(`  📍 [Username Detection] User button visible: ${isVisible}`)
        
        if (isVisible) {
          console.log(`  🖱️ [Username Detection] Clicking user button to open menu...`)
          await userButton.click()
          console.log(`  ✅ [Username Detection] Clicked user button`)
          
          // ✅ CRITICAL: Wait for page to be fully loaded after click
          await waitForPageFullyLoaded(page, 'After clicking user button to open menu')
          
          // Now search for username in the opened menu
          console.log(`  🔎 [Username Detection] Searching for username in opened menu...`)
          const menuUsernameSelectors = [
            'a[href*="/user/"][href*="profile"]',
            'a[href*="/u/"][href*="profile"]',
            '[data-testid="user-menu"] a[href*="/user/"]',
            '[data-testid="user-menu"] a[href*="/u/"]',
            '[id*="user-menu"] a[href*="/user/"]',
            '[id*="user-menu"] a[href*="/u/"]',
            '[role="menu"] a[href*="/user/"]',
            '[role="menu"] a[href*="/u/"]',
            'a[href^="/user/"]',
            'a[href^="/u/"]'
          ]
          
          for (const selector of menuUsernameSelectors) {
            try {
              console.log(`    🔎 [Username Detection] Trying menu selector: ${selector}`)
              const menuLink = await page.$(selector).catch(() => null)
              if (menuLink) {
                const isVisible = await menuLink.isVisible().catch(() => false)
                const linkText = await menuLink.textContent().catch(() => '')
                const href = await menuLink.getAttribute('href').catch(() => '')
                
                console.log(`    ${isVisible ? '✅' : '❌'} [Username Detection] Found menu link with selector "${selector}"`)
                console.log(`      - Visible: ${isVisible}`)
                console.log(`      - Text: "${linkText}"`)
                console.log(`      - Href: "${href}"`)
                
                if (isVisible) {
                  // Check if it's in a promoted/ad container
                  const isPromoted = await menuLink.evaluate(el => {
                    const promoted = el.closest('[class*="promoted"], [class*="ad"], [class*="sponsor"], [data-promoted="true"]')
                    return promoted !== null
                  }).catch(() => false)
                  
                  console.log(`      - Is promoted/ad: ${isPromoted}`)
                  
                  if (!isPromoted) {
                    if (linkText && linkText.trim().length > 0) {
                      const username = linkText.trim().replace(/^u\//, '')
                      console.log(`    ✅ [Username Detection] Found username from menu link text: "${username}"`)
                      return username
                    }
                    
                    if (href) {
                      const match = href.match(/\/(?:u|user)\/([^\/\?]+)/)
                      if (match && match[1]) {
                        const username = match[1]
                        console.log(`    ✅ [Username Detection] Found username from menu link href: "${username}"`)
                        return username
                      }
                    }
                  } else {
                    console.log(`    ⚠️ [Username Detection] Skipping promoted/ad link`)
                  }
                }
              } else {
                console.log(`    ❌ [Username Detection] No menu link found with selector: ${selector}`)
              }
            } catch (e: any) {
              console.log(`    ❌ [Username Detection] Error with menu selector "${selector}": ${e.message}`)
            }
          }
        }
      } catch (e: any) {
        console.log(`  ❌ [Username Detection] Error opening user menu: ${e.message}`)
        console.log(`  📍 [Username Detection] Stack: ${e.stack}`)
      }
    }

    // STEP 4: Fallback - Search for username link on entire page (like isLoggedIn does)
    // ALWAYS search entire page, NOT just header (username links are not in header)
    console.log(`\n📋 [Username Detection] STEP 4: Fallback - Searching for username link on entire page (excluding feed)...`)
    const usernameLinkSelectors = [
      'a[href^="/user/"]',  // Exact match first
      'a[href*="/user/"]',  // Then partial match
      'a[href^="/u/"]',
      'a[href*="/u/"]'
    ]
    
    for (const selector of usernameLinkSelectors) {
      try {
        console.log(`  🔎 [Username Detection] Trying username link selector: ${selector}`)
        
        // ✅ ALWAYS search entire page (like isLoggedIn does), not just header
        const allLinks = await page.$$(selector).catch(() => [])
        console.log(`  📍 [Username Detection] Searching in entire page, found ${allLinks.length} total links`)
        
        // Filter out links in feed/promoted content (more precise filter)
        const links = []
        for (const link of allLinks) {
          const isInFeed = await link.evaluate(el => {
            // ✅ More precise: Only filter if in actual feed/post listing, not just any container with "post" in class
            // Check for actual feed containers (main feed, post listings)
            const feed = el.closest('[class*="feed"]:not([class*="profile"]), [id*="feed"], [data-testid*="post"], [role="article"]')
            
            // Check for promoted/ad content
            const promoted = el.closest('[class*="promoted"], [class*="ad"], [class*="sponsor"], [data-promoted="true"]')
            
            // Check if link is in a post/article (but NOT in header/nav/profile)
            const isInPost = el.closest('[role="article"], [class*="Post"], [class*="post-container"]:not(header):not(nav)')
            
            // Only filter if in actual feed/post, not in header/nav/profile areas
            const isInHeaderNav = el.closest('header, nav, [role="navigation"], [class*="header"], [class*="nav"], [class*="profile"]') !== null
            
            if (isInHeaderNav) {
              return false // Keep links in header/nav/profile
            }
            
            return feed !== null || promoted !== null || isInPost !== null
          }).catch(() => false)
          
          if (!isInFeed) {
            links.push(link)
          }
        }
        console.log(`  📍 [Username Detection] After filtering feed content: ${links.length} links (excluding feed/promoted)`)
        
        for (const link of links) {
          try {
            const isVisible = await link.isVisible().catch(() => false)
            const linkText = await link.textContent().catch(() => '')
            const href = await link.getAttribute('href').catch(() => '')
            
            // Check if it's promoted/ad
            const isPromoted = await link.evaluate(el => {
              const promoted = el.closest('[class*="promoted"], [class*="ad"], [class*="sponsor"], [data-promoted="true"]')
              return promoted !== null
            }).catch(() => false)
            
            console.log(`  ${isVisible && !isPromoted ? '✅' : '❌'} [Username Detection] Link found:`)
            console.log(`    - Visible: ${isVisible}`)
            console.log(`    - Is promoted/ad: ${isPromoted}`)
            console.log(`    - Text: "${linkText}"`)
            console.log(`    - Href: "${href}"`)
            
            if (isVisible && !isPromoted) {
              if (linkText && linkText.trim().length > 0) {
                const username = linkText.trim().replace(/^u\//, '')
                console.log(`  ✅ [Username Detection] Found username from link text: "${username}"`)
                return username
              }
              
              if (href) {
                const match = href.match(/\/(?:u|user)\/([^\/\?]+)/)
                if (match && match[1]) {
                  const username = match[1]
                  console.log(`  ✅ [Username Detection] Found username from link href: "${username}"`)
                  return username
                }
              }
            } else if (isPromoted) {
              console.log(`  ⚠️ [Username Detection] Skipping promoted/ad link`)
            }
          } catch (e: any) {
            console.log(`  ❌ [Username Detection] Error processing link: ${e.message}`)
          }
        }
      } catch (e: any) {
        console.log(`  ❌ [Username Detection] Error with selector "${selector}": ${e.message}`)
      }
    }

    console.log(`\n❌ [Username Detection] Could not find username - all methods failed`)
    return null
  } catch (error: any) {
    console.error(`\n❌ [Username Detection] CRITICAL ERROR: ${error.message}`)
    console.error(`  📍 [Username Detection] Stack: ${error.stack}`)
    return null
  }
}
