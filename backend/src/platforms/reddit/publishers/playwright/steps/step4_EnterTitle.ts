import { Page } from 'playwright'

export async function step4_EnterTitle(page: Page, title: string): Promise<void> {
  console.log(`  [Step 4] Entering title: "${title.substring(0, 50)}${title.length > 50 ? '...' : ''}"`)
  const titleSelectors = [
    'textarea[placeholder*="title"]',
    'textarea[placeholder*="Title"]',
    'textarea[placeholder*="Titel"]',
    'textarea[name*="title"]',
    'textarea[id*="title"]',
    'textarea[data-testid*="title"]'
  ]
  
  let titleFilled = false
  for (const selector of titleSelectors) {
    try {
      const titleField = await page.$(selector)
      if (titleField) {
        await titleField.fill(title)
        titleFilled = true
        console.log(`  ✅ [Step 4] Title filled using selector: ${selector}`)
        break
      }
    } catch (e) {
      // Try next selector
    }
  }
  
  if (!titleFilled) {
    const anyTextarea = await page.$('textarea').catch(() => null)
    if (anyTextarea) {
      await anyTextarea.fill(title)
      console.log(`  ✅ [Step 4] Title filled using generic textarea selector`)
      titleFilled = true
    }
  }
  
  if (!titleFilled) {
    throw new Error('Title field not found - tried multiple selectors')
  }
}
