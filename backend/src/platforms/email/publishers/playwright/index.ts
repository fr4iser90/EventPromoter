/**
 * Email Playwright Publisher
 * 
 * Browser automation for sending emails using webmail interfaces.
 * Note: This is less practical than SMTP, but provided for completeness.
 * 
 * @module platforms/email/publishers/playwright
 */

// @ts-ignore - Playwright is optional dependency
import { Browser, Page } from 'playwright'
import { PostResult, UploadedFile } from '../../../../types/index.js'
import { PublisherEventService, EventAwarePublisher } from '../../../../services/publisherEventService.js'

export interface EmailPublisher {
  publish(
    content: any,
    files: UploadedFile[],
    hashtags: string[]
  ): Promise<PostResult>
}

// Utils
import { getCredentials } from './utils/getCredentials.js'

// Steps
import { launchBrowser } from './steps/launchBrowser.js'
import { navigateToWebmail } from './steps/navigateToWebmail.js'
import { loginWebmail } from './steps/loginWebmail.js'
import { openComposer } from './steps/openComposer.js'
import { enterRecipients } from './steps/enterRecipients.js'
import { enterSubject } from './steps/enterSubject.js'
import { enterBody } from './steps/enterBody.js'
import { attachFiles } from './steps/attachFiles.js'
import { sendEmail } from './steps/sendEmail.js'

const EMAIL_PLAYWRIGHT_STEP_IDS = {
  COMMON_VALIDATE_INPUT: 'common.validate_input',
  COMMON_RESOLVE_TARGETS: 'common.resolve_targets',
  AUTH_VALIDATE_CREDENTIALS: 'auth.validate_credentials',
  AUTH_LOGIN_CHECK: 'auth.login_check',
  COMPOSE_EXTRACT_RECIPIENTS: 'compose.extract_recipients',
  COMPOSE_OPEN_EDITOR: 'compose.open_editor',
  COMPOSE_FILL_CONTENT: 'compose.fill_content',
  MEDIA_UPLOAD: 'media.upload',
  PUBLISH_SUBMIT: 'publish.submit',
  PUBLISH_VERIFY_RESULT: 'publish.verify_result'
} as const

/**
 * Playwright Publisher for Email
 * 
 * Uses browser automation to send emails via webmail (Gmail, Outlook, etc.)
 * Note: This is not recommended for production - use SMTP API instead.
 */
export class EmailPlaywrightPublisher implements EmailPublisher, EventAwarePublisher {
  private browser: Browser | null = null
  private eventEmitter?: PublisherEventService
  private publishRunId?: string

  setEventEmitter(emitter: PublisherEventService): void {
    this.eventEmitter = emitter
  }

  // ✅ FIX: Neue Methode zum Setzen der publishRunId (wie bei Reddit)
  setPublishRunId(runId: string): void {
    this.publishRunId = runId
  }

  private getErrorCode(error: any): string {
    if (error?.code) return String(error.code)
    if (error?.status) return `HTTP_${error.status}`
    if (error?.type) return String(error.type)
    return 'UNKNOWN_ERROR'
  }

  private isRetryableError(error: any): boolean {
    const code = error?.code
    const status = error?.status
    if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND') return true
    if (typeof status === 'number' && status >= 500 && status < 600) return true
    if (status === 429) return true
    return false
  }

  private createError(message: string, code: string): Error {
    const err = new Error(message) as Error & { code?: string }
    err.code = code
    return err
  }

  private async executeContractStep<T>(
    stepId: string,
    publishRunId: string,
    fn: () => Promise<T> | T,
    message?: string,
    data?: any
  ): Promise<T> {
    const start = Date.now()
    this.eventEmitter?.stepStarted('email', 'playwright', stepId, message || `Starting ${stepId}`, publishRunId)
    try {
      const result = await fn()
      this.eventEmitter?.stepCompleted('email', 'playwright', stepId, Date.now() - start, publishRunId, data)
      return result
    } catch (error: any) {
      this.eventEmitter?.stepFailed(
        'email',
        'playwright',
        stepId,
        error?.message || 'Unknown error',
        this.getErrorCode(error),
        this.isRetryableError(error),
        publishRunId
      )
      throw error
    }
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult> {
    const currentPublishRunId = this.publishRunId || `email-${Date.now()}`

    try {
      const credentials = await this.executeContractStep(
        EMAIL_PLAYWRIGHT_STEP_IDS.AUTH_VALIDATE_CREDENTIALS,
        currentPublishRunId,
        async () => {
          const loaded = await getCredentials()
          if (!loaded.email || !loaded.password) {
            throw this.createError('Email credentials not configured for Playwright publishing', 'MISSING_CREDENTIALS')
          }
          return loaded
        },
        'Loading and validating webmail credentials'
      )

      const templates = await this.executeContractStep(
        EMAIL_PLAYWRIGHT_STEP_IDS.COMMON_VALIDATE_INPUT,
        currentPublishRunId,
        async () => {
          const templateRuns = content._templates || []
          if (templateRuns.length === 0) {
            throw this.createError('Email content must use _templates format', 'INVALID_CONTENT')
          }
          return templateRuns
        },
        'Validating email payload'
      )

      const firstTemplate = templates[0]
      await this.executeContractStep(
        EMAIL_PLAYWRIGHT_STEP_IDS.COMMON_RESOLVE_TARGETS,
        currentPublishRunId,
        async () => {
          if (!firstTemplate.targets) {
            throw this.createError('Template targets configuration is required', 'INVALID_TARGETS')
          }
        },
        'Resolving targets for first template run'
      )

      const { extractRecipients } = await import('../api/utils/extractRecipients.js')
      const recipients = await this.executeContractStep(
        EMAIL_PLAYWRIGHT_STEP_IDS.COMPOSE_EXTRACT_RECIPIENTS,
        currentPublishRunId,
        async () => {
          const resolved = await extractRecipients(firstTemplate.targets) as string[]
          if (resolved.length === 0) {
            throw this.createError('No recipients found for the selected targets.', 'NO_RECIPIENTS')
          }
          return resolved
        },
        'Extracting recipients from targets'
      )

      this.browser = await launchBrowser()

      const page = await this.browser.newPage()

      try {
        const html = content.html || content.body || ''
        const subject = content.subject || 'Event Notification'

        await this.executeContractStep(
          EMAIL_PLAYWRIGHT_STEP_IDS.AUTH_LOGIN_CHECK,
          currentPublishRunId,
          async () => {
            await navigateToWebmail(page, credentials.webmailProvider)
            await loginWebmail(page, credentials)
          },
          `Navigating and logging into ${credentials.webmailProvider}`
        )

        await this.executeContractStep(
          EMAIL_PLAYWRIGHT_STEP_IDS.COMPOSE_OPEN_EDITOR,
          currentPublishRunId,
          async () => {
            await openComposer(page)
          },
          'Opening composer'
        )

        await this.executeContractStep(
          EMAIL_PLAYWRIGHT_STEP_IDS.COMPOSE_FILL_CONTENT,
          currentPublishRunId,
          async () => {
            await enterRecipients(page, recipients)
            await enterSubject(page, subject)
            await enterBody(page, html)
          },
          `Filling composer fields for ${recipients.length} recipient(s)`
        )

        await this.executeContractStep(
          EMAIL_PLAYWRIGHT_STEP_IDS.MEDIA_UPLOAD,
          currentPublishRunId,
          async () => {
            await attachFiles(page, files)
          },
          `Uploading ${files.length} attachment(s)`
        )

        await this.executeContractStep(
          EMAIL_PLAYWRIGHT_STEP_IDS.PUBLISH_SUBMIT,
          currentPublishRunId,
          async () => {
            await sendEmail(page)
          },
          'Submitting email via webmail'
        )

        const postId = `email-${Date.now()}`
        await this.executeContractStep(
          EMAIL_PLAYWRIGHT_STEP_IDS.PUBLISH_VERIFY_RESULT,
          currentPublishRunId,
          async () => {
            if (!postId) {
              throw this.createError('Missing email message reference after submit', 'VERIFY_FAILED')
            }
          },
          'Verifying webmail send result',
          { postId, recipients }
        )

        return {
          success: true,
          postId,
          url: undefined
        }
      } finally {
        await page.close()
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send email via Playwright'
      }
    } finally {
      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }
    }
  }
}

export default new EmailPlaywrightPublisher()
