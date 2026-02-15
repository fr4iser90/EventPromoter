import { Page } from 'playwright'
import { waitForPageFullyLoaded } from './waitForPageFullyLoaded.js'

/**
 * Get the username of the currently logged in user
 * ONLY searches in Header/User-Menu area, NOT in feed content
 */
export async function getLoggedInUsername(page: Page): Promise<string | null> {
  console.log('\n🔍 [Username Detection] Starting username detection...')
  
  // ✅ Log what elements are currently visible on the page
  const avatarCount = await page.$$('span[avatar], img[alt*="User Avatar"]').then(els => els.length).catch(() => 0)
  const userLinkCount = await page.$$('a[href^="/user/"], a[href*="/user/"]').then(els => els.length).catch(() => 0)
  const logoutLinkCount = await page.$$('a[href="/logout"], a[href*="/logout"]').then(els => els.length).catch(() => 0)
  
  try {
    // STEP 1: Find header/navigation area first (NOT in feed)
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
        const element = await page.$(selector).catch(() => null)
        if (element) {
          const isVisible = await element.isVisible().catch(() => false)
          if (isVisible) {
            headerElement = element
            break
          }
        } else {
        }
      } catch (e: any) {
      }
    }
    
    if (!headerElement) {
    }

    // STEP 2: Find User Menu Button in Header
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
        let element = null
        if (headerElement) {
          // Search only in header
          element = await headerElement.$(selector).catch(() => null)
        } else {
          // Search in entire page
          element = await page.$(selector).catch(() => null)
        }
        
        if (element) {
          const isVisible = await element.isVisible().catch(() => false)
          const buttonText = await element.textContent().catch(() => '')
          const buttonId = await element.getAttribute('id').catch(() => '')
          const buttonAriaLabel = await element.getAttribute('aria-label').catch(() => '')
          
          
          if (isVisible && buttonText && buttonText.trim().length > 0 && !buttonText.includes('Log In') && !buttonText.includes('Anmelden')) {
            const username = buttonText.trim()
            return username
          }
          
          if (isVisible) {
            userButton = element
            break
          }
        } else {
        }
      } catch (e: any) {
      }
    }

    // STEP 3: Open user menu and extract username
    if (userButton) {
      try {
        const isVisible = await userButton.isVisible().catch(() => false)
        
        if (isVisible) {
          await userButton.click()
          
          // ✅ CRITICAL: Wait for page to be fully loaded after click
          await waitForPageFullyLoaded(page, 'After clicking user button to open menu')
          
          // Now search for username in the opened menu
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
              const menuLink = await page.$(selector).catch(() => null)
              if (menuLink) {
                const isVisible = await menuLink.isVisible().catch(() => false)
                const linkText = await menuLink.textContent().catch(() => '')
                const href = await menuLink.getAttribute('href').catch(() => '')
                
                
                if (isVisible) {
                  // Check if it's in a promoted/ad container
                  const isPromoted = await menuLink.evaluate(el => {
                    const promoted = el.closest('[class*="promoted"], [class*="ad"], [class*="sponsor"], [data-promoted="true"]')
                    return promoted !== null
                  }).catch(() => false)
                  
                  
                  if (!isPromoted) {
                    if (linkText && linkText.trim().length > 0) {
                      const username = linkText.trim().replace(/^u\//, '')
                      return username
                    }
                    
                    if (href) {
                      const match = href.match(/\/(?:u|user)\/([^\/\?]+)/)
                      if (match && match[1]) {
                        const username = match[1]
                        return username
                      }
                    }
                  } else {
                  }
                }
              } else {
              }
            } catch (e: any) {
            }
          }
        }
      } catch (e: any) {
      }
    }

    // STEP 4: Fallback - Search for username link on entire page (like isLoggedIn does)
    // ALWAYS search entire page, NOT just header (username links are not in header)
    const usernameLinkSelectors = [
      'a[href^="/user/"]',  // Exact match first
      'a[href*="/user/"]',  // Then partial match
      'a[href^="/u/"]',
      'a[href*="/u/"]'
    ]
    
    for (const selector of usernameLinkSelectors) {
      try {
        
        // ✅ ALWAYS search entire page (like isLoggedIn does), not just header
        const allLinks = await page.$$(selector).catch(() => [])
        
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
            
            
            if (isVisible && !isPromoted) {
              if (linkText && linkText.trim().length > 0) {
                const username = linkText.trim().replace(/^u\//, '')
                return username
              }
              
              if (href) {
                const match = href.match(/\/(?:u|user)\/([^\/\?]+)/)
                if (match && match[1]) {
                  const username = match[1]
                  return username
                }
              }
            } else if (isPromoted) {
            }
          } catch (e: any) {
          }
        }
      } catch (e: any) {
      }
    }

    return null
  } catch (error: any) {
    return null
  }
}
