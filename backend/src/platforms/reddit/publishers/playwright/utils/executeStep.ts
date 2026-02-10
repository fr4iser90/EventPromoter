import { Page } from 'playwright'
import { waitForPageFullyLoaded } from './waitForPageFullyLoaded.js'

/**
 * ✅ STEP ORCHESTRATION: Automatically waits AFTER each step
 * This ensures the page is fully loaded after the step completes.
 * 
 * Why only AFTER?
 * - After actions (goto, click, fill) the page is new/changed → must wait
 * - Before actions, the page is usually already loaded from previous step
 * - Waiting BEFORE is usually redundant and slows things down
 */
export async function executeStep<T>(
  page: Page,
  stepName: string,
  stepFunction: () => Promise<T>
): Promise<T> {
  console.log(`\n🔄 [Step Orchestration] Starting step: ${stepName}`)
  
  // ✅ EXECUTE STEP
  console.log(`▶️ [Step Orchestration] Executing step: ${stepName}`)
  const result = await stepFunction()
  
  // ✅ AFTER STEP: Wait for page to be fully loaded (this is the critical part)
  await waitForPageFullyLoaded(page, `After step: ${stepName}`)
  
  console.log(`✅ [Step Orchestration] Step completed: ${stepName}`)
  return result
}
