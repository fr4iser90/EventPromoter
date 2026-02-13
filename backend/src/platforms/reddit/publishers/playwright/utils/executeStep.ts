import { Page } from 'playwright'
import { waitForPageFullyLoaded } from './waitForPageFullyLoaded.js'
import { PublisherEventService } from '../../../../../services/publisherEventService.js'

/**
 * ✅ STEP ORCHESTRATION: Automatically waits AFTER each step
 * This ensures the page is fully loaded after the step completes.
 */
type StepExecutionOptions = {
  message?: string
  data?: any
}

function getErrorCode(error: any): string {
  if (error?.code) return String(error.code)
  if (error?.status) return `HTTP_${error.status}`
  if (error?.type) return String(error.type)
  if (error?.name === 'TimeoutError') return 'TIMEOUT'
  return 'UNKNOWN_ERROR'
}

function isRetryableError(error: any): boolean {
  const code = error?.code
  const status = error?.status

  if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND') {
    return true
  }

  if (typeof status === 'number' && status >= 500 && status < 600) {
    return true
  }

  if (status === 429) {
    return true
  }

  return false
}

export async function executeStep<T>(
  page: Page,
  stepId: string,
  stepFunction: () => Promise<T>,
  eventEmitter?: PublisherEventService,
  publishRunId?: string,
  options?: StepExecutionOptions
): Promise<T> {
  const startTime = Date.now()
  const stepMessage = options?.message || `Starting ${stepId}`
  console.log(`\n🔄 [Step Orchestration] Starting step: ${stepId}`)
  
  if (eventEmitter) {
    eventEmitter.stepStarted('reddit', 'playwright', stepId, stepMessage, publishRunId)
  }

  try {
    // ✅ EXECUTE STEP
    console.log(`▶️ [Step Orchestration] Executing step: ${stepId}`)
    const result = await stepFunction()
    
    // ✅ AFTER STEP: Wait for page to be fully loaded (this is the critical part)
    await waitForPageFullyLoaded(page, `After step: ${stepId}`)
    
    const duration = Date.now() - startTime
    console.log(`✅ [Step Orchestration] Step completed: ${stepId} (${duration}ms)`)
    
    if (eventEmitter) {
      eventEmitter.stepCompleted('reddit', 'playwright', stepId, duration, publishRunId, options?.data)
    }
    
    return result
  } catch (error: any) {
    const errorCode = getErrorCode(error)
    const retryable = isRetryableError(error)
    const errorMessage = error?.message || 'Unknown error'

    if (eventEmitter) {
      eventEmitter.stepFailed(
        'reddit',
        'playwright',
        stepId,
        errorMessage,
        errorCode,
        retryable,
        publishRunId
      )
    }

    throw error
  }
}
