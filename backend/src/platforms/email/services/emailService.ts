// Email platform service

import { EmailContent, EmailConfig } from '../types.js'
import { EmailValidator } from '../validators/emailValidator.js'
import { EmailTargetService } from './targetService.js'
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

  transformForAPI(content: EmailContent | any) {
    // Use html if available, otherwise use bodyText (convert to HTML if needed)
    const html = content.html || (content.bodyText ? this.buildBodyFromStructuredFields({ bodyText: content.bodyText }) : '')
    
    // For _templates format, recipients are extracted per template
    // This method is mainly for legacy/fallback, but we'll return empty recipients for _templates
    const recipients = (content as any)._templates ? [] : (content as EmailContent).recipients || []
    
    return {
      to: recipients,
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

  // Helper method to get target service
  private targetService: EmailTargetService | null = null
  
  private getTargetService(): EmailTargetService {
    if (!this.targetService) {
      this.targetService = new EmailTargetService()
    }
    return this.targetService
  }
  
  /**
   * Get all recipients and groups for publishing
   */
  private async getRecipientsForPublishing(): Promise<{ available: string[]; groups: Record<string, string[]>; groupsData: Record<string, any> }> {
    const service = this.getTargetService()
    const targets = await service.getTargets()
    const groups = await service.getGroups()
    
    // targetType is REQUIRED - no fallbacks
    const available = targets.map((t: any) => {
      if (!t.targetType) {
        console.error(`Target ${t.id} missing targetType - this should not happen`)
        return undefined
      }
      const baseField = service.getBaseField(t.targetType)
      return t[baseField]
    }).filter((email: string | undefined): email is string => email !== undefined)
    
    // Convert groups from Array to { [groupName]: [email] } or { [groupId]: [email] }
    const groupEmails: Record<string, string[]> = {}
    const targetMap = new Map(targets.map((t: any) => {
      if (!t.targetType) {
        console.error(`Target ${t.id} missing targetType - this should not happen`)
        return [t.id, undefined]
      }
      const baseField = service.getBaseField(t.targetType)
      return [t.id, t[baseField]]
    }))
    
    // groups is an array, not an object
    for (const group of groups) {
      const emails = group.targetIds
        .map((id: string) => targetMap.get(id))
        .filter((email: string | undefined): email is string => email !== undefined)
      if (emails.length > 0) {
        // Support both group name and group ID as keys
        groupEmails[group.name] = emails
        groupEmails[group.id] = emails
      }
    }
    
    return {
      available,
      groups: groupEmails,
      groupsData: groups // Full group objects for lookup
    }
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
      let imageUrl = content.headerImage
      
      // For actual email sending, use absolute URLs (not base64)
      // Preview uses base64, but actual emails need accessible URLs
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`
        imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
      }
      
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
    locale?: string
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
    locale?: string
  }): Promise<Array<{
    target?: string
    templateId?: string
    metadata?: Record<string, any>
    html: string
    dimensions?: { width: number; height: number }
  }>> {
    // Import email-specific multi-preview renderer
    const { renderMultiPreview } = await import('./previewService.js')
    
    // ✅ EMAIL-SPECIFIC: Extract recipients from content._templates (NEW FORMAT)
    // Check for _templates array first (new format with targets per template)
    if (options.content._templates && Array.isArray(options.content._templates) && options.content._templates.length > 0) {
      // Generate previews for each template+targets combination
      const previews: Array<{
        target?: string
        templateId?: string
        metadata?: Record<string, any>
        html: string
        dimensions?: { width: number; height: number }
      }> = []

      for (const templateEntry of options.content._templates) {
        if (!templateEntry.targets) continue

        // ✅ NO FALLBACKS: Use ONLY templateEntry.targets.templateLocale (user's explicit choice)
        // If not set, use undefined (no fallback to options.locale)

        console.log('🔍 EmailService: Rendering preview for template:', {
          templateId: templateEntry.templateId,
          templateName: templateEntry.templateName,
          templateLocale: templateEntry.targets.templateLocale
        })

        // Use email-specific renderMultiPreview for this template+targets combination
        const templatePreviews = await renderMultiPreview(this, {
          content: { ...options.content, _templateId: templateEntry.templateId },
          recipients: templateEntry.targets,
          schema: options.schema,
          mode: options.mode || 'desktop',
          locale: templateEntry.targets.templateLocale
        })

        // Add templateId to each preview
        previews.push(...templatePreviews.map(preview => ({
          target: preview.group,
          templateId: templateEntry.templateId || preview.templateId,
          metadata: {
            targets: preview.targets
          },
          html: preview.html,
          dimensions: preview.dimensions
        })))
      }

      return previews.length > 0 ? previews : [{
        html: '<p>No preview available</p>',
        dimensions: { width: 600, height: 400 }
      }]
    }
    
    // No _templates found - return single preview
    const singlePreview = await this.renderPreview(options)
    return [{
      html: singlePreview.html,
      dimensions: singlePreview.dimensions
    }]
  }

  /**
   * Transform email content for N8N webhook
   * Delegates to platform-specific N8N service
   * Now supports async (for extracting recipients from targets)
   * @param content - Email content
   * @param files - Optional array of uploaded files for attachment URL mapping
   * @param baseUrl - Base URL from request (for file URL transformation)
   */
  async transformForN8n(content: any, files: any[] = [], baseUrl?: string): Promise<any> {
    return EmailN8nService.transformForN8n(content, this, files, baseUrl)
  }

  /**
   * Extract human-readable target from email content
   * Returns template info from _templates format
   */
  extractTarget(content: any): string {
    // Only support _templates format
    if (!content._templates || !Array.isArray(content._templates) || content._templates.length === 0) {
      return 'No templates configured'
    }

    const templates = content._templates
    const targetDescriptions = templates.map((t: any, idx: number) => {
      const templateName = t.templateName || t.templateId || `Template ${idx + 1}`
      if (t.targets?.mode === 'all') {
        return `${templateName}: All recipients`
      } else if (t.targets?.mode === 'individual' && t.targets?.targetNames) {
        return `${templateName}: ${t.targets.targetNames.join(', ')}`
      } else if (t.targets?.mode === 'groups' && t.targets?.groups) {
        return `${templateName}: ${t.targets.groups.length} group(s)`
      }
      return templateName
    })
    return targetDescriptions.join(' | ')
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
    const recipientData = await this.getRecipientsForPublishing()
    const allRecipients = recipientData.available || []
    const groups = recipientData.groupsData || {} // Full Group objects: Record<string, Group>

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
      for (const groupIdentifier of recipients.groups) {
        // Find group by ID or name (groups is an array)
        let group = groups.find((g: any) => g.id === groupIdentifier || g.name === groupIdentifier)
        if (!group) continue

        // Get emails for this group (generic - uses baseField)
        const allTargets = await this.getTargetService().getTargets()
        const targetService = this.getTargetService()
        const targetMap = new Map(allTargets.map((t: any) => {
          if (!t.targetType) {
            console.error(`Target ${t.id} missing targetType - this should not happen`)
            return undefined
          }
          const baseField = targetService.getBaseField(t.targetType)
          return [t.id, t[baseField]]
        }))
        const groupEmails = group.targetIds
          .map((targetId: string) => targetMap.get(targetId))
          .filter((email: string | undefined): email is string => email !== undefined)
        
        if (groupEmails.length === 0) continue

        // Get template for this group (from mapping or default)
        // Support both group ID and group name in templateMapping
        const templateId = recipients.templateMapping?.[groupIdentifier] || 
                          recipients.templateMapping?.[group.name] || 
                          recipients.templateMapping?.[group.id] ||
                          recipients.defaultTemplate
        
        // Build content with template
        const emailContent = await this.buildContentWithTemplate(content, templateId)
        emailContent.recipients = groupEmails

        // Send email
        const result = await publisher.publish(emailContent, files, hashtags)
        results.push({
          group: group.name,
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
