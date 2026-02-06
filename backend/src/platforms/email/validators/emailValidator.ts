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

  static validateContent(content: EmailContent | any): EmailValidation {
    const errors: string[] = []

    // ✅ NEW FORMAT: Check for _templates array (multiple templates with targets)
    const hasTemplates = (content as any)._templates && Array.isArray((content as any)._templates) && (content as any)._templates.length > 0

    if (hasTemplates) {
      // Validate _templates format
      const templates = (content as any)._templates
      
      if (templates.length === 0) {
        errors.push('At least one template must be specified')
      }

      // Validate each template entry
      for (let i = 0; i < templates.length; i++) {
        const templateEntry = templates[i]
        
        if (!templateEntry.templateId) {
          errors.push(`Template entry ${i + 1}: templateId is required`)
        }
        
        if (!templateEntry.targets) {
          errors.push(`Template entry ${i + 1}: targets configuration is required`)
        } else {
          const targets = templateEntry.targets
          if (!targets.mode) {
            errors.push(`Template entry ${i + 1}: targets.mode is required`)
          } else if (targets.mode === 'individual' && (!targets.individual || !Array.isArray(targets.individual) || targets.individual.length === 0)) {
            errors.push(`Template entry ${i + 1}: individual targets array is required when mode is 'individual'`)
          } else if (targets.mode === 'groups' && (!targets.groups || !Array.isArray(targets.groups) || targets.groups.length === 0)) {
            errors.push(`Template entry ${i + 1}: groups array is required when mode is 'groups'`)
          }
        }
      }

      // For _templates format, subject/html/bodyText are optional (will be generated from template)
      // But if provided, validate them
      if (content.subject && typeof content.subject === 'string' && content.subject.trim().length === 0) {
        errors.push('Email subject cannot be empty')
      }
    } else {
      // No _templates format found - this is required
      errors.push('Email content must use _templates format with targets configuration')
    }

    // Subject validation
    if (content.subject && content.subject.length > this.MAX_SUBJECT_LENGTH) {
      errors.push(`Subject too long: ${content.subject.length}/${this.MAX_SUBJECT_LENGTH} characters (may be truncated)`)
    }

    // Recipients validation is done per template in _templates format
    // No need to validate legacy recipients array anymore

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

    // Calculate recipient count (for _templates format, count will be calculated later)
    // We can count the number of templates
    const recipientCount = hasTemplates ? (content as any)._templates.length : 0

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recipientCount,
      totalSize
    }
  }

  static getTotalRecipientCount(content: EmailContent | any): number {
    // For _templates format, count will be calculated when recipients are extracted
    if ((content as any)._templates && Array.isArray((content as any)._templates)) {
      // Return number of templates as approximation (actual count requires target resolution)
      return (content as any)._templates.length
    }
    
    // Legacy format (should not be used)
    return ((content as EmailContent).recipients?.length || 0) +
           ((content as EmailContent).cc?.length || 0) +
           ((content as EmailContent).bcc?.length || 0)
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
