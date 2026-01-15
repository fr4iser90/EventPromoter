/**
 * Email Platform Preview Renderer
 * 
 * Handles rendering of email preview HTML
 * 
 * @module platforms/email/preview
 */

import { EmailService } from './service.js'

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
  // bodyText can be plain text OR HTML fragment (from templates - already extracted)
  if (processedContent.bodyText) {
    const bodyText = processedContent.bodyText
    // Check if it's HTML (contains tags) or plain text
    if (typeof bodyText === 'string' && bodyText.includes('<') && bodyText.includes('>')) {
      // HTML fragment - use directly (already extracted from template, no style tags)
      html += `      ${bodyText}
`
    } else {
      // Plain text - convert to HTML
      const bodyHtml = escapeHtml(bodyText)
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
      html += `      <p>${bodyHtml}</p>
`
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
