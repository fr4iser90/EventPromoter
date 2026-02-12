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
import { htmlToText } from './utils/htmlToText.js'

// Steps
import { step1_LaunchBrowser } from './steps/step1_LaunchBrowser.js'
import { step2_NavigateToWebmail } from './steps/step2_NavigateToWebmail.js'
import { step3_Login } from './steps/step3_Login.js'
import { step4_ComposeEmail } from './steps/step4_ComposeEmail.js'
import { step5_EnterRecipients } from './steps/step5_EnterRecipients.js'
import { step6_EnterSubject } from './steps/step6_EnterSubject.js'
import { step7_EnterBody } from './steps/step7_EnterBody.js'
import { step8_AttachFiles } from './steps/step8_AttachFiles.js'
import { step9_SendEmail } from './steps/step9_SendEmail.js'

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

  async publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult> {
    const platformId = 'email'
    const method = 'playwright'
    const currentPublishRunId = this.publishRunId || `email-${Date.now()}`

    try {
      const credentials = await getCredentials()

      if (!credentials.email || !credentials.password) {
        if (this.eventEmitter) {
          this.eventEmitter.stepFailed(platformId, method, 'Credentials Check', 'Email credentials not configured for Playwright publishing', 'MISSING_CREDENTIALS', false, currentPublishRunId)
        }
        return {
          success: false,
          error: 'Email credentials not configured for Playwright publishing'
        }
      }

      // Check for _templates format
      const templates = content._templates || []
      if (templates.length === 0) {
        if (this.eventEmitter) {
          this.eventEmitter.stepFailed(platformId, method, 'Template Check', 'Email content must use _templates format', 'INVALID_CONTENT', false, currentPublishRunId)
        }
        return {
          success: false,
          error: 'Email content must use _templates format'
        }
      }
      
      // For Playwright, we'll use the first template's recipients
      const firstTemplate = templates[0]
      if (!firstTemplate.targets) {
        if (this.eventEmitter) {
          this.eventEmitter.stepFailed(platformId, method, 'Targets Check', 'Template targets configuration is required', 'INVALID_TARGETS', false, currentPublishRunId)
        }
        return {
          success: false,
          error: 'Template targets configuration is required'
        }
      }
      
      // ✅ RESOLVE RECIPIENTS: Use extractRecipients utility (same as API publisher)
      const { extractRecipients } = await import('../api/utils/extractRecipients.js')
      const recipients = await extractRecipients(firstTemplate.targets) as string[]

      if (recipients.length === 0) {
        if (this.eventEmitter) {
          this.eventEmitter.stepFailed(platformId, method, 'Recipients Extraction', 'No recipients found for the selected targets.', 'NO_RECIPIENTS', false, currentPublishRunId)
        }
        return {
          success: false,
          error: 'No recipients found for the selected targets.'
        }
      }

      // ✅ STEP 1: Launch Browser
      if (this.eventEmitter) {
        this.eventEmitter.stepStarted(platformId, method, 'Step 1: Launch Browser', 'Launching browser...', currentPublishRunId)
      }
      const step1Start = Date.now()
      this.browser = await step1_LaunchBrowser()
      if (this.eventEmitter) {
        this.eventEmitter.stepCompleted(platformId, method, 'Step 1: Launch Browser', Date.now() - step1Start, currentPublishRunId)
      }

      const page = await this.browser.newPage()

      try {
        // ✅ STEP 2: Navigate to Webmail
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 2: Navigate to Webmail', `Navigating to ${credentials.webmailProvider}...`, currentPublishRunId)
        }
        const step2Start = Date.now()
        await step2_NavigateToWebmail(page, credentials.webmailProvider)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 2: Navigate to Webmail', Date.now() - step2Start, currentPublishRunId)
        }

        // ✅ STEP 3: Login
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 3: Login', 'Logging into webmail...', currentPublishRunId)
        }
        const step3Start = Date.now()
        await step3_Login(page, credentials)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 3: Login', Date.now() - step3Start, currentPublishRunId)
        }

        // ✅ STEP 4: Compose Email
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 4: Compose Email', 'Opening compose window...', currentPublishRunId)
        }
        const step4Start = Date.now()
        await step4_ComposeEmail(page)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 4: Compose Email', Date.now() - step4Start, currentPublishRunId)
        }

        // ✅ STEP 5: Enter Recipients
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 5: Enter Recipients', 'Entering recipient addresses...', currentPublishRunId)
        }
        const step5Start = Date.now()
        await step5_EnterRecipients(page, recipients)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 5: Enter Recipients', Date.now() - step5Start, currentPublishRunId)
        }

        // ✅ STEP 6: Enter Subject
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 6: Enter Subject', 'Entering email subject...', currentPublishRunId)
        }
        const step6Start = Date.now()
        await step6_EnterSubject(page, content.subject || 'Event Notification')
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 6: Enter Subject', Date.now() - step6Start, currentPublishRunId)
        }

        // ✅ STEP 7: Enter Body
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 7: Enter Body', 'Entering email body...', currentPublishRunId)
        }
        const step7Start = Date.now()
        const html = content.html || content.body || ''
        await step7_EnterBody(page, html)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 7: Enter Body', Date.now() - step7Start, currentPublishRunId)
        }

        // ✅ STEP 8: Attach Files
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 8: Attach Files', `Attaching ${files.length} file(s)...`, currentPublishRunId)
        }
        const step8Start = Date.now()
        await step8_AttachFiles(page, files)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 8: Attach Files', Date.now() - step8Start, currentPublishRunId)
        }

        // ✅ STEP 9: Send Email
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 9: Send Email', 'Sending email...', currentPublishRunId)
        }
        const step9Start = Date.now()
        await step9_SendEmail(page)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 9: Send Email', Date.now() - step9Start, currentPublishRunId)
        }

        if (this.eventEmitter) {
          this.eventEmitter.success(platformId, method, 'Successfully sent email via Playwright', { postId: `email-${Date.now()}` }, currentPublishRunId)
        }

        return {
          success: true,
          postId: `email-${Date.now()}`,
          url: undefined
        }
      } finally {
        await page.close()
      }
    } catch (error: any) {
      if (this.eventEmitter) {
        this.eventEmitter.stepFailed(platformId, method, 'Email Playwright Publish', error.message || 'Failed to send email via Playwright', 'PUBLISH_ERROR', false, currentPublishRunId)
      }
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
