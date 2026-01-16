/**
 * Email Platform N8N Service
 * 
 * Handles N8N-specific transformations for email content
 * 
 * @module platforms/email/services/n8nService
 */

import { EmailContent } from '../types.js'
import { EmailService } from './emailService.js'

export class EmailN8nService {
  /**
   * Transform email content for N8N webhook
   * Platform-specific transformation - converts recipients array to comma-separated string
   */
  static transformForN8n(content: EmailContent, emailService: EmailService): any {
    // Check if recipients exist and is valid array
    if (!content.recipients || !Array.isArray(content.recipients) || content.recipients.length === 0) {
      throw new Error('Email recipients are required but not found in content')
    }

    // Get HTML content - use html if available, otherwise build from bodyText
    let html: string
    if (content.html && typeof content.html === 'string' && content.html.trim().length > 0) {
      html = content.html
    } else if (content.bodyText && typeof content.bodyText === 'string' && content.bodyText.trim().length > 0) {
      html = emailService.buildBodyFromStructuredFields({ bodyText: content.bodyText })
    } else {
      throw new Error('Email content (html or bodyText) is required')
    }

    if (!html || html.trim().length === 0) {
      throw new Error('Email content (html or bodyText) is required')
    }

    const result: any = {
      subject: content.subject,
      html: html,
      // Convert recipients array to comma-separated string for N8N email node
      recipients: content.recipients.join(', ')
    }

    // Add cc if present
    if (content.cc && Array.isArray(content.cc) && content.cc.length > 0) {
      result.cc = content.cc.join(', ')
    }

    // Add bcc if present
    if (content.bcc && Array.isArray(content.bcc) && content.bcc.length > 0) {
      result.bcc = content.bcc.join(', ')
    }

    // Add attachments if present
    if (content.attachments && Array.isArray(content.attachments) && content.attachments.length > 0) {
      result.attachments = content.attachments
    }

    return result
  }
}
