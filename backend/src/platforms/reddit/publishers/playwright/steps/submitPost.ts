import { Page } from 'playwright'
import { waitForPageFullyLoaded } from '../utils/waitForPageFullyLoaded.js'
import { extractPostUrl } from '../utils/extractPostUrl.js'
import { extractPostId } from '../utils/extractPostId.js'

export async function submitPost(page: Page, subreddit: string, dryMode: boolean): Promise<{ url?: string, postId?: string }> {
  console.log('[Step 6] Finalizing')
  if (dryMode) {
    console.log('[Step 6] Dry mode: form filled, no automatic post', { subreddit })
    return { url: page.url() }
  } else {
    console.log('[Step 6] Submitting post')
    const submitSelectors = [
      'button:has-text("Post")',
      'button:has-text("Submit")',
      'button[type="submit"]',
      'button[data-testid*="submit"]'
    ]
    
    let submitted = false
    for (const selector of submitSelectors) {
      try {
        const submitButton = await page.$(selector)
        if (submitButton && await submitButton.isVisible().catch(() => false)) {
          await submitButton.click()
          await waitForPageFullyLoaded(page, 'Step 6: After clicking submit button')
          submitted = true
          console.log('[Step 6] Post submitted using selector', { selector })
          break
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!submitted) {
      throw new Error('Submit button not found - tried multiple selectors')
    }
    
    const postUrl = await extractPostUrl(page, subreddit)
    const postId = postUrl ? extractPostId(postUrl) : undefined
    
    console.log('[Step 6] Post submitted successfully', { url: postUrl || 'N/A', postId: postId || 'N/A' })
    
    return { url: postUrl, postId }
  }
}
