/**
 * Email API Publisher
 * 
 * Direct SMTP integration for sending emails.
 * 
 * @module platforms/email/publishers/api
 */

import { PostResult, UploadedFile } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import fs from 'fs'
import path from 'path'

// Remove FileService as we use the files passed in parameters
// import { FileService, FileContentResult } from '../../../services/fileService.js';

export interface EmailPublisher {
  publish(
    content: any,
    files: UploadedFile[],
    hashtags: string[]
  ): Promise<PostResult>
}

interface ResolvedAttachment {
  filename: string;
  buffer: Buffer;
  contentType: string;
}

/**
 * API Publisher for Email
 * 
 * Uses SMTP to send emails directly.
 */
export class EmailApiPublisher implements EmailPublisher {
  private async getCredentials(): Promise<any> {
    const config = await ConfigService.getConfig('email') || {}
    return {
      smtpHost: config.smtpHost || process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
      smtpPort: config.smtpPort || parseInt(process.env.EMAIL_SMTP_PORT || '587'),
      smtpUser: config.smtpUser || process.env.EMAIL_SMTP_USER,
      smtpPassword: config.smtpPassword || process.env.EMAIL_SMTP_PASSWORD,
      fromEmail: config.fromEmail || process.env.EMAIL_FROM,
      fromName: config.fromName || process.env.EMAIL_FROM_NAME || 'EventPromoter',
    }
  }

  async publish(
    content: any,
    files: UploadedFile[],
    hashtags: string[]
  ): Promise<PostResult> {
    try {
      const credentials = await this.getCredentials()

      if (!credentials.smtpUser || !credentials.smtpPassword || !credentials.fromEmail) {
        return {
          success: false,
          error: 'Email SMTP credentials not configured (need smtpUser, smtpPassword, fromEmail)'
        }
      }

      // 1. Resolve global attachments (Must be public)
      const globalFileIds = content.globalFiles || []
      const globalAttachments = this.resolveAttachments(globalFileIds, files, 'global')

      // 2. Handle multiple runs (templates) or single run
      const runs = content._templates || []
      
      if (runs.length === 0) {
        // Fallback to legacy single-run behavior
        const recipients = content.recipients || []
        if (recipients.length === 0) {
          return { success: false, error: 'No email recipients specified' }
        }

        const subject = content.subject || 'Event Notification'
        const html = content.html || content.body || ''
        const text = this.htmlToText(html)
        
        // Use files from legacy 'includedFiles' if available
        const legacyFileIds = (content.includedFiles || []).map((f: any) => typeof f === 'string' ? f : f.id)
        const specificAttachments = this.resolveAttachments(legacyFileIds, files, 'specific')
        const allAttachments = this.mergeAttachments(globalAttachments, specificAttachments)

        return await this.sendWithNodemailer(credentials, recipients, subject, html, text, allAttachments)
      }

      // Handle multiple runs
      const results: PostResult[] = []
      for (const run of runs) {
        const recipients = this.extractRecipients(run.targets)
        if (recipients.length === 0) continue

        const subject = content.subject || 'Event Notification'
        // In a real system, we would re-render the template for this run
        // For now, we assume 'html' is already set or use generic run content
        const html = run.html || content.html || content.body || ''
        const text = this.htmlToText(html)

        const specificFileIds = run.specificFiles || []
        const specificAttachments = this.resolveAttachments(specificFileIds, files, 'specific')
        const allAttachments = this.mergeAttachments(globalAttachments, specificAttachments)

        const result = await this.sendWithNodemailer(credentials, recipients, subject, html, text, allAttachments)
        results.push(result)
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

  /**
   * Resolves file IDs to actual file content and validates visibility
   */
  private resolveAttachments(fileIds: string[], availableFiles: UploadedFile[], scope: 'global' | 'specific'): ResolvedAttachment[] {
    const resolved: ResolvedAttachment[] = []

    for (const id of fileIds) {
      const file = availableFiles.find(f => f.id === id || f.filename === id)
      if (!file) {
        console.warn(`File not found for ID: ${id}`)
        continue
      }

      // Security Validation: Global files MUST be public
      if (scope === 'global' && file.visibility !== 'public') {
        throw new Error(`Security Violation: Global attachment "${file.name}" is not marked as public!`)
      }

      try {
        // Resolve path - handle both absolute and relative paths
        const absolutePath = path.isAbsolute(file.path) 
          ? file.path 
          : path.join(process.cwd(), file.path)

        if (fs.existsSync(absolutePath)) {
          resolved.push({
            filename: file.name,
            buffer: fs.readFileSync(absolutePath),
            contentType: file.type
          })
        } else {
          console.warn(`File path not found: ${absolutePath}`)
        }
      } catch (err) {
        console.error(`Failed to read file ${file.name}:`, err)
      }
    }

    return resolved
  }

  /**
   * Merges global and specific attachments, deduplicating by filename
   */
  private mergeAttachments(global: ResolvedAttachment[], specific: ResolvedAttachment[]): ResolvedAttachment[] {
    const map = new Map<string, ResolvedAttachment>()
    
    global.forEach(a => map.set(a.filename, a))
    specific.forEach(a => map.set(a.filename, a)) // Specific overrides global if filename is same

    return Array.from(map.values())
  }

  /**
   * Extracts email addresses from targets object
   */
  private extractRecipients(targets: any): string[] {
    if (!targets) return []
    if (targets.mode === 'all') {
      // In a real system, load all emails from the target service
      return targets.targetNames || []
    }
    if (targets.individual && Array.isArray(targets.individual)) {
      return targets.individual
    }
    return []
  }

  private async sendWithNodemailer(
    credentials: any,
    recipients: string[],
    subject: string,
    html: string,
    text: string,
    attachments: ResolvedAttachment[]
  ): Promise<PostResult> {
    // Dynamic import to avoid requiring nodemailer if not installed
    // @ts-ignore - nodemailer is optional dependency
    const nodemailer = await import('nodemailer')

    const transporter = nodemailer.createTransport({
      host: credentials.smtpHost,
      port: credentials.smtpPort,
      secure: credentials.smtpPort === 465,
      auth: {
        user: credentials.smtpUser,
        pass: credentials.smtpPassword
      }
    })

    const nodemailerAttachments = attachments.map(file => ({
      filename: file.filename,
      content: file.buffer,
      contentType: file.contentType
    }));

    const result = await transporter.sendMail({
      from: `"${credentials.fromName}" <${credentials.fromEmail}>`,
      to: recipients.join(', '),
      subject: subject,
      text: text,
      html: html,
      attachments: nodemailerAttachments.length > 0 ? nodemailerAttachments : undefined
    })

    return {
      success: true,
      postId: result.messageId
    }
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }
}

export default new EmailApiPublisher()
