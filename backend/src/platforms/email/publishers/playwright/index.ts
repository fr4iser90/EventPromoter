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
    // Generate publishRunId for correlation (will be used in all events)
    this.publishRunId = `email-playwright-${Date.now()}`
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult> {
    const platformId = 'email'
    const method = 'playwright'
    const sessionId = this.publishRunId || 'unknown'

    try {
      const credentials = await getCredentials()

      if (!credentials.email || !credentials.password) {
        if (this.eventEmitter) {
          this.eventEmitter.error(platformId, method, 'Credentials Check', 'Email credentials not configured for Playwright publishing', this.publishRunId)
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
          this.eventEmitter.error(platformId, method, 'Template Check', 'Email content must use _templates format with targets configuration. Legacy recipients format is no longer supported.', this.publishRunId)
        }
        return {
          success: false,
          error: 'Email content must use _templates format with targets configuration. Legacy recipients format is no longer supported.'
        }
      }
      
      // For Playwright, we'll use the first template's recipients
      // (Playwright typically sends to one recipient at a time)
      const firstTemplate = templates[0]
      if (!firstTemplate.targets) {
        if (this.eventEmitter) {
          this.eventEmitter.error(platformId, method, 'Targets Check', 'Template targets configuration is required', this.publishRunId)
        }
        return {
          success: false,
          error: 'Template targets configuration is required'
        }
      }
      
      // Extract recipients from first template (simplified for Playwright)
      // Note: Playwright publisher may need to be refactored to handle multiple templates
      const recipients: string[] = []
      // This is a simplified extraction - full extraction would require EmailTargetService
      if (firstTemplate.targets.mode === 'individual' && firstTemplate.targets.individual) {
        // We can't resolve target IDs to emails here without EmailTargetService
        // For now, return error suggesting to use API publisher instead
        if (this.eventEmitter) {
          this.eventEmitter.error(platformId, method, 'Recipients Extraction', 'Playwright publisher does not fully support _templates format. Please use API publisher instead.', this.publishRunId)
        }
        return {
          success: false,
          error: 'Playwright publisher does not fully support _templates format. Please use API publisher instead.'
        }
      }

      // ✅ STEP 1: Launch Browser
      if (this.eventEmitter) {
        this.eventEmitter.stepStarted(platformId, method, 'Step 1: Launch Browser', 'Launching browser...', this.publishRunId)
      }
      const step1Start = Date.now()
      this.browser = await step1_LaunchBrowser()
      if (this.eventEmitter) {
        this.eventEmitter.stepCompleted(platformId, method, 'Step 1: Launch Browser', Date.now() - step1Start, this.publishRunId)
      }

      const page = await this.browser.newPage()

      try {
        // ✅ STEP 2: Navigate to Webmail
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 2: Navigate to Webmail', `Navigating to ${credentials.webmailProvider}...`, this.publishRunId)
        }
        const step2Start = Date.now()
        await step2_NavigateToWebmail(page, credentials.webmailProvider)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 2: Navigate to Webmail', Date.now() - step2Start, this.publishRunId)
        }

        // ✅ STEP 3: Login
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 3: Login', 'Logging into webmail...', this.publishRunId)
        }
        const step3Start = Date.now()
        await step3_Login(page, credentials)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 3: Login', Date.now() - step3Start, this.publishRunId)
        }

        // ✅ STEP 4: Compose Email
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 4: Compose Email', 'Opening compose window...', this.publishRunId)
        }
        const step4Start = Date.now()
        await step4_ComposeEmail(page)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 4: Compose Email', Date.now() - step4Start, this.publishRunId)
        }

        // ✅ STEP 5: Enter Recipients
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 5: Enter Recipients', 'Entering recipient addresses...', this.publishRunId)
        }
        const step5Start = Date.now()
        await step5_EnterRecipients(page, recipients)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 5: Enter Recipients', Date.now() - step5Start, this.publishRunId)
        }

        // ✅ STEP 6: Enter Subject
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 6: Enter Subject', 'Entering email subject...', this.publishRunId)
        }
        const step6Start = Date.now()
        await step6_EnterSubject(page, content.subject || 'Event Notification')
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 6: Enter Subject', Date.now() - step6Start, this.publishRunId)
        }

        // ✅ STEP 7: Enter Body
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 7: Enter Body', 'Entering email body...', this.publishRunId)
        }
        const step7Start = Date.now()
        const html = content.html || content.body || ''
        await step7_EnterBody(page, html)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 7: Enter Body', Date.now() - step7Start, this.publishRunId)
        }

        // ✅ STEP 8: Attach Files
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 8: Attach Files', `Attaching ${files.length} file(s)...`, this.publishRunId)
        }
        const step8Start = Date.now()
        await step8_AttachFiles(page, files)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 8: Attach Files', Date.now() - step8Start, this.publishRunId)
        }

        // ✅ STEP 9: Send Email
        if (this.eventEmitter) {
          this.eventEmitter.stepStarted(platformId, method, 'Step 9: Send Email', 'Sending email...', this.publishRunId)
        }
        const step9Start = Date.now()
        await step9_SendEmail(page)
        if (this.eventEmitter) {
          this.eventEmitter.stepCompleted(platformId, method, 'Step 9: Send Email', Date.now() - step9Start, this.publishRunId)
        }

        if (this.eventEmitter) {
          this.eventEmitter.success(platformId, method, 'Successfully sent email via Playwright', { postId: `email-${Date.now()}` }, this.publishRunId)
        }

        return {
          success: true,
          postId: `email-${Date.now()}`,
          url: undefined // Emails don't have URLs
        }
      } finally {
        await page.close()
      }
    } catch (error: any) {
      if (this.eventEmitter) {
        this.eventEmitter.error(platformId, method, 'Email Playwright Publish', error.message || 'Failed to send email via Playwright', this.publishRunId)
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
