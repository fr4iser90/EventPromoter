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
import { validateCredentials } from './steps/validateCredentials.js'
import { resolveGlobalAttachments } from './steps/resolveGlobalAttachments.js'
import { extractRecipientsForRun } from './steps/extractRecipients.js'
import { renderTemplate } from './steps/renderTemplate.js'
import { processAttachments } from './steps/processAttachments.js'
import { sendEmail } from './steps/sendEmail.js'

const EMAIL_API_STEP_IDS = {
  COMMON_VALIDATE_INPUT: 'common.validate_input',
  COMMON_RESOLVE_TARGETS: 'common.resolve_targets',
  AUTH_VALIDATE_CREDENTIALS: 'auth.validate_credentials',
  MEDIA_RESOLVE_ATTACHMENTS: 'media.resolve_attachments',
  COMPOSE_EXTRACT_RECIPIENTS: 'compose.extract_recipients',
  COMPOSE_RENDER_TEMPLATE: 'compose.render_template',
  MEDIA_PROCESS_ATTACHMENTS: 'media.process_attachments',
  PUBLISH_SUBMIT: 'publish.submit',
  PUBLISH_VERIFY_RESULT: 'publish.verify_result'
} as const

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
  }

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
    this.eventEmitter?.stepStarted('email', 'api', stepId, message || `Starting ${stepId}`, publishRunId)

    try {
      const result = await fn()
      this.eventEmitter?.stepCompleted('email', 'api', stepId, Date.now() - start, publishRunId, data)
      return result
    } catch (error: any) {
      this.eventEmitter?.stepFailed(
        'email',
        'api',
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
    files: UploadedFile[],
    hashtags: string[]
  ): Promise<PostResult> {
    const currentPublishRunId = this.publishRunId || `email-${Date.now()}`

    try {
      const credentials = await this.executeContractStep(
        EMAIL_API_STEP_IDS.AUTH_VALIDATE_CREDENTIALS,
        currentPublishRunId,
        async () => {
          const loaded = await getCredentials()
          validateCredentials(loaded)
          return loaded
        },
        'Loading and validating SMTP credentials'
      )

      const runs = await this.executeContractStep(
        EMAIL_API_STEP_IDS.COMMON_VALIDATE_INPUT,
        currentPublishRunId,
        async () => {
          const templateRuns = content._templates || []
          if (templateRuns.length === 0) {
            throw this.createError(
              'Email content must use _templates format with targets configuration. Legacy recipients format is no longer supported.',
              'INVALID_INPUT'
            )
          }
          return templateRuns
        },
        'Validating email payload'
      )

      const globalAttachments = await this.executeContractStep(
        EMAIL_API_STEP_IDS.MEDIA_RESOLVE_ATTACHMENTS,
        currentPublishRunId,
        () => resolveGlobalAttachments(content, files),
        'Resolving global attachments'
      )

      // Handle multiple runs
      const results: PostResult[] = []
      for (const run of runs) {
        console.log('Processing template run', { templateId: run.templateId })
        
        try {
          await this.executeContractStep(
            EMAIL_API_STEP_IDS.COMMON_RESOLVE_TARGETS,
            currentPublishRunId,
            async () => {
              if (!run.targets) {
                throw this.createError(`Template run ${run.templateId} is missing targets`, 'INVALID_TARGETS')
              }
            },
            `Resolving targets for template ${run.templateId}`
          )

          const recipients = await this.executeContractStep(
            EMAIL_API_STEP_IDS.COMPOSE_EXTRACT_RECIPIENTS,
            currentPublishRunId,
            async () => extractRecipientsForRun(run),
            `Extracting recipients for template ${run.templateId}`
          )
          console.log('Found recipients for template run', { templateId: run.templateId, count: recipients.length })

          // Loop through recipients to send personalized emails
          for (const recipient of recipients) {
            const recipientEmail = recipient.email
            console.log('Processing recipient', { templateId: run.templateId, recipientEmail })

            const { html, subject } = await this.executeContractStep(
              EMAIL_API_STEP_IDS.COMPOSE_RENDER_TEMPLATE,
              currentPublishRunId,
              async () => renderTemplate(run, content, recipient),
              `Rendering personalized template for ${recipientEmail}`
            )

            const { processedHtml, processedAttachments } = await this.executeContractStep(
              EMAIL_API_STEP_IDS.MEDIA_PROCESS_ATTACHMENTS,
              currentPublishRunId,
              () => processAttachments(run, files, globalAttachments, html),
              `Processing attachments for ${recipientEmail}`
            )

            const sendResult = await this.executeContractStep(
              EMAIL_API_STEP_IDS.PUBLISH_SUBMIT,
              currentPublishRunId,
              async () => sendEmail(credentials, [recipientEmail], subject, processedHtml, processedAttachments, content),
              `Sending email to ${recipientEmail}`
            )

            await this.executeContractStep(
              EMAIL_API_STEP_IDS.PUBLISH_VERIFY_RESULT,
              currentPublishRunId,
              async () => {
                if (!sendResult.success || !sendResult.postId) {
                  throw this.createError(`SMTP send did not return a valid messageId for ${recipientEmail}`, 'VERIFY_FAILED')
                }
              },
              `Verifying send result for ${recipientEmail}`
            )

            results.push(sendResult)
          }
        } catch (error: any) {
          console.error('Error processing template run', { templateId: run.templateId, error })
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
      return {
        success: false,
        error: error.message || 'Failed to send email via SMTP'
      }
    }
  }
}

export default new EmailApiPublisher()
