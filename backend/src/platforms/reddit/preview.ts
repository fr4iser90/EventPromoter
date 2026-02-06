/**
 * Reddit Platform Preview Renderer
 * 
 * Handles rendering of Reddit preview HTML with Markdown support
 * 
 * @module platforms/reddit/preview
 */

import { markdownToHtml, isMarkdown } from '../../utils/markdownRenderer.js'

export async function renderRedditPreview(options: {
  content: Record<string, any>
  schema: any
  mode?: string
  client?: string
}): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
  const { content, schema, mode = 'desktop' } = options
  
  const selectedMode = schema.modes?.find((m: any) => m.id === mode) || schema.modes?.[0]
  const width = selectedMode?.width || 700
  const height = selectedMode?.height || 600
  
  const fontFamily = schema.styling?.fontFamily || 'IBMPlexSans, Arial, sans-serif'
  
  // Process text content - check if it's Markdown
  let textContent = ''
  if (content.text) {
    if (isMarkdown(content.text)) {
      // Render Markdown to HTML
      textContent = markdownToHtml(content.text)
    } else {
      // Plain text - preserve line breaks
      textContent = escapeHtml(content.text).replace(/\n/g, '<br>')
    }
  }

  // Process title - simple text, no Markdown
  const titleContent = content.title ? escapeHtml(content.title) : ''

  // Process link
  let linkContent = ''
  if (content.link) {
    const linkUrl = content.link.startsWith('http') ? content.link : `https://${content.link}`
    linkContent = `<a href="${escapeHtml(linkUrl)}" class="post-link" target="_blank" rel="noopener noreferrer">${escapeHtml(content.link)}</a>`
  }
  
  // ✅ Nur Content-HTML (kein vollständiges Dokument)
  // Frontend besitzt die Preview-Shell
  let contentHtml = `
  <div class="post-container">
    ${titleContent ? `<div class="post-title">${titleContent}</div>` : ''}
    ${textContent ? `<div class="post-content">${textContent}</div>` : ''}
    ${content.image ? `<div class="post-media"><img src="${escapeHtml(content.image)}" alt="Post media" /></div>` : ''}
    ${linkContent ? `<div class="post-content">${linkContent}</div>` : ''}
  </div>
`
  
  // ✅ Strukturelles CSS (Theme via CSS Variables vom Frontend)
  const structuralCss = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    .post-container {
      max-width: ${width}px;
      margin: 0 auto;
      background: var(--preview-container-bg);
      border: 1px solid var(--preview-divider);
      border-radius: 4px;
      padding: 12px;
    }
    .post-title {
      font-size: 18px;
      font-weight: 500;
      line-height: 22px;
      margin-bottom: 8px;
      color: var(--preview-text);
      font-family: ${fontFamily};
    }
    .post-content {
      font-size: 14px;
      line-height: 21px;
      margin-bottom: 12px;
      word-wrap: break-word;
      color: var(--preview-text);
      font-family: ${fontFamily};
    }
    .post-content p {
      margin-bottom: 8px;
    }
    .post-content p:last-child {
      margin-bottom: 0;
    }
    .post-content strong {
      font-weight: 600;
    }
    .post-content em {
      font-style: italic;
    }
    .post-content code {
      background-color: var(--preview-container-bg);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }
    .post-content pre {
      background-color: var(--preview-container-bg);
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 8px 0;
    }
    .post-content pre code {
      background: none;
      padding: 0;
    }
    .post-content ul,
    .post-content ol {
      margin: 8px 0;
      padding-left: 24px;
    }
    .post-content li {
      margin: 4px 0;
    }
    .post-content h1,
    .post-content h2,
    .post-content h3 {
      margin: 12px 0 8px 0;
      font-weight: 600;
    }
    .post-content h1 {
      font-size: 20px;
    }
    .post-content h2 {
      font-size: 18px;
    }
    .post-content h3 {
      font-size: 16px;
    }
    .post-content a {
      color: var(--preview-link);
      text-decoration: none;
    }
    .post-content a:hover {
      text-decoration: underline;
    }
    .post-media {
      width: 100%;
      border-radius: 4px;
      margin-top: 12px;
      overflow: hidden;
    }
    .post-media img {
      width: 100%;
      height: auto;
      display: block;
    }
    .post-link {
      color: var(--preview-link);
      text-decoration: none;
    }
    .post-link:hover {
      text-decoration: underline;
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
