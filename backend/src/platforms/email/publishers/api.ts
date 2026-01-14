/**
 * Email API Publisher
 * 
 * Direct SMTP integration for sending emails.
 * 
 * @module platforms/email/publishers/api
 */

import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export interface EmailPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
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
    files: any[],
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

      const recipients = content.recipients || []
      if (recipients.length === 0) {
        return {
          success: false,
          error: 'No email recipients specified'
        }
      }

      const subject = content.subject || 'Event Notification'
      const html = content.html || content.body || ''
      const text = this.htmlToText(html)

      // Use nodemailer if available, otherwise return error with instructions
      try {
        return await this.sendWithNodemailer(credentials, recipients, subject, html, text, files)
      } catch (nodemailerError: any) {
        // nodemailer not available or error occurred
        if (nodemailerError.code === 'MODULE_NOT_FOUND') {
          return {
            success: false,
            error: 'nodemailer package not installed. Install with: npm install nodemailer'
          }
        }
        throw nodemailerError
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send email via SMTP'
      }
    }
  }

  private async sendWithNodemailer(
    credentials: any,
    recipients: string[],
    subject: string,
    html: string,
    text: string,
    files: any[]
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

    const attachments = files.map(file => ({
      filename: file.name || 'attachment',
      path: file.url || file.path
    }))

    const result = await transporter.sendMail({
      from: `"${credentials.fromName}" <${credentials.fromEmail}>`,
      to: recipients.join(', '),
      subject: subject,
      text: text,
      html: html,
      attachments: attachments.length > 0 ? attachments : undefined
    })

    return {
      success: true,
      postId: result.messageId,
      url: undefined // Emails don't have URLs
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
