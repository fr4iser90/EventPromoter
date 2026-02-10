import { Page } from 'playwright'
import { waitForPageFullyLoaded } from '../utils/waitForPageFullyLoaded.js'

export async function step3_SelectPostType(page: Page, hasFiles: boolean): Promise<void> {
  console.log(`  [Step 3] Selecting post type...`)
  if (hasFiles) {
    console.log(`    → Detected file/URL, selecting "Link" post type...`)
    try {
      await page.click('button:has-text("Link")')
      console.log(`  ✅ [Step 3] Selected "Link" post type`)
      await waitForPageFullyLoaded(page, 'Step 3: After clicking Link button')
    } catch (error: any) {
      console.warn(`  ⚠️ [Step 3] Could not click "Link" button: ${error.message}`)
      const linkButton = await page.$('button:has-text("Link"), button[aria-label*="Link"]').catch(() => null)
      if (linkButton) {
        await linkButton.click()
        console.log(`  ✅ [Step 3] Selected "Link" using alternative selector`)
        await waitForPageFullyLoaded(page, 'Step 3: After clicking Link button (alternative)')
      } else {
        console.warn(`  ⚠️ [Step 3] Link button not found, continuing anyway...`)
      }
    }
  } else {
    console.log(`    → No file/URL detected, selecting "Text" post type...`)
    try {
      await page.click('button:has-text("Post"), button:has-text("Text")')
      console.log(`  ✅ [Step 3] Selected "Text" post type`)
      await waitForPageFullyLoaded(page, 'Step 3: After clicking Post/Text button')
    } catch (error: any) {
      console.warn(`  ⚠️ [Step 3] Could not click "Post"/"Text" button: ${error.message}`)
      const postButton = await page.$('button:has-text("Post"), button:has-text("Text"), button[aria-label*="Post"]').catch(() => null)
      if (postButton) {
        await postButton.click()
        console.log(`  ✅ [Step 3] Selected "Text" using alternative selector`)
        await waitForPageFullyLoaded(page, 'Step 3: After clicking Post/Text button (alternative)')
      } else {
        console.warn(`  ⚠️ [Step 3] Post/Text button not found, continuing anyway...`)
      }
    }
  }
  console.log(`  ✅ [Step 3] Post type selection complete`)
}
