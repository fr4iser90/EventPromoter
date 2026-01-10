// Email platform service

import { EmailContent, EmailConfig } from './types.js'
import { EmailValidator } from './validator.js'
import { EmailRecipientService } from './recipientService.js'

export class EmailService {
  private config: EmailConfig

  constructor(config: EmailConfig = {}) {
    this.config = config
  }

  validateContent(content: EmailContent) {
    return EmailValidator.validateContent(content)
  }

  getTotalRecipientCount(content: EmailContent) {
    return EmailValidator.getTotalRecipientCount(content)
  }

  estimateSendTime(content: EmailContent) {
    return EmailValidator.estimateSendTime(this.getTotalRecipientCount(content))
  }

  transformForAPI(content: EmailContent) {
    return {
      to: content.recipients,
      cc: content.cc || [],
      bcc: content.bcc || [],
      subject: content.subject,
      html: content.html,
      attachments: content.attachments || []
    }
  }

  generateHashtags(baseTags: string[]): string[] {
    // Emails don't typically use hashtags, but we can add them to the content
    return baseTags
  }

  getRequirements() {
    return {
      supports: ['html', 'text', 'image', 'attachment'],
      required: ['subject', 'html', 'recipients'],
      recommended: ['personalization', 'unsubscribe-link'],
      limits: {
        maxRecipients: 100,
        maxSubjectLength: 78,
        maxAttachmentSize: '25MB'
      }
    }
  }

  getOptimizationTips(content: EmailContent): string[] {
    const tips: string[] = []
    const validation = this.validateContent(content)

    if (!content.subject.includes('!') && !content.subject.includes('?')) {
      tips.push('Consider making the subject line more engaging with punctuation')
    }

    if (content.subject.length > 50) {
      tips.push('Long subject lines may be truncated - consider shortening')
    }

    if (validation.recipientCount > 50) {
      tips.push('Large recipient list - consider segmenting or using a mailing service')
    }

    if (!content.html.includes('unsubscribe') && !content.html.includes('opt-out')) {
      tips.push('Consider adding an unsubscribe link for compliance')
    }

    if (content.html.length < 500) {
      tips.push('Email content is quite short - consider adding more details or images')
    }

    if (!content.html.includes('<img') && !content.attachments?.length) {
      tips.push('Consider adding images to make the email more engaging')
    }

    if (content.attachments && content.attachments.length > 3) {
      tips.push('Multiple attachments may increase bounce rate')
    }

    // Check for personalization
    const personalizationTags = ['{name}', '{firstName}', '{email}']
    const hasPersonalization = personalizationTags.some(tag => content.html.includes(tag))
    if (!hasPersonalization && validation.recipientCount > 1) {
      tips.push('Consider personalizing the email content for better engagement')
    }

    return tips
  }

  createPlainTextVersion(htmlContent: string): string {
    // Simple HTML to text conversion
    return htmlContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  validateEmailList(emails: string[]): { valid: string[], invalid: string[] } {
    const valid: string[] = []
    const invalid: string[] = []

    for (const email of emails) {
      if (EmailValidator.validateEmail(email)) {
        valid.push(email)
      } else {
        invalid.push(email)
      }
    }

    return { valid, invalid }
  }

  generatePreview(content: EmailContent): { subject: string, preview: string } {
    return {
      subject: content.subject,
      preview: this.createPlainTextVersion(content.html).substring(0, 150) + '...'
    }
  }

  // ✅ GENERIC: Recipient Management Methods (delegate to EmailRecipientService)
  
  /**
   * Get all recipients and groups
   */
  async getRecipients(): Promise<{ available: string[]; groups: Record<string, string[]>; selected?: string[] }> {
    return await EmailRecipientService.getRecipients()
  }

  /**
   * Add a new recipient
   */
  async addRecipient(email: string): Promise<{ success: boolean; error?: string }> {
    return await EmailRecipientService.addRecipient(email)
  }

  /**
   * Remove a recipient
   */
  async removeRecipient(email: string): Promise<{ success: boolean; error?: string }> {
    return await EmailRecipientService.removeRecipient(email)
  }

  /**
   * Create a recipient group
   */
  async createGroup(groupName: string, emails: string[]): Promise<{ success: boolean; error?: string }> {
    return await EmailRecipientService.createGroup(groupName, emails)
  }

  /**
   * Update a recipient group
   */
  async updateGroup(groupName: string, emails: string[]): Promise<{ success: boolean; error?: string }> {
    return await EmailRecipientService.updateGroup(groupName, emails)
  }

  /**
   * Delete a recipient group
   */
  async deleteGroup(groupName: string): Promise<{ success: boolean; error?: string }> {
    return await EmailRecipientService.deleteGroup(groupName)
  }

  /**
   * Import recipient groups
   */
  async importGroups(groups: Record<string, string[]>): Promise<{ success: boolean; error?: string }> {
    return await EmailRecipientService.importGroups(groups)
  }

  /**
   * Export recipient groups
   */
  async exportGroups(): Promise<{ success: boolean; groups?: Record<string, string[]>; error?: string }> {
    return await EmailRecipientService.exportGroups()
  }
}
