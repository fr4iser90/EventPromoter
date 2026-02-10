/**
 * Email API Publisher
 * 
 * Direct SMTP integration for sending emails.
 * 
 * @module platforms/email/publishers/api
 */

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
import { step1_ValidateCredentials } from './steps/step1_ValidateCredentials.js'
import { step2_ResolveGlobalAttachments } from './steps/step2_ResolveGlobalAttachments.js'
import { step3_ExtractRecipients } from './steps/step3_ExtractRecipients.js'
import { step4_RenderTemplate } from './steps/step4_RenderTemplate.js'
import { step5_ProcessAttachments } from './steps/step5_ProcessAttachments.js'
import { step6_SendEmail } from './steps/step6_SendEmail.js'

/**
 * API Publisher for Email
 * 
 * Uses SMTP to send emails directly.
 */
export class EmailApiPublisher implements EmailPublisher, EventAwarePublisher {
  private eventEmitter?: PublisherEventService
  private publishRunId?: string

  setEventEmitter(emitter: PublisherEventService): void {
    this.eventEmitter = emitter
    // Generate publishRunId for correlation (will be used in all events)
    this.publishRunId = `email-${Date.now()}`
  }

  async publish(
    content: any,
    files: UploadedFile[],
    hashtags: string[]
  ): Promise<PostResult> {
    const platformId = 'email'
    const method = 'api'
    const sessionId = this.publishRunId || 'unknown'

    try {
      // ✅ STEP 1: Get Credentials
      if (this.eventEmitter) {
        this.eventEmitter.stepStarted(platformId, method, 'Step 1: Get Credentials', 'Loading SMTP credentials...', this.publishRunId)
      }
      const step1Start = Date.now()
      const credentials = await getCredentials()
      if (this.eventEmitter) {
        this.eventEmitter.stepCompleted(platformId, method, 'Step 1: Get Credentials', Date.now() - step1Start, this.publishRunId)
      }

      // ✅ STEP 2: Validate Credentials
      if (this.eventEmitter) {
        this.eventEmitter.stepStarted(platformId, method, 'Step 2: Validate Credentials', 'Validating SMTP credentials...', this.publishRunId)
      }
      const step2Start = Date.now()
      step1_ValidateCredentials(credentials)
      if (this.eventEmitter) {
        this.eventEmitter.stepCompleted(platformId, method, 'Step 2: Validate Credentials', Date.now() - step2Start, this.publishRunId)
      }

      // ✅ STEP 3: Resolve Global Attachments
      if (this.eventEmitter) {
        this.eventEmitter.stepStarted(platformId, method, 'Step 3: Resolve Global Attachments', 'Resolving global attachments...', this.publishRunId)
      }
      const step3Start = Date.now()
      const globalAttachments = step2_ResolveGlobalAttachments(content, files)
      if (this.eventEmitter) {
        this.eventEmitter.stepCompleted(platformId, method, 'Step 3: Resolve Global Attachments', Date.now() - step3Start, this.publishRunId)
      }

      // ✅ STEP 4: Handle multiple runs (templates) - _templates format is required
      const runs = content._templates || []
      
      if (runs.length === 0) {
        return { 
          success: false, 
          error: 'Email content must use _templates format with targets configuration. Legacy recipients format is no longer supported.' 
        }
      }

      // Handle multiple runs
      const results: PostResult[] = []
      for (const run of runs) {
        console.log(`📧 Processing template run: ${run.templateId}`)
        
        try {
          // ✅ STEP 5: Extract Recipients
          if (this.eventEmitter) {
            this.eventEmitter.stepStarted(platformId, method, `Step 5: Extract Recipients (${run.templateId})`, 'Extracting recipients from targets...', this.publishRunId)
          }
          const step5Start = Date.now()
          const recipients = await step3_ExtractRecipients(run)
          console.log(`📧 Found ${recipients.length} recipient(s)`)
          if (this.eventEmitter) {
            this.eventEmitter.stepCompleted(platformId, method, `Step 5: Extract Recipients (${run.templateId})`, Date.now() - step5Start, this.publishRunId)
          }

          // ✅ STEP 6: Render Template
          if (this.eventEmitter) {
            this.eventEmitter.stepStarted(platformId, method, `Step 6: Render Template (${run.templateId})`, 'Rendering template with variables...', this.publishRunId)
          }
          const step6Start = Date.now()
          const { html, subject } = await step4_RenderTemplate(run, content)
          if (this.eventEmitter) {
            this.eventEmitter.stepCompleted(platformId, method, `Step 6: Render Template (${run.templateId})`, Date.now() - step6Start, this.publishRunId)
          }

          // ✅ STEP 7: Process Attachments
          if (this.eventEmitter) {
            this.eventEmitter.stepStarted(platformId, method, `Step 7: Process Attachments (${run.templateId})`, 'Processing attachments and embedded images...', this.publishRunId)
          }
          const step7Start = Date.now()
          const { processedHtml, processedAttachments } = step5_ProcessAttachments(run, files, globalAttachments, html)
          console.log(`📧 Processing embedded images...`)
          if (this.eventEmitter) {
            this.eventEmitter.stepCompleted(platformId, method, `Step 7: Process Attachments (${run.templateId})`, Date.now() - step7Start, this.publishRunId)
          }

          // ✅ STEP 8: Send Email
          if (this.eventEmitter) {
            this.eventEmitter.stepStarted(platformId, method, `Step 8: Send Email (${run.templateId})`, `Sending email to ${recipients.length} recipient(s)...`, this.publishRunId)
          }
          const step8Start = Date.now()
          const result = await step6_SendEmail(credentials, recipients, subject, processedHtml, processedAttachments, content)
          if (this.eventEmitter) {
            this.eventEmitter.stepCompleted(platformId, method, `Step 8: Send Email (${run.templateId})`, Date.now() - step8Start, this.publishRunId)
          }
          
          results.push(result)
        } catch (error: any) {
          console.error(`Error processing template run ${run.templateId}:`, error)
          results.push({
            success: false,
            error: error.message || 'Failed to process template run'
          })
        }
      }

      const allSuccess = results.every(r => r.success)
      return {
        success: allSuccess,
        postId: results.map(r => r.postId).filter(Boolean).join(', '),
        error: allSuccess ? undefined : results.find(r => !r.success)?.error
      }

    } catch (error: any) {
      if (this.eventEmitter) {
        this.eventEmitter.error(platformId, method, 'Email API Publish', error.message || 'Failed to send email via SMTP', this.publishRunId)
      }
      return {
        success: false,
        error: error.message || 'Failed to send email via SMTP'
      }
    }
  }
}

export default new EmailApiPublisher()
