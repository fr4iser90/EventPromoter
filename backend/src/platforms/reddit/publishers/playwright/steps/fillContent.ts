import { Page } from 'playwright'

export async function fillContent(page: Page, files: any[], text: string): Promise<void> {
  console.log(`  [Step 5] Entering content...`)
  if (files.length > 0 && files[0].url) {
    console.log(`    → Entering URL: ${files[0].url}`)
    const urlSelectors = [
      'input[placeholder*="url"]',
      'input[placeholder*="URL"]',
      'input[type="url"]',
      'input[name*="url"]',
      'input[id*="url"]'
    ]
    
    let urlFilled = false
    for (const selector of urlSelectors) {
      try {
        const urlField = await page.$(selector)
        if (urlField) {
          await urlField.fill(files[0].url)
          urlFilled = true
          console.log(`  ✅ [Step 5] URL filled using selector: ${selector}`)
          break
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!urlFilled) {
      throw new Error('URL field not found - tried multiple selectors')
    }
  } else {
    console.log(`    → Entering text content (${text.length} characters)`)
    const textSelectors = [
      'div[contenteditable="true"]',
      'textarea[placeholder*="text"]',
      'textarea[placeholder*="Text"]',
      'textarea[name*="text"]',
      'div[role="textbox"]',
      'div[data-testid*="text"]'
    ]
    
    let textFilled = false
    for (const selector of textSelectors) {
      try {
        const textField = await page.$(selector)
        if (textField) {
          await textField.fill(text)
          textFilled = true
          console.log(`  ✅ [Step 5] Text filled using selector: ${selector}`)
          break
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!textFilled) {
      throw new Error('Text field not found - tried multiple selectors')
    }
  }
}
