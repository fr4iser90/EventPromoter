/**
 * Email Platform N8N Service
 * 
 * Handles N8N-specific transformations for email content
 * 
 * @module platforms/email/services/n8nService
 */

import { EmailContent } from '../types.js'
import { EmailService } from './emailService.js'
import { EmailTargetService } from './targetService.js'
import { UploadedFile } from '../../../types/index.js'

export class EmailN8nService {
  /**
   * Transform attachments from Base64/File-IDs to URLs for n8n
   * Maps attachment file IDs to URLs from the files array
   * @param attachments - Attachment array
   * @param files - Uploaded files array for mapping
   * @param baseUrl - Base URL from request (for absolute URL construction)
   */
  private static transformAttachmentsToUrls(
    attachments: any[],
    files: UploadedFile[],
    baseUrl?: string
  ): any[] {
    if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
      return []
    }

    if (!baseUrl) {
      console.warn('BASE_URL not provided, cannot convert attachments to URLs')
      return attachments // Return as-is if BASE_URL not available
    }

    return attachments.map((attachment: any) => {
      // If attachment already has a URL, use it (but ensure it's absolute)
      if (attachment.url) {
        if (attachment.url.startsWith('http://') || attachment.url.startsWith('https://')) {
          return {
            filename: attachment.name || attachment.filename || 'attachment',
            url: attachment.url,
            contentType: attachment.type || attachment.contentType || 'application/octet-stream',
            size: attachment.size || 0
          }
        }
        // Relative URL - make it absolute using URL API
        return {
          filename: attachment.name || attachment.filename || 'attachment',
          url: new URL(attachment.url, baseUrl).toString(),
          contentType: attachment.type || attachment.contentType || 'application/octet-stream',
          size: attachment.size || 0
        }
      }

      // If attachment has a file ID, try to find it in files array
      if (attachment.fileId || attachment.id) {
        const fileId = attachment.fileId || attachment.id
        const file = files.find(f => f.id === fileId || f.filename === fileId || f.name === fileId)
        
        if (file && file.url) {
          // Convert relative URL to absolute using URL API
          return {
            filename: file.name || attachment.name || 'attachment',
            url: new URL(file.url, baseUrl).toString(),
            contentType: file.type || attachment.type || 'application/octet-stream',
            size: file.size || attachment.size || 0
          }
        }
      }

      // If attachment has base64 but no URL/fileId, we can't convert it
      // Log warning and skip it (n8n can't use base64 directly)
      if (attachment.base64) {
        console.warn(`Attachment "${attachment.name || 'unknown'}" has base64 but no file ID/URL. Skipping for n8n.`)
        return null
      }

      // Fallback: return as-is (might not work with n8n, but at least we tried)
      console.warn(`Attachment "${attachment.name || 'unknown'}" could not be converted to URL format`)
      return attachment
    }).filter((att: any) => att !== null) // Remove null entries
  }

  /**
   * Extract recipients from targets configuration
   * Helper function to convert targets (mode/groups/individual) to recipient email array
   */
  private static async extractRecipientsFromTargets(targetsConfig: any): Promise<string[]> {
    if (!targetsConfig) return []

    const targetService = new EmailTargetService()
    const allTargets = await targetService.getTargets()
    const groups = await targetService.getGroups()
    // targetType is REQUIRED - no fallbacks
    const allRecipients = allTargets.map((t: any) => {
      if (!t.targetType) {
        console.error(`Target ${t.id} missing targetType - this should not happen`)
        return undefined
      }
      const baseField = targetService.getBaseField(t.targetType)
      return t[baseField]
    }).filter((email: string | undefined): email is string => email !== undefined)

    if (targetsConfig.mode === 'all') {
      return allRecipients
    } else if (targetsConfig.mode === 'groups' && targetsConfig.groups && Array.isArray(targetsConfig.groups)) {
      // Collect all emails from selected groups
      const emails: string[] = []
      for (const groupIdentifier of targetsConfig.groups) {
        // Find group by ID or name (groups is an array)
        const group = groups.find((g: any) => g.id === groupIdentifier || g.name === groupIdentifier)
        if (!group) continue
        
        // Convert target IDs to emails (targetType is REQUIRED)
        const groupEmails = group.targetIds
          .map((targetId: string) => {
            const target = allTargets.find((t: any) => t.id === targetId)
            if (!target) return undefined
            if (!target.targetType) {
              console.error(`Target ${target.id} missing targetType - this should not happen`)
              return undefined
            }
            const baseField = targetService.getBaseField(target.targetType)
            return target[baseField]
          })
          .filter((email: string | undefined): email is string => email !== undefined)
        emails.push(...groupEmails)
      }
      return [...new Set(emails)] // Remove duplicates
    } else if (targetsConfig.mode === 'individual' && targetsConfig.individual && Array.isArray(targetsConfig.individual)) {
      // targetType is REQUIRED - no fallbacks
      const targetMap = new Map(allTargets.map((t: any) => {
        if (!t.targetType) {
          console.error(`Target ${t.id} missing targetType - this should not happen`)
          return [t.id, undefined]
        }
        const baseField = targetService.getBaseField(t.targetType)
        return [t.id, t[baseField]]
      }))
      const individualEmails: string[] = targetsConfig.individual
        .map((targetId: string) => targetMap.get(targetId))
        .filter((email: string | undefined): email is string => email !== undefined)
        return [...new Set(individualEmails)]
    }

    return []
  }

  /**
   * Transform email content for N8N webhook
   * Requires _templates format with targets configuration
   * @param content - Email content with _templates array
   * @param emailService - Email service instance
   * @param files - Array of uploaded files for mapping attachment IDs to URLs
   * @param baseUrl - Base URL from request (for file URL transformation)
   */
  static async transformForN8n(
    content: any, 
    emailService: EmailService,
    files: UploadedFile[] = [],
    baseUrl?: string
  ): Promise<any> {
    // ✅ NEW FORMAT: Check for _templates array (multiple templates with targets)
    if (content._templates && Array.isArray(content._templates) && content._templates.length > 0) {
      // Transform each template+targets combination to a separate email
      const emails: any[] = []
      const sentRecipients = new Set<string>()

      for (const templateEntry of content._templates) {
        const recipients = await this.extractRecipientsFromTargets(templateEntry.targets)
        
        if (recipients.length === 0) {
          console.warn(`No recipients found for template ${templateEntry.templateId}, skipping`)
          continue
        }
        
        // Filter out recipients that have already received an email
        const uniqueRecipients = recipients.filter(email => {
          if (sentRecipients.has(email)) {
            console.warn(`Recipient ${email} already received an email, skipping duplicate`)
            return false
          }
          sentRecipients.add(email)
          return true
        })
        
        if (uniqueRecipients.length === 0) {
          console.warn(`All recipients for template ${templateEntry.templateId} already received emails, skipping`)
          continue
        }

        // ✅ RE-RENDER TEMPLATE: Render template with Target-Locale for correct date formatting
        let html: string
        let subject: string
        
        // Get target locale from templateEntry.targets.templateLocale
        const targetLocale = templateEntry.targets?.templateLocale
        
        // If template exists and we have a target locale, re-render with correct locale
        if (templateEntry.templateId && targetLocale && ['en', 'de', 'es'].includes(targetLocale)) {
          try {
            const { TemplateService } = await import('../../../services/templateService.js')
            const templateModule = await import('../templates/index.js')
            const { renderTemplate } = templateModule
            const { formatDate } = await import('../../../services/parsing/templateVariables.js')
            
            const template = await TemplateService.getTemplate('email', templateEntry.templateId)
            if (template && template.template && typeof template.template === 'object') {
              // Convert Template to EmailTemplate format
              const emailTemplate = {
                id: template.id,
                name: template.name,
                description: template.description,
                category: template.category,
                variables: template.variables,
                template: {
                  subject: template.template.subject || '',
                  html: template.template.html || ''
                },
                translations: (template as any).translations,
                defaultLocale: (template as any).defaultLocale,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt
              }
              
              // Extract variables from content (all _var_* fields)
              const variables: Record<string, string> = {}
              for (const [key, value] of Object.entries(content)) {
                if (key.startsWith('_var_')) {
                  const varName = key.replace('_var_', '')
                  let varValue = String(value || '')
                  
                  // ✅ FORMATIERUNG: Datum/Zeit mit Target-Locale formatieren
                  if (varName === 'date' || varName === 'eventDate') {
                    varValue = formatDate(varValue, targetLocale)
                  }
                  // time bleibt unverändert (bereits 24h Format)
                  
                  variables[varName] = varValue
                }
              }
              
              // Render template with Target-Locale
              const rendered = renderTemplate(emailTemplate, variables, targetLocale as 'en' | 'de' | 'es')
              
              // Extract content HTML from template HTML (remove document structure)
              const previewService = await import('./previewService.js')
              html = previewService.extractContentFromTemplateHtml(rendered.html)
              subject = rendered.subject
            } else {
              // Fallback: use existing content
              throw new Error('Template not found or invalid')
            }
          } catch (error: any) {
            console.warn(`Failed to re-render template ${templateEntry.templateId} with locale ${targetLocale}, using existing content:`, error.message)
            // Fallback: use existing content
            if (content.html && typeof content.html === 'string' && content.html.trim().length > 0) {
              html = content.html
            } else if (content.bodyText && typeof content.bodyText === 'string' && content.bodyText.trim().length > 0) {
              html = emailService.buildBodyFromStructuredFields({ bodyText: content.bodyText })
            } else {
              throw new Error(`Email content (html or bodyText) is required for template ${templateEntry.templateId}`)
            }
            subject = content.subject || 'No Subject'
          }
        } else {
          // No template or no target locale: use existing content
          if (content.html && typeof content.html === 'string' && content.html.trim().length > 0) {
            html = content.html
          } else if (content.bodyText && typeof content.bodyText === 'string' && content.bodyText.trim().length > 0) {
            html = emailService.buildBodyFromStructuredFields({ bodyText: content.bodyText })
          } else {
            throw new Error(`Email content (html or bodyText) is required for template ${templateEntry.templateId}`)
          }
          subject = content.subject || 'No Subject'
        }

        if (!html || html.trim().length === 0) {
          throw new Error(`Email content (html or bodyText) is required for template ${templateEntry.templateId}`)
        }

        const emailPayload: any = {
          subject: subject,
          html: html,
          recipients: uniqueRecipients.join(', '),
          templateId: templateEntry.templateId,
          templateName: templateEntry.templateName
        }

        // Add cc if present
        if (content.cc && Array.isArray(content.cc) && content.cc.length > 0) {
          emailPayload.cc = content.cc.join(', ')
        }

        // Add bcc if present
        if (content.bcc && Array.isArray(content.bcc) && content.bcc.length > 0) {
          emailPayload.bcc = content.bcc.join(', ')
        }

        // Collect attachments from both content.attachments and content.globalFiles
        const allAttachments: any[] = []
        
        // Add explicit attachments if present
        if (content.attachments && Array.isArray(content.attachments) && content.attachments.length > 0) {
          allAttachments.push(...content.attachments)
        }
        
        // Add globalFiles as attachments (map file IDs to attachment format)
        if (content.globalFiles && Array.isArray(content.globalFiles) && content.globalFiles.length > 0) {
          for (const globalFile of content.globalFiles) {
            // Find file in files array by ID or filename
            const fileId = globalFile.id || globalFile.filename || globalFile.name
            const file = files.find(f => 
              f.id === fileId || 
              f.filename === fileId || 
              f.name === fileId ||
              f.id === globalFile.id?.replace(/\.pdf$/, '') || // Handle ID without extension
              f.filename === globalFile.filename
            )
            
            if (file) {
              // Convert globalFile to attachment format
              allAttachments.push({
                fileId: file.id,
                id: file.id,
                name: file.name || globalFile.filename || 'attachment',
                filename: file.filename || globalFile.filename || 'attachment',
                type: file.type || globalFile.type || 'application/octet-stream',
                contentType: file.type || globalFile.type || 'application/octet-stream',
                size: file.size || 0,
                url: file.url // Will be transformed to absolute URL below
              })
            } else {
              console.warn(`Global file not found in files array: ${fileId}`, globalFile)
            }
          }
        }
        
        // Add template-specific files (specificFiles) as attachments
        if (templateEntry.specificFiles && Array.isArray(templateEntry.specificFiles) && templateEntry.specificFiles.length > 0) {
          for (const specificFile of templateEntry.specificFiles) {
            const fileId = specificFile.id || specificFile.filename || specificFile.name
            const file = files.find(f => 
              f.id === fileId || 
              f.filename === fileId || 
              f.name === fileId ||
              f.id === specificFile.id?.replace(/\.pdf$/, '') ||
              f.filename === specificFile.filename
            )
            
            if (file) {
              allAttachments.push({
                fileId: file.id,
                id: file.id,
                name: file.name || specificFile.filename || 'attachment',
                filename: file.filename || specificFile.filename || 'attachment',
                type: file.type || specificFile.type || 'application/octet-stream',
                contentType: file.type || specificFile.type || 'application/octet-stream',
                size: file.size || 0,
                url: file.url
              })
            } else {
              console.warn(`Specific file not found in files array: ${fileId}`, specificFile)
            }
          }
        }
        
        // Transform all attachments to URLs for n8n
        if (allAttachments.length > 0) {
          emailPayload.attachments = this.transformAttachmentsToUrls(allAttachments, files, baseUrl)
        }

        emails.push(emailPayload)
      }

      // Return array of emails (n8n can handle multiple emails)
      return emails.length === 1 ? emails[0] : { emails }
    }

    // No _templates format found - this is required
    throw new Error('Email content must use _templates format with targets configuration. Legacy recipients format is no longer supported.')
  }
}
