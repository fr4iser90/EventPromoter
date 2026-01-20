/**
 * Email Platform Preview Service
 * 
 * Handles rendering of email preview HTML
 * 
 * @module platforms/email/services/previewService
 */

import { EmailService } from './emailService.js'
import { markdownToHtml, isMarkdown } from '../../../utils/markdownRenderer.js'

export async function renderEmailPreview(
  service: EmailService,
  options: {
    content: Record<string, any>
    schema: any
    mode?: string
    client?: string
    darkMode?: boolean
  }
): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
  const { content, schema, mode = 'desktop', client, darkMode = false } = options
  
  // ✅ PREVIEW: Use raw content directly, don't process it (processContentForSave creates HTML for sending, not preview)
  const processedContent = content
  
  // Get mode dimensions
  const selectedMode = schema.modes?.find((m: any) => m.id === mode) || schema.modes?.[0]
  const width = selectedMode?.width || 600
  const height = selectedMode?.height || 800
  
  // Resolve styling tokens
  const bgColor = darkMode ? '#1a1a1a' : '#f5f5f5'
  const textColor = darkMode ? '#ffffff' : '#000000'
  const containerBg = darkMode ? '#2a2a2a' : '#ffffff'
  const fontFamily = schema.styling?.fontFamily || 'Arial, sans-serif'
  
  // Build email-like HTML (Gmail/Outlook style)
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ${fontFamily};
      background-color: ${bgColor};
      color: ${textColor};
      padding: 20px;
      line-height: 1.6;
    }
    .email-container {
      max-width: ${width}px;
      margin: 0 auto;
      background: ${containerBg};
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .email-header {
      padding: 20px;
      border-bottom: 1px solid ${darkMode ? '#444' : '#eee'};
      background: ${containerBg};
    }
    .email-subject {
      font-size: 18px;
      font-weight: bold;
      color: ${textColor};
      margin-bottom: 8px;
    }
    .email-body {
      padding: 20px;
      color: ${textColor};
    }
    .email-body img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px 0;
      border-radius: 4px;
    }
    .email-body p {
      margin-bottom: 16px;
    }
    .email-body a {
      color: ${darkMode ? '#4a9eff' : '#007bff'};
      text-decoration: none;
    }
    .email-body a:hover {
      text-decoration: underline;
    }
    .email-footer {
      padding: 20px;
      border-top: 1px solid ${darkMode ? '#444' : '#eee'};
      font-size: 12px;
      color: ${darkMode ? '#aaa' : '#666'};
      background: ${containerBg};
    }
    .cta-button {
      display: inline-block;
      background: ${darkMode ? '#4a9eff' : '#007bff'};
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
`

  // Helper function to escape HTML
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  // Render header slot (subject)
  if (processedContent.subject) {
    html += `    <div class="email-header">
      <div class="email-subject">${escapeHtml(processedContent.subject)}</div>
    </div>
`
  }

  // Render body slot
  html += `    <div class="email-body">
`
  
  // Hero slot (headerImage)
  if (processedContent.headerImage) {
    const imageUrl = processedContent.headerImage.startsWith('http') 
      ? processedContent.headerImage 
      : processedContent.headerImage.startsWith('/')
        ? `http://localhost:4000${processedContent.headerImage}`
        : processedContent.headerImage
    html += `      <img src="${imageUrl}" alt="Event Image" />
`
  }

  // Body content: Render from bodyText (structured field)
  // bodyText can be plain text, Markdown, OR HTML fragment (from templates - already extracted)
  if (processedContent.bodyText) {
    const bodyText = processedContent.bodyText
    if (typeof bodyText === 'string') {
      // Check if it's HTML (contains tags)
      if (bodyText.includes('<') && bodyText.includes('>')) {
        // HTML fragment - use directly (already extracted from template, no style tags)
        html += `      ${bodyText}
`
      } else if (isMarkdown(bodyText)) {
        // Markdown - convert to HTML
        const markdownHtml = markdownToHtml(bodyText)
        html += `      ${markdownHtml}
`
      } else {
        // Plain text - convert to HTML with line breaks
        const bodyHtml = escapeHtml(bodyText)
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>')
        html += `      <p>${bodyHtml}</p>
`
      }
    }
  }

  // CTA Button
  if (processedContent.ctaButtonText && processedContent.ctaButtonLink) {
    html += `      <div style="text-align: center;">
      <a href="${processedContent.ctaButtonLink}" class="cta-button">${escapeHtml(processedContent.ctaButtonText)}</a>
    </div>
`
  }

  html += `    </div>
`

  // Footer slot
  if (processedContent.footerText) {
    const footerHtml = escapeHtml(processedContent.footerText)
      .replace(/\n/g, '<br>')
    html += `    <div class="email-footer">
      ${footerHtml}
    </div>
`
  }

  html += `  </div>
</body>
</html>`

  return {
    html,
    dimensions: {
      width,
      height
    }
  }
}

/**
 * Render multiple previews for different groups/templates
 * 
 * @param service - EmailService instance
 * @param options - Render options with recipients configuration
 * @returns Array of previews, one per group/template combination
 */
export async function renderMultiPreview(
  service: EmailService,
  options: {
    content: Record<string, any>
    recipients: {
      mode?: 'all' | 'groups' | 'individual'
      groups?: string[]
      templateMapping?: Record<string, string>
      defaultTemplate?: string
      individuals?: string[]
    }
    schema: any
    mode?: string
    darkMode?: boolean
  }
): Promise<Array<{
  group?: string
  templateId?: string
  recipients: string[]
  html: string
  dimensions?: { width: number; height: number }
}>> {
  const { content, recipients, schema, mode = 'desktop', darkMode = false } = options
  const previews: Array<{
    group?: string
    templateId?: string
    recipients: string[]
    html: string
    dimensions?: { width: number; height: number }
  }> = []

  // Get recipient data (using new TargetService)
  const { EmailTargetService } = await import('./targetService.js')
  const targetService = new EmailTargetService()
  const targets = await targetService.getTargets()
  const groups = await targetService.getGroups()
  const allRecipients = targets.map(t => t.email)

  // Import template service
  const { TemplateService } = await import('../../../services/templateService.js')

  if (recipients.mode === 'all') {
    // Single preview for all recipients
    const templateId = recipients.defaultTemplate
    let previewContent = { ...content }
    
    if (templateId) {
      const template = await TemplateService.getTemplate('email', templateId)
      if (template) {
        // Apply template (simplified - actual template application should use template system)
        previewContent = { ...content, _templateId: templateId }
      }
    }

    const preview = await renderEmailPreview(service, {
      content: previewContent,
      schema,
      mode,
      darkMode
    })

    previews.push({
      recipients: allRecipients,
      templateId,
      html: preview.html,
      dimensions: preview.dimensions
    })
  } else if (recipients.mode === 'groups' && recipients.groups && recipients.groups.length > 0) {
    // Preview for each group with its template
    for (const groupIdentifier of recipients.groups) {
      // Find group by ID or name
      let group: any = groups[groupIdentifier]
      if (!group) {
        const foundGroup = Object.values(groups).find(g => g.name === groupIdentifier || g.id === groupIdentifier)
        if (!foundGroup) continue
        group = foundGroup
      }

      // Get emails for this group
      const targetMap = new Map(targets.map(t => [t.id, t.email]))
      const groupEmails = group.targetIds
        .map((targetId: string) => targetMap.get(targetId))
        .filter((email: string | undefined): email is string => email !== undefined)
      
      if (groupEmails.length === 0) continue

      // Get template for this group (support both group ID and group name in templateMapping)
      const templateId = recipients.templateMapping?.[groupIdentifier] || 
                        recipients.templateMapping?.[group.name] || 
                        recipients.templateMapping?.[group.id] ||
                        recipients.defaultTemplate
      let previewContent = { ...content }
      
      if (templateId) {
        const template = await TemplateService.getTemplate('email', templateId)
        if (template) {
          previewContent = { ...content, _templateId: templateId }
        }
      }

      const preview = await renderEmailPreview(service, {
        content: previewContent,
        schema,
        mode,
        darkMode
      })

      previews.push({
        group: group.name,
        templateId,
        recipients: groupEmails,
        html: preview.html,
        dimensions: preview.dimensions
      })
    }
  } else if (recipients.mode === 'individual' && recipients.individuals && recipients.individuals.length > 0) {
    // Single preview for individuals
    const templateId = recipients.defaultTemplate
    let previewContent = { ...content }
    
    if (templateId) {
      const template = await TemplateService.getTemplate('email', templateId)
      if (template) {
        previewContent = { ...content, _templateId: templateId }
      }
    }

    const preview = await renderEmailPreview(service, {
      content: previewContent,
      schema,
      mode,
      darkMode
    })

    previews.push({
      recipients: recipients.individuals,
      templateId,
      html: preview.html,
      dimensions: preview.dimensions
    })
  }

  return previews
}
