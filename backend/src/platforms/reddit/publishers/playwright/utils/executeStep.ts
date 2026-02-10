import { Page } from 'playwright'
import { waitForPageFullyLoaded } from './waitForPageFullyLoaded.js'
import { PublisherEventService } from '../../../../../../services/publisherEventService.js'

/**
 * ✅ STEP ORCHESTRATION: Automatically waits AFTER each step
 * This ensures the page is fully loaded after the step completes.
 */
export async function executeStep<T>(
  page: Page,
  stepName: string,
  stepFunction: () => Promise<T>,
  eventEmitter?: PublisherEventService,
  publishRunId?: string
): Promise<T> {
  const startTime = Date.now()
  console.log(`\n🔄 [Step Orchestration] Starting step: ${stepName}`)
  
  if (eventEmitter) {
    eventEmitter.stepStarted('reddit', 'playwright', stepName, `Starting ${stepName}`, publishRunId)
  }
  
  // ✅ EXECUTE STEP
  console.log(`▶️ [Step Orchestration] Executing step: ${stepName}`)
  const result = await stepFunction()
  
  // ✅ AFTER STEP: Wait for page to be fully loaded (this is the critical part)
  await waitForPageFullyLoaded(page, `After step: ${stepName}`)
  
  const duration = Date.now() - startTime
  console.log(`✅ [Step Orchestration] Step completed: ${stepName} (${duration}ms)`)
  
  if (eventEmitter) {
    eventEmitter.stepCompleted('reddit', 'playwright', stepName, duration, publishRunId)
  }
  
  return result
}
