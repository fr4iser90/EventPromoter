// Email platform service

import { EmailContent, EmailConfig } from '../types.js'
import { EmailValidator } from '../validators/emailValidator.js'
import { EmailRecipientService } from './recipientService.js'
import { renderEmailPreview } from './previewService.js'
import { EmailN8nService } from './n8nService.js'

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
    // Use html if available, otherwise use bodyText (convert to HTML if needed)
    const html = content.html || (content.bodyText ? this.buildBodyFromStructuredFields({ bodyText: content.bodyText }) : '')
    return {
      to: content.recipients,
      cc: content.cc || [],
      bcc: content.bcc || [],
      subject: content.subject,
      html,
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

    // Only check html if it exists
    const html = content.html
    if (html) {
      if (!html.includes('unsubscribe') && !html.includes('opt-out')) {
        tips.push('Consider adding an unsubscribe link for compliance')
      }

      if (html.length < 500) {
        tips.push('Email content is quite short - consider adding more details or images')
      }

      if (!html.includes('<img') && !content.attachments?.length) {
        tips.push('Consider adding images to make the email more engaging')
      }

      // Check for personalization
      const personalizationTags = ['{name}', '{firstName}', '{email}']
      const hasPersonalization = personalizationTags.some(tag => html.includes(tag))
      if (!hasPersonalization && validation.recipientCount > 1) {
        tips.push('Consider personalizing the email content for better engagement')
      }
    }

    if (content.attachments && content.attachments.length > 3) {
      tips.push('Multiple attachments may increase bounce rate')
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
    const htmlContent = content.html || content.bodyText || ''
    return {
      subject: content.subject,
      preview: htmlContent ? this.createPlainTextVersion(htmlContent).substring(0, 150) + '...' : ''
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
  async   exportGroups(): Promise<{ success: boolean; groups?: Record<string, string[]>; error?: string }> {
    return await EmailRecipientService.exportGroups()
  }

  /**
   * Build HTML email body from structured fields
   * This allows users to edit simple fields instead of raw HTML
   * 
   * @param content - Content object with structured fields
   * @returns HTML email body
   */
  buildBodyFromStructuredFields(content: any): string {
    // If legacy body exists and structured fields are not used, return it
    if (content.body && !content.bodyText && !content.headerImage && !content.ctaButtonText) {
      return content.body
    }

    // Build HTML from structured fields
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .header-image { width: 100%; max-width: 100%; height: auto; display: block; margin-bottom: 20px; border-radius: 8px; }
    .body-text { line-height: 1.6; margin: 20px 0; }
    .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; text-align: center; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">`

    // Header Image
    if (content.headerImage) {
      const imageUrl = content.headerImage.startsWith('http') 
        ? content.headerImage 
        : content.headerImage.startsWith('/')
          ? `http://localhost:4000${content.headerImage}`
          : content.headerImage
      html += `
    <img src="${imageUrl}" alt="Event Image" class="header-image" />`
    }

    // Body Text
    if (content.bodyText) {
      // Convert plain text to HTML (preserve line breaks)
      const bodyHtml = content.bodyText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
      html += `
    <div class="body-text">
      <p>${bodyHtml}</p>
    </div>`
    }

    // CTA Button
    if (content.ctaButtonText && content.ctaButtonLink) {
      html += `
    <div style="text-align: center;">
      <a href="${content.ctaButtonLink}" class="cta-button">${content.ctaButtonText}</a>
    </div>`
    }

    // Footer
    if (content.footerText) {
      const footerHtml = content.footerText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
      html += `
    <div class="footer">
      <p>${footerHtml}</p>
    </div>`
    }

    html += `
  </div>
</body>
</html>`

    return html
  }

  /**
   * Process content before saving - builds HTML from structured fields if needed
   * 
   * @param content - Raw content from frontend
   * @returns Processed content with HTML body built from structured fields
   */
  processContentForSave(content: any): any {
    const processed = { ...content }
    
    // Check if structured fields are used
    const hasStructuredFields = content.bodyText || content.headerImage || content.ctaButtonText || content.ctaButtonLink || content.footerText
    
    if (hasStructuredFields) {
      // Build HTML body from structured fields
      processed.body = this.buildBodyFromStructuredFields(content)
    } else if (content.html && !content.body) {
      // If html is present but no structured fields, use html as body
      // Extract body content from full HTML if needed
      const bodyMatch = content.html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      processed.body = bodyMatch ? bodyMatch[1] : content.html
    } else if (!content.body && content.bodyText) {
      // If only bodyText is present, convert to HTML
      processed.body = this.buildBodyFromStructuredFields({ bodyText: content.bodyText })
    }
    
    return processed
  }

  /**
   * Render preview HTML
   * 
   * Delegates to platform-specific preview renderer
   * 
   * @param options - Render options
   * @returns Rendered HTML preview
   */
  async renderPreview(options: {
    content: Record<string, any>
    schema: any
    mode?: string
    client?: string
    darkMode?: boolean
  }): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
    return renderEmailPreview(this, options)
  }

  /**
   * Render multi-preview HTML (generic interface implementation)
   * 
   * Backend decides if multi-preview is needed based on content.
   * For email: checks if content.recipients exists and has multiple groups
   * Other platforms can implement their own logic
   * 
   * @param options - Render options
   * @returns Array of previews (single or multiple)
   */
  async renderMultiPreview(options: {
    content: Record<string, any>
    targets?: Record<string, any> // Optional: can be extracted from content
    schema: any
    mode?: string
    darkMode?: boolean
  }): Promise<Array<{
    target?: string
    templateId?: string
    metadata?: Record<string, any>
    html: string
    dimensions?: { width: number; height: number }
  }>> {
    // Import email-specific multi-preview renderer
    const { renderMultiPreview } = await import('./previewService.js')
    
    // ✅ EMAIL-SPECIFIC: Extract recipients from content (backend knows about email structure)
    // This is the ONLY place where we know about "recipients" - it's email-specific
    const recipients = options.targets || options.content.recipients
    
    // Check if multi-preview is needed (email-specific logic)
    const needsMultiPreview = recipients && (
      (recipients.mode === 'groups' && recipients.groups && recipients.groups.length > 1) ||
      (recipients.mode === 'all')
    )
    
    if (!needsMultiPreview) {
      // Return single preview if multi-preview not needed
      const singlePreview = await this.renderPreview(options)
      return [{
        html: singlePreview.html,
        dimensions: singlePreview.dimensions
      }]
    }

    // Use email-specific renderMultiPreview
    const previews = await renderMultiPreview(this, {
      content: options.content,
      recipients,
      schema: options.schema,
      mode: options.mode || 'desktop',
      darkMode: options.darkMode
    })

    // Transform to generic format
    return previews.map(preview => ({
      target: preview.group,
      templateId: preview.templateId,
      metadata: {
        recipients: preview.recipients
      },
      html: preview.html,
      dimensions: preview.dimensions
    }))
  }

  /**
   * Transform email content for N8N webhook
   * Delegates to platform-specific N8N service
   * Now supports async (for extracting recipients from targets)
   */
  async transformForN8n(content: any): Promise<any> {
    return EmailN8nService.transformForN8n(content, this)
  }

  /**
   * Extract human-readable target from email content
   * Returns comma-separated list of recipients
   */
  extractTarget(content: EmailContent): string {
    if (content.recipients) {
      if (Array.isArray(content.recipients)) {
        return content.recipients.join(', ')
      }
      if (typeof content.recipients === 'string') {
        return content.recipients
      }
    }
    return 'No recipients'
  }

  /**
   * Extract response data from n8n/API/Playwright response
   * Email responses typically don't have postId/url, just success status
   */
  extractResponseData(response: any): { postId?: string, url?: string, success: boolean, error?: string } {
    // Handle n8n email node response: { json: { success, messageId } }
    if (response.json) {
      const data = response.json
      return {
        success: data.success !== false,
        postId: data.messageId,
        error: data.error || (data.success === false ? data.message : undefined)
      }
    }

    // Handle direct API response
    if (typeof response.success === 'boolean') {
      return {
        success: response.success,
        postId: response.messageId || response.postId,
        error: response.error
      }
    }

    // Default: assume success if no error
    return {
      success: !response.error,
      postId: response.messageId,
      error: response.error
    }
  }

  /**
   * Send emails to recipients with template per group
   * 
   * @param recipients - Recipients configuration with groups and template mapping
   * @param content - Base email content
   * @param publisher - Email publisher instance
   * @param files - Files to attach
   * @param hashtags - Hashtags
   * @returns Array of send results per group
   */
  async sendToRecipientsWithTemplates(
    recipients: {
      mode?: 'all' | 'groups' | 'individual'
      groups?: string[]
      templateMapping?: Record<string, string>
      defaultTemplate?: string
      individuals?: string[]
    },
    content: EmailContent,
    publisher: any,
    files: any[] = [],
    hashtags: string[] = []
  ): Promise<Array<{
    group?: string
    templateId?: string
    recipients: string[]
    success: boolean
    error?: string
    result?: any
  }>> {
    const results: Array<{
      group?: string
      templateId?: string
      recipients: string[]
      success: boolean
      error?: string
      result?: any
    }> = []

    // Get all recipients and groups
    const recipientData = await EmailRecipientService.getRecipients()
    const allRecipients = recipientData.available || []
    const groups = recipientData.groups || {}

    // Determine recipients based on mode
    if (recipients.mode === 'all') {
      // Send to all with default template
      const templateId = recipients.defaultTemplate
      const emailContent = await this.buildContentWithTemplate(content, templateId)
      
      const result = await publisher.publish(emailContent, files, hashtags)
      results.push({
        recipients: allRecipients,
        templateId,
        success: result.success,
        error: result.error,
        result
      })
    } else if (recipients.mode === 'groups' && recipients.groups && recipients.groups.length > 0) {
      // Send to each group with its assigned template
      for (const groupName of recipients.groups) {
        const groupEmails = groups[groupName] || []
        if (groupEmails.length === 0) continue

        // Get template for this group (from mapping or default)
        const templateId = recipients.templateMapping?.[groupName] || recipients.defaultTemplate
        
        // Build content with template
        const emailContent = await this.buildContentWithTemplate(content, templateId)
        emailContent.recipients = groupEmails

        // Send email
        const result = await publisher.publish(emailContent, files, hashtags)
        results.push({
          group: groupName,
          templateId,
          recipients: groupEmails,
          success: result.success,
          error: result.error,
          result
        })
      }
    } else if (recipients.mode === 'individual' && recipients.individuals && recipients.individuals.length > 0) {
      // Send to individuals with default template
      const templateId = recipients.defaultTemplate
      const emailContent = await this.buildContentWithTemplate(content, templateId)
      emailContent.recipients = recipients.individuals

      const result = await publisher.publish(emailContent, files, hashtags)
      results.push({
        recipients: recipients.individuals,
        templateId,
        success: result.success,
        error: result.error,
        result
      })
    }

    return results
  }

  /**
   * Build email content with template applied
   * 
   * @param baseContent - Base content
   * @param templateId - Template ID to apply
   * @returns Content with template applied
   */
  private async buildContentWithTemplate(baseContent: EmailContent, templateId?: string): Promise<EmailContent> {
    if (!templateId) {
      return baseContent
    }

    // Import template service directly
    const { TemplateService } = await import('../../../services/templateService.js')
    const template = await TemplateService.getTemplate('email', templateId)
    
    if (!template) {
      return baseContent
    }

    // Apply template to content (this would use the template application logic)
    // For now, return baseContent - template application should be handled by template system
    return baseContent
  }

}
