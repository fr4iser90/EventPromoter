import { Page } from 'playwright'
import { waitForPageFullyLoaded } from '../utils/waitForPageFullyLoaded.js'

export async function openSubmitEditor(page: Page, subreddit: string): Promise<void> {
  console.log('[Step 2] Navigating to subreddit submit page', { subreddit })
  await page.goto(`https://www.reddit.com/r/${subreddit}/submit`, { 
    waitUntil: 'domcontentloaded',
    timeout: 60000
  })
  console.log('[Step 2] Navigation complete', { url: page.url() })
  
  await waitForPageFullyLoaded(page, `Step 2: After navigation to r/${subreddit}/submit`)
  
  await page.waitForSelector('textarea, input[type="text"], button:has-text("Post"), button:has-text("Link")', { 
    timeout: 30000 
  }).catch(() => {
    console.warn('[Step 2] Could not find submit form elements, continuing anyway')
  })
  console.log('[Step 2] Submit page fully loaded')
}
