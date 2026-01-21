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

export class EmailN8nService {
  /**
   * Extract recipients from targets configuration
   * Helper function to convert targets (mode/groups/individual) to recipient email array
   */
  private static async extractRecipientsFromTargets(targetsConfig: any): Promise<string[]> {
    if (!targetsConfig) return []

    const targetService = new EmailTargetService()
    const allTargets = await targetService.getTargets()
    const groups = await targetService.getGroups()
    const allRecipients = allTargets.map((t: any) => t.email)

    if (targetsConfig.mode === 'all') {
      return allRecipients
    } else if (targetsConfig.mode === 'groups' && targetsConfig.groups && Array.isArray(targetsConfig.groups)) {
      // Collect all emails from selected groups
      const emails: string[] = []
      for (const groupIdentifier of targetsConfig.groups) {
        // Find group by ID or name
        let group: any = groups[groupIdentifier]
        if (!group) {
          const foundGroup = Object.values(groups).find(g => g.name === groupIdentifier || g.id === groupIdentifier)
          if (!foundGroup) continue
          group = foundGroup
        }
        
        // Convert target IDs to emails
        const groupEmails = group.targetIds
          .map((targetId: string) => allTargets.find((t: any) => t.id === targetId)?.email)
          .filter((email: string | undefined): email is string => email !== undefined)
        emails.push(...groupEmails)
      }
      return [...new Set(emails)] // Remove duplicates
    } else if (targetsConfig.mode === 'individual' && targetsConfig.individual && Array.isArray(targetsConfig.individual)) {
      const targetMap = new Map(allTargets.map((t: any) => [t.id, t.email]))
      const individualEmails: string[] = targetsConfig.individual
        .map((targetId: string) => targetMap.get(targetId))
        .filter((email: string | undefined): email is string => email !== undefined)
      return [...new Set(individualEmails)]
    }

    return []
  }

  /**
   * Transform email content for N8N webhook
   * Supports both legacy format (content.recipients) and new format (_templates array)
   */
  static async transformForN8n(content: any, emailService: EmailService): Promise<any> {
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

        // Get HTML content - use html if available, otherwise build from bodyText
        let html: string
        if (content.html && typeof content.html === 'string' && content.html.trim().length > 0) {
          html = content.html
        } else if (content.bodyText && typeof content.bodyText === 'string' && content.bodyText.trim().length > 0) {
          html = emailService.buildBodyFromStructuredFields({ bodyText: content.bodyText })
        } else {
          throw new Error(`Email content (html or bodyText) is required for template ${templateEntry.templateId}`)
        }

        if (!html || html.trim().length === 0) {
          throw new Error(`Email content (html or bodyText) is required for template ${templateEntry.templateId}`)
        }

        const emailPayload: any = {
          subject: content.subject || 'No Subject',
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

        // Add attachments if present
        if (content.attachments && Array.isArray(content.attachments) && content.attachments.length > 0) {
          emailPayload.attachments = content.attachments
        }

        emails.push(emailPayload)
      }

      // Return array of emails (n8n can handle multiple emails)
      return emails.length === 1 ? emails[0] : { emails }
    }

    // ✅ LEGACY FORMAT: Check if recipients exist and is valid array
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
