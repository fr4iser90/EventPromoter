// Email-specific validation

import { EmailContent, EmailValidation } from '../types.js'

export class EmailValidator {
  private static readonly MAX_RECIPIENTS = 100
  private static readonly MAX_SUBJECT_LENGTH = 78 // Recommended for email clients
  private static readonly MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024 // 25MB

  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  static validateContent(content: EmailContent): EmailValidation {
    const errors: string[] = []

    // Required fields
    if (!content.subject || typeof content.subject !== 'string' || content.subject.trim().length === 0) {
      errors.push('Email subject is required')
    }

    // Accept both html and bodyText (bodyText is from editor, html is legacy/full HTML)
    const hasHtml = content.html && typeof content.html === 'string' && content.html.trim().length > 0
    const hasBodyText = content.bodyText && typeof content.bodyText === 'string' && content.bodyText.trim().length > 0
    if (!hasHtml && !hasBodyText) {
      errors.push('Email content is required (html or bodyText)')
    }

    // Recipients are required but may come from platform settings, not content
    // Only validate if recipients are provided in content
    if (content.recipients) {
      if (!Array.isArray(content.recipients)) {
        errors.push('Recipients must be an array')
      } else if (content.recipients.length === 0) {
        errors.push('At least one recipient is required')
      }
    }

    // Subject validation
    if (content.subject && content.subject.length > this.MAX_SUBJECT_LENGTH) {
      errors.push(`Subject too long: ${content.subject.length}/${this.MAX_SUBJECT_LENGTH} characters (may be truncated)`)
    }

    // Recipients validation (only if array)
    if (content.recipients && Array.isArray(content.recipients)) {
      if (content.recipients.length > this.MAX_RECIPIENTS) {
        errors.push(`Too many recipients: ${content.recipients.length}/${this.MAX_RECIPIENTS} maximum`)
      }

      const invalidEmails = content.recipients.filter(email => !email || !this.validateEmail(email))
      if (invalidEmails.length > 0) {
        errors.push(`Invalid email addresses: ${invalidEmails.join(', ')}`)
      }

      // Check for duplicates (only valid emails)
      const validRecipients = content.recipients.filter(email => email && typeof email === 'string')
      const uniqueRecipients = new Set(validRecipients.map(email => email.toLowerCase()))
      if (uniqueRecipients.size !== validRecipients.length) {
        errors.push('Duplicate email addresses found')
      }
    }

    // CC/BCC validation
    const allAdditionalRecipients = [
      ...(content.cc || []),
      ...(content.bcc || [])
    ]

    if (allAdditionalRecipients.length > 0) {
      const invalidAdditional = allAdditionalRecipients.filter(email => !this.validateEmail(email))
      if (invalidAdditional.length > 0) {
        errors.push(`Invalid CC/BCC email addresses: ${invalidAdditional.join(', ')}`)
      }
    }

    // Attachments validation
    let totalSize = 0
    if (content.attachments) {
      for (const attachment of content.attachments) {
        if (attachment.size > this.MAX_ATTACHMENT_SIZE) {
          errors.push(`Attachment '${attachment.name}' too large: ${(attachment.size / 1024 / 1024).toFixed(1)}MB (max 25MB)`)
        }
        totalSize += attachment.size
      }

      const totalMB = totalSize / 1024 / 1024
      if (totalMB > 10) {
        errors.push(`Total attachments size: ${totalMB.toFixed(1)}MB - consider smaller files or fewer attachments`)
      }
    }

    // HTML content validation (only if html exists)
    if (content.html && typeof content.html === 'string') {
      // Check for basic HTML structure
      if (!content.html.includes('<') || !content.html.includes('>')) {
        errors.push('Email content should contain proper HTML formatting')
      }

      // Check for very long content
      if (content.html.length > 50000) {
        errors.push('Email content is very long - consider breaking into multiple emails or using attachments')
      }
    }

    // bodyText validation (only if bodyText exists)
    if (content.bodyText && typeof content.bodyText === 'string') {
      // Check for very long content
      if (content.bodyText.length > 50000) {
        errors.push('Email content is very long - consider breaking into multiple emails or using attachments')
      }
    }

    const warnings: string[] = []

    // Add warnings for optimization
    if (content.subject && content.subject.length < 10) {
      warnings.push('Subject is quite short - consider making it more descriptive')
    }

    // Only check for images if html exists
    if (content.html && typeof content.html === 'string') {
      if (!content.html.includes('<img') && !content.attachments?.length) {
        warnings.push('Consider adding images or attachments to make the email more engaging')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recipientCount: content.recipients?.length || 0,
      totalSize
    }
  }

  static getTotalRecipientCount(content: EmailContent): number {
    return (content.recipients?.length || 0) +
           (content.cc?.length || 0) +
           (content.bcc?.length || 0)
  }

  static estimateSendTime(recipientCount: number): string {
    // Rough estimate: ~2 seconds per email for SMTP
    const seconds = recipientCount * 2
    if (seconds < 60) {
      return `${seconds} seconds`
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} minutes`
    } else {
      return `${Math.round(seconds / 3600)} hours`
    }
  }
}
