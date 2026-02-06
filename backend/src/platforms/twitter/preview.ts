/**
 * Twitter Platform Preview Renderer
 * 
 * Handles rendering of Twitter preview HTML with Markdown support
 * 
 * @module platforms/twitter/preview
 */

import { markdownToHtml, isMarkdown } from '../../utils/markdownRenderer.js'

export async function renderTwitterPreview(options: {
  content: Record<string, any>
  schema: any
  mode?: string
  client?: string
}): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
  const { content, schema, mode = 'mobile' } = options
  
  const selectedMode = schema.modes?.find((m: any) => m.id === mode) || schema.modes?.[0]
  const width = selectedMode?.width || 375
  const height = selectedMode?.height || 667
  
  const fontFamily = schema.styling?.fontFamily || 'TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  
  // Process text content - check if it's Markdown
  let textContent = ''
  if (content.text) {
    if (isMarkdown(content.text)) {
      // Render Markdown to HTML (Twitter supports basic formatting)
      textContent = markdownToHtml(content.text)
    } else {
      // Plain text - preserve line breaks
      textContent = escapeHtml(content.text).replace(/\n/g, '<br>')
    }
  }
  
  // ✅ Nur Content-HTML (kein vollständiges Dokument)
  // Frontend besitzt die Preview-Shell
  let contentHtml = `
  <div class="tweet-container">
    ${textContent ? `<div class="tweet-content">${textContent}</div>` : ''}
    ${content.image ? `<div class="tweet-media"><img src="${escapeHtml(content.image)}" alt="Tweet media" /></div>` : ''}
  </div>
`
  
  // ✅ Strukturelles CSS (Theme via CSS Variables vom Frontend)
  const structuralCss = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    .tweet-container {
      max-width: ${width}px;
      margin: 0 auto;
      background: var(--preview-container-bg);
      border: 1px solid var(--preview-divider);
      border-radius: 16px;
      padding: 12px;
    }
    .tweet-content {
      font-size: 15px;
      line-height: 20px;
      word-wrap: break-word;
      margin-bottom: 12px;
      color: var(--preview-text);
      font-family: ${fontFamily};
    }
    .tweet-content p {
      margin-bottom: 4px;
    }
    .tweet-content p:last-child {
      margin-bottom: 0;
    }
    .tweet-content strong {
      font-weight: 700;
    }
    .tweet-content em {
      font-style: italic;
    }
    .tweet-content a {
      color: var(--preview-link);
      text-decoration: none;
    }
    .tweet-content a:hover {
      text-decoration: underline;
    }
    .tweet-media {
      width: 100%;
      border-radius: 12px;
      margin-top: 12px;
      overflow: hidden;
    }
    .tweet-media img {
      width: 100%;
      height: auto;
      display: block;
    }
  `

  return {
    html: contentHtml,
    css: structuralCss,
    dimensions: { width, height }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
