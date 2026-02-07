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
  cid?: string; // Content-ID for embedded images
}

/**
 * API Publisher for Email
 * 
 * Uses SMTP to send emails directly.
 */
export class EmailApiPublisher implements EmailPublisher {
  private async getCredentials(): Promise<any> {
    // Load from platform settings (uses schema field names: host, port, username, password)
    const config = await ConfigService.getPlatformSettings('email') || {}
    return {
      host: config.host || process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
      port: config.port || parseInt(process.env.EMAIL_SMTP_PORT || '587'),
      username: config.username || process.env.EMAIL_SMTP_USER,
      password: config.password || process.env.EMAIL_SMTP_PASSWORD,
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

      if (!credentials.username || !credentials.password || !credentials.fromEmail) {
        return {
          success: false,
          error: 'Email SMTP credentials not configured (need username, password, fromEmail)'
        }
      }

      // 1. Resolve global attachments
      const globalFileIds = content.globalFiles || []
      const globalAttachments = this.resolveAttachments(globalFileIds, files, 'global')

      // 2. Handle multiple runs (templates) - _templates format is required
      const runs = content._templates || []
      
      if (runs.length === 0) {
        return { 
          success: false, 
          error: 'Email content must use _templates format with targets configuration. Legacy recipients format is no longer supported.' 
        }
      }

      // Handle multiple runs
      const results: PostResult[] = []
      for (const run of runs) {
        const recipients = await this.extractRecipients(run.targets)
        if (recipients.length === 0) {
          console.warn(`No recipients found for template run`)
          continue
        }

        // ✅ DEKLARATIV: Template MUSS vorhanden sein und re-rendert werden (KEINE FALLBACKS)
        if (!run.templateId) {
          return {
            success: false,
            error: `Template ID is required for template run. No fallbacks allowed.`
          }
        }

        const targetLocale = run.targets?.templateLocale
        if (!targetLocale || !['en', 'de', 'es'].includes(targetLocale)) {
          return {
            success: false,
            error: `Valid target locale (en/de/es) is required for template ${run.templateId}. No fallbacks allowed.`
          }
        }

        // Re-render template with Target-Locale (MUSS funktionieren, sonst Fehler)
        const { TemplateService } = await import('../../../services/templateService.js')
        const templateModule = await import('../templates/index.js')
        const { renderTemplate } = templateModule
        const { formatDate } = await import('../../../services/parsing/templateVariables.js')
        
        const template = await TemplateService.getTemplate('email', run.templateId)
        if (!template || !template.template || typeof template.template !== 'object') {
          return {
            success: false,
            error: `Template ${run.templateId} not found or invalid. No fallbacks allowed.`
          }
        }

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
        const previewService = await import('../services/previewService.js')
        const html = previewService.extractContentFromTemplateHtml(rendered.html)
        const subject = rendered.subject

        if (!html || html.trim().length === 0) {
          return {
            success: false,
            error: `Template ${run.templateId} rendered empty HTML. No fallbacks allowed.`
          }
        }

        if (!subject || subject.trim().length === 0) {
          return {
            success: false,
            error: `Template ${run.templateId} rendered empty subject. No fallbacks allowed.`
          }
        }

        const text = this.htmlToText(html)

        const specificFileIds = run.specificFiles || []
        const specificAttachments = this.resolveAttachments(specificFileIds, files, 'specific')
        const allAttachments = this.mergeAttachments(globalAttachments, specificAttachments)

        // Process HTML and attachments for CID embedding
        const { processedHtml, processedAttachments } = this.processEmbeddedImages(html, allAttachments)

        // Extract CC and BCC from content (same as n8n)
        const cc = content.cc && Array.isArray(content.cc) && content.cc.length > 0 
          ? content.cc.join(', ') 
          : undefined
        const bcc = content.bcc && Array.isArray(content.bcc) && content.bcc.length > 0 
          ? content.bcc.join(', ') 
          : undefined

        const result = await this.sendWithNodemailer(credentials, recipients, subject, processedHtml, text, processedAttachments, cc, bcc)
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
  private resolveAttachments(fileIds: string[] | any[], availableFiles: UploadedFile[], scope: 'global' | 'specific'): ResolvedAttachment[] {
    const resolved: ResolvedAttachment[] = []

    for (const item of fileIds) {
      // Handle both string IDs and file objects
      let id: string
      if (typeof item === 'string') {
        id = item
      } else if (item && typeof item === 'object') {
        // Extract ID from object (could be id, filename, or name property)
        id = item.id || item.filename || item.name || String(item)
      } else {
        console.warn(`Invalid file ID format: ${item}`)
        continue
      }

      const file = availableFiles.find(f => f.id === id || f.filename === id || f.name === id)
      if (!file) {
        console.warn(`File not found for ID: ${id}`)
        continue
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
   * Processes HTML and attachments for CID embedding
   * - Finds image URLs in HTML
   * - Replaces URLs with CID references
   * - Sets Content-ID for matching image attachments
   */
  private processEmbeddedImages(
    html: string,
    attachments: ResolvedAttachment[]
  ): { processedHtml: string; processedAttachments: ResolvedAttachment[] } {
    // Helper function to extract path from URL (normalizes localhost vs IP differences)
    const getUrlPath = (url: string): string => {
      try {
        const urlObj = new URL(url)
        return urlObj.pathname + urlObj.search // path + query params
      } catch (e) {
        return url
      }
    }

    // Check if attachment is an image
    const isImage = (contentType: string): boolean => {
      return /^image\/(jpeg|jpg|png|gif|webp|bmp)$/i.test(contentType)
    }

    // Build attachment map by normalized path and filename
    const attachmentMap = new Map<string, ResolvedAttachment>()
    attachments.forEach(att => {
      // Store by filename (for CID matching)
      attachmentMap.set(att.filename, att)
    })

    // Extract all image URLs from HTML
    const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    const imageUrlMatches: Array<{ url: string; normalizedPath: string; filename: string }> = []
    let match

    while ((match = imageRegex.exec(html)) !== null) {
      const imageUrl = match[1]
      // Only process if it's a URL (not already CID or data URI)
      if (imageUrl && !imageUrl.startsWith('cid:') && !imageUrl.startsWith('data:')) {
        const normalizedPath = getUrlPath(imageUrl)
        const urlFilename = imageUrl.split('/').pop()?.split('?')[0] || ''
        imageUrlMatches.push({
          url: imageUrl,
          normalizedPath: normalizedPath,
          filename: urlFilename
        })
      }
    }

    // Replace image URLs in HTML with CID references
    let processedHtml = html
    const matchedImageFilenames = new Set<string>()

    // Process each image URL match
    for (const imageMatch of imageUrlMatches) {
      // Try to find attachment by filename
      const attachment = attachmentMap.get(imageMatch.filename)
      
      if (attachment && isImage(attachment.contentType)) {
        // Replace URL with CID reference using regex (handles multiple occurrences)
        const escapedUrl = imageMatch.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(
          `(<img[^>]+src=["'])${escapedUrl}(["'][^>]*>)`,
          'gi'
        )
        processedHtml = processedHtml.replace(regex, `$1cid:${attachment.filename}$2`)
        matchedImageFilenames.add(attachment.filename)
      }
    }

    // Process attachments: set Content-ID for matched images
    const processedAttachments = attachments.map(att => {
      if (isImage(att.contentType) && matchedImageFilenames.has(att.filename)) {
        // Return attachment with Content-ID metadata
        return {
          ...att,
          cid: att.filename // Content-ID for embedded images
        }
      }
      return att
    })

    return { processedHtml, processedAttachments }
  }

  /**
   * Extracts email addresses from targets object
   * Uses EmailTargetService to resolve target IDs to email addresses (same as n8n)
   */
  private async extractRecipients(targets: any): Promise<string[]> {
    if (!targets) return []

    const { EmailTargetService } = await import('../services/targetService.js')
    const targetService = new EmailTargetService()
    const allTargets = await targetService.getTargets()
    const groups = await targetService.getGroups()
    const allRecipients = allTargets.map((t: any) => t.email)

    if (targets.mode === 'all') {
      return allRecipients
    } else if (targets.mode === 'groups' && targets.groups && Array.isArray(targets.groups)) {
      // Collect all emails from selected groups
      const emails: string[] = []
      for (const groupIdentifier of targets.groups) {
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
    } else if (targets.mode === 'individual' && targets.individual && Array.isArray(targets.individual)) {
      const targetMap = new Map(allTargets.map((t: any) => [t.id, t.email]))
      const individualEmails: string[] = targets.individual
        .map((targetId: string) => targetMap.get(targetId))
        .filter((email: string | undefined): email is string => email !== undefined)
      return [...new Set(individualEmails)]
    }

    return []
  }

  private async sendWithNodemailer(
    credentials: any,
    recipients: string[],
    subject: string,
    html: string,
    text: string,
    attachments: ResolvedAttachment[],
    cc?: string,
    bcc?: string
  ): Promise<PostResult> {
    // Dynamic import to avoid requiring nodemailer if not installed
    // @ts-ignore - nodemailer is optional dependency
    const nodemailer = await import('nodemailer')

    const transporter = nodemailer.createTransport({
      host: credentials.host,
      port: credentials.port,
      secure: credentials.port === 465,
      auth: {
        user: credentials.username,
        pass: credentials.password
      }
    })

    const nodemailerAttachments = attachments.map(file => {
      const attachment: any = {
        filename: file.filename,
        content: file.buffer,
        contentType: file.contentType
      }
      
      // Set Content-ID for embedded images (CID)
      if (file.cid) {
        attachment.cid = file.cid
      }
      
      return attachment
    });

    const mailOptions: any = {
      from: `"${credentials.fromName}" <${credentials.fromEmail}>`,
      to: recipients.join(', '),
      subject: subject,
      text: text,
      html: html,
      attachments: nodemailerAttachments.length > 0 ? nodemailerAttachments : undefined
    }

    // Add CC and BCC if present (same as n8n)
    if (cc) {
      mailOptions.cc = cc
    }
    if (bcc) {
      mailOptions.bcc = bcc
    }

    const result = await transporter.sendMail(mailOptions)

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
