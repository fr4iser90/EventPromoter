/**
 * Email Platform Preview Service
 * 
 * Handles rendering of email preview HTML
 * 
 * @module platforms/email/services/previewService
 */

import { EmailService } from './emailService.js'
import { markdownToHtml, isMarkdown } from '../../../utils/markdownRenderer.js'

/**
 * ✅ Helper-Funktion: Extrahiert Content-HTML aus vollständigem Template-HTML
 * 
 * Templates enthalten vollständiges HTML (für E-Mail-Versand).
 * Preview braucht nur Content-HTML (Frontend besitzt die Shell).
 * 
 * @param fullHtml - Vollständiges HTML-Dokument vom Template
 * @returns Content-HTML (nur der Content-Teil, kein DOCTYPE/html/head/body)
 */
export function extractContentFromTemplateHtml(fullHtml: string): string {
  let content = fullHtml
  
  // Remove HTML document structure
  content = content.replace(/<!DOCTYPE[^>]*>/gi, '')
  content = content.replace(/<html[^>]*>/gi, '')
  content = content.replace(/<\/html>/gi, '')
  content = content.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
  content = content.replace(/<body[^>]*>/gi, '')
  content = content.replace(/<\/body>/gi, '')
  content = content.replace(/<meta[^>]*>/gi, '')
  
  // Remove <style> tags
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  
  // Remove inline background/color styles
  content = content.replace(
    /style\s*=\s*["']([^"']*)["']/gi,
    (match, styleContent) => {
      if (!styleContent) return match
      const cleanedStyle = styleContent
        .split(';')
        .map((prop: string) => prop.trim())
        .filter((prop: string) => {
          if (!prop) return false
          const lowerProp = prop.toLowerCase().trim()
          return !lowerProp.startsWith('background') && 
                 !lowerProp.startsWith('color') &&
                 prop.length > 0
        })
        .join('; ')
      return cleanedStyle ? `style="${cleanedStyle}"` : ''
    }
  )
  
  return content.trim()
}

export async function renderEmailPreview(
  service: EmailService,
  options: {
    content: Record<string, any>
    schema: any
    mode?: string
    client?: string
    locale?: string
  }
): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
  const { content, schema, mode = 'desktop', client, locale } = options
  
  // ✅ PREVIEW: Use raw content directly, don't process it (processContentForSave creates HTML for sending, not preview)
  let processedContent = { ...content }
  
  // ✅ If locale is provided and content has a template, re-render template with correct locale
  if (locale && processedContent._templateId) {
    try {
      const { TemplateService } = await import('../../../services/templateService.js')
      const templateModule = await import('../templates/index.js')
      const { renderTemplate } = templateModule
      
      const template = await TemplateService.getTemplate('email', processedContent._templateId)
      if (template && template.template && typeof template.template === 'object') {
        // Convert Template to EmailTemplate format (EmailTemplate is an interface, so we construct it manually)
        // ✅ translations and defaultLocale are on the template object, not in template.template
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
          translations: (template as any).translations, // ✅ translations are on template object, not template.template
          defaultLocale: (template as any).defaultLocale, // ✅ defaultLocale is on template object, not template.template
          createdAt: template.createdAt,
          updatedAt: template.updatedAt
        }
        
        // Extract variables from content (all _var_* fields)
        const variables: Record<string, string> = {}
        for (const [key, value] of Object.entries(processedContent)) {
          if (key.startsWith('_var_')) {
            const varName = key.replace('_var_', '')
            let varValue = String(value || '')
            
            // ✅ FORMATIERUNG: Datum/Zeit mit Target-Locale formatieren
            if (locale && (locale === 'de' || locale === 'es' || locale === 'en')) {
              const { formatDate } = await import('../../../services/parsing/templateVariables.js')
              
              if (varName === 'date' || varName === 'eventDate') {
                // Format date with Target-Locale
                varValue = formatDate(varValue, locale)
              }
              // time bleibt unverändert (bereits 24h Format)
            }
            
            variables[varName] = varValue
          }
        }
        
        // Render template with correct locale
        const rendered = renderTemplate(emailTemplate, variables, locale as 'en' | 'de' | 'es')
        
        // ✅ Extrahiere Content-HTML aus Template-HTML (Backend liefert korrekte Daten)
        const contentHtml = extractContentFromTemplateHtml(rendered.html)
        
        // Update processedContent with re-rendered template
        processedContent = {
          ...processedContent,
          subject: rendered.subject,
          bodyText: contentHtml // ✅ Bereits bereinigt - nur Content-HTML
        }
        
        console.log('[Preview] Re-rendered template with locale:', locale, 'templateId:', processedContent._templateId)
      }
    } catch (error) {
      console.warn('[Preview] Failed to re-render template with locale, using original content:', error)
      // Continue with original content if re-rendering fails
    }
  }
  
  // Get mode dimensions
  const selectedMode = schema.modes?.find((m: any) => m.id === mode) || schema.modes?.[0]
  const width = selectedMode?.width || 600
  const height = selectedMode?.height || 800
  
  const fontFamily = schema.styling?.fontFamily || 'Arial, sans-serif'
  
  // ✅ Nur Content-HTML (kein vollständiges Dokument)
  // Frontend besitzt die Preview-Shell
  let contentHtml = `
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
    contentHtml += `    <div class="email-header">
      <div class="email-subject">${escapeHtml(processedContent.subject)}</div>
    </div>
`
  }

  // Render body slot
  contentHtml += `    <div class="email-body">
`
  
  // Hero slot (headerImage)
  if (processedContent.headerImage) {
    let imageUrl = processedContent.headerImage
    
    // If relative URL (/api/files/...), convert to base64 for preview
    // This ensures images work in iframe preview without external requests
    if (imageUrl.startsWith('/api/files/') || imageUrl.startsWith('/files/')) {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const { fileURLToPath } = await import('url')
        const { dirname } = await import('path')
        
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = dirname(__filename)
        
        // Parse /api/files/{eventId}/{filename} or /files/{eventId}/{filename}
        const cleanUrl = imageUrl.startsWith('/api/files/') 
          ? imageUrl.replace('/api/files/', '') 
          : imageUrl.replace('/files/', '')
        const parts = cleanUrl.split('/')
        if (parts.length >= 2) {
          const eventId = parts[0]
          const filename = parts.slice(1).join('/')
          const filePath = path.join(process.cwd(), 'events', eventId, 'files', filename)
          
          if (fs.existsSync(filePath)) {
            const imageBuffer = fs.readFileSync(filePath)
            const base64 = imageBuffer.toString('base64')
            
            // Detect MIME type from file extension or buffer
            const ext = path.extname(filename).toLowerCase()
            let mimeType = 'image/jpeg'
            if (ext === '.png') mimeType = 'image/png'
            else if (ext === '.gif') mimeType = 'image/gif'
            else if (ext === '.webp') mimeType = 'image/webp'
            else if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) mimeType = 'image/jpeg'
            else if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) mimeType = 'image/png'
            
            imageUrl = `data:${mimeType};base64,${base64}`
          }
        }
      } catch (error) {
        console.warn('Failed to load image for preview, using original URL:', error)
        // Fallback: Try to use BASE_URL from environment
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`
        imageUrl = `${baseUrl}${imageUrl}`
      }
    } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      // Relative URL without /files/ prefix - try BASE_URL
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`
      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    }
    
    contentHtml += `      <img src="${imageUrl}" alt="Event Image" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
`
  }

  // Body content: Render from bodyText (structured field)
  // bodyText can be plain text, Markdown, OR HTML fragment (from templates - already extracted)
  if (processedContent.bodyText) {
    const bodyText = processedContent.bodyText
    if (typeof bodyText === 'string') {
      // Check if it's HTML (contains tags)
      if (bodyText.includes('<') && bodyText.includes('>')) {
        // ✅ HTML fragment - verwende Helper-Funktion für Content-Extraktion
        // Backend liefert korrekte Daten (nur Content-HTML)
        const cleanedBodyText = extractContentFromTemplateHtml(bodyText)
        
        contentHtml += `      ${cleanedBodyText}
`
      } else if (isMarkdown(bodyText)) {
        // Markdown - convert to HTML
        const markdownHtml = markdownToHtml(bodyText)
        contentHtml += `      ${markdownHtml}
`
      } else {
        // Plain text - convert to HTML with line breaks
        const bodyHtml = escapeHtml(bodyText)
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>')
        contentHtml += `      <p>${bodyHtml}</p>
`
      }
    }
  }

  // CTA Button
  if (processedContent.ctaButtonText && processedContent.ctaButtonLink) {
    contentHtml += `      <div style="text-align: center;">
      <a href="${processedContent.ctaButtonLink}" class="cta-button">${escapeHtml(processedContent.ctaButtonText)}</a>
    </div>
`
  }

  contentHtml += `    </div>
`

  // Footer slot
  if (processedContent.footerText) {
    const footerHtml = escapeHtml(processedContent.footerText)
      .replace(/\n/g, '<br>')
    contentHtml += `    <div class="email-footer">
      ${footerHtml}
    </div>
`
  }

  contentHtml += `  </div>
`

  // ✅ Strukturelles CSS (Layout, keine Farben - Theme kommt vom Frontend)
  const structuralCss = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    .email-container {
      max-width: ${width}px;
      width: 100%;
      margin: 0 auto;
      background: var(--preview-container-bg);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    img {
      max-width: 100% !important;
      height: auto !important;
      display: block;
    }
    .email-header {
      padding: 20px;
      border-bottom: 1px solid var(--preview-divider);
      background: var(--preview-container-bg);
    }
    .email-subject {
      font-size: 18px;
      font-weight: bold;
      color: var(--preview-text);
      margin-bottom: 8px;
    }
    .email-body {
      padding: 20px;
      color: var(--preview-text);
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
      color: var(--preview-link);
      text-decoration: none;
    }
    .email-body a:hover {
      text-decoration: underline;
    }
    .email-footer {
      padding: 20px;
      border-top: 1px solid var(--preview-divider);
      font-size: 12px;
      color: var(--preview-text-secondary);
      background: var(--preview-container-bg);
    }
    .cta-button {
      display: inline-block;
      background: var(--preview-link);
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      text-align: center;
    }
  `

  return {
    html: contentHtml, // ✅ Nur Content-HTML, kein vollständiges Dokument
    css: structuralCss, // ✅ Strukturelles CSS mit CSS Variables
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
      individual?: string[]
      templateLocale?: string
    }
    schema: any
    mode?: string
    locale?: string
  }
): Promise<Array<{
  group?: string
  templateId?: string
  targets?: string[]
  html: string
  css?: string
  dimensions?: { width: number; height: number }
}>> {
  const { content, recipients, schema, mode = 'desktop' } = options
  const previews: Array<{
    group?: string
    templateId?: string
    targets?: string[]
    html: string
    css?: string
    dimensions?: { width: number; height: number }
  }> = []

  // Get recipient data (using new TargetService)
  const { EmailTargetService } = await import('./targetService.js')
  const targetService = new EmailTargetService()
  const targets = await targetService.getTargets()
  const groups = await targetService.getGroups()
  // Generic: use baseField instead of hardcoded .email
  const allRecipients = targets.map((t: any) => {
    const baseField = t.targetType ? targetService.getBaseField(t.targetType) : targetService.getBaseField()
    return t[baseField]
  })

  // Import template service
  const { TemplateService } = await import('../../../services/templateService.js')

  if (!recipients.mode) {
    return previews
  }

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

    // ✅ Use ONLY recipients.templateLocale if set and valid (user's explicit choice) - NO FALLBACKS
    const templateLocale = (options.recipients?.templateLocale && ['en', 'de', 'es'].includes(options.recipients.templateLocale))
      ? options.recipients.templateLocale
      : undefined
    
    console.log('🔍 PreviewService: Using locale:', {
      templateLocale: templateLocale
    })

    const preview = await renderEmailPreview(service, {
      content: previewContent,
      schema,
      mode,
      locale: templateLocale
    })

    previews.push({
      targets: allRecipients,
      templateId,
      html: preview.html,
      css: preview.css,
      dimensions: preview.dimensions
    })
  } else if (recipients.mode === 'groups' && recipients.groups && recipients.groups.length > 0) {
    // Preview for each group with its template
    for (const groupIdentifier of recipients.groups) {
      // Find group by ID or name
      const group = groups.find(g => g.name === groupIdentifier || g.id === groupIdentifier)
      if (!group) continue

      // Get emails for this group (generic - uses baseField)
      const targetMap = new Map(targets.map((t: any) => {
        const baseField = t.targetType ? targetService.getBaseField(t.targetType) : targetService.getBaseField()
        return [t.id, t[baseField]]
      }))
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

      // ✅ Use ONLY recipients.templateLocale if set and valid (user's explicit choice) - NO FALLBACKS
      const templateLocale = (options.recipients?.templateLocale && ['en', 'de', 'es'].includes(options.recipients.templateLocale))
        ? options.recipients.templateLocale
        : undefined

      const preview = await renderEmailPreview(service, {
        content: previewContent,
        schema,
        mode,
        locale: templateLocale
      })

      previews.push({
        group: group.name,
        templateId,
        targets: groupEmails,
        html: preview.html,
        css: preview.css,
        dimensions: preview.dimensions
      })
    }
  } else if (recipients.mode === 'individual' && recipients.individual && recipients.individual.length > 0) {
    // Generic: use baseField instead of hardcoded .email
    const targetMap = new Map(targets.map((t: any) => {
      const baseField = t.targetType ? targetService.getBaseField(t.targetType) : targetService.getBaseField()
      return [t.id, t[baseField]]
    }))
    const individualEmails = recipients.individual
      .map((targetId: string) => targetMap.get(targetId))
      .filter((email: string | undefined): email is string => email !== undefined)
    
    if (individualEmails.length === 0) {
      return previews
    }
    
    const templateId = recipients.defaultTemplate
    let previewContent = { ...content }
    
    if (templateId) {
      const template = await TemplateService.getTemplate('email', templateId)
      if (template) {
        previewContent = { ...content, _templateId: templateId }
      }
    }

    // ✅ Use ONLY recipients.templateLocale if set and valid (user's explicit choice) - NO FALLBACKS
    const templateLocale = (options.recipients?.templateLocale && ['en', 'de', 'es'].includes(options.recipients.templateLocale))
      ? options.recipients.templateLocale
      : undefined
    
    console.log('🔍 PreviewService: Using locale:', {
      templateLocale: templateLocale
    })

    const preview = await renderEmailPreview(service, {
      content: previewContent,
      schema,
      mode,
      locale: templateLocale
    })

    previews.push({
      targets: individualEmails,
      templateId,
      html: preview.html,
      css: preview.css,
      dimensions: preview.dimensions
    })
  }

  return previews
}
