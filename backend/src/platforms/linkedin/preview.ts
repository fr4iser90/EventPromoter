/**
 * LinkedIn Platform Preview Renderer
 * 
 * Handles rendering of LinkedIn preview HTML with Markdown support
 * 
 * @module platforms/linkedin/preview
 */

import { markdownToHtml, isMarkdown } from '../../utils/markdownRenderer.js'

export async function renderLinkedInPreview(options: {
  content: Record<string, any>
  schema: any
  mode?: string
  client?: string
  darkMode?: boolean
}): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
  const { content, schema, mode = 'desktop', darkMode = false } = options
  
  const selectedMode = schema.modes?.find((m: any) => m.id === mode) || schema.modes?.[0]
  const width = selectedMode?.width || 700
  const height = selectedMode?.height || 600
  
  const bgColor = darkMode ? '#000000' : '#f3f2ef'
  const cardBg = darkMode ? '#1d1d1d' : '#ffffff'
  const textColor = darkMode ? '#e9ecef' : '#000000'
  const fontFamily = schema.styling?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  
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

  // Process link
  let linkContent = ''
  if (content.link) {
    const linkUrl = content.link.startsWith('http') ? content.link : `https://${content.link}`
    linkContent = `<a href="${escapeHtml(linkUrl)}" class="post-link" target="_blank" rel="noopener noreferrer">${escapeHtml(content.link)}</a>`
  }
  
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
      padding: 16px;
      line-height: 1.5;
    }
    .post-container {
      max-width: ${width}px;
      margin: 0 auto;
      background: ${cardBg};
      border: 1px solid ${darkMode ? '#333' : '#e0e0e0'};
      border-radius: 8px;
      padding: 16px;
    }
    .post-content {
      font-size: 14px;
      line-height: 20px;
      margin-bottom: 12px;
      word-wrap: break-word;
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
    .post-content ul,
    .post-content ol {
      margin: 8px 0;
      padding-left: 24px;
    }
    .post-content li {
      margin: 4px 0;
    }
    .post-media {
      width: 100%;
      border-radius: 8px;
      margin-top: 12px;
      overflow: hidden;
    }
    .post-media img {
      width: 100%;
      height: auto;
      display: block;
    }
    .post-link {
      color: ${darkMode ? '#70b5f9' : '#0a66c2'};
      text-decoration: none;
    }
    .post-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="post-container">
    ${textContent ? `<div class="post-content">${textContent}</div>` : ''}
    ${content.image ? `<div class="post-media"><img src="${escapeHtml(content.image)}" alt="Post media" /></div>` : ''}
    ${linkContent ? `<div class="post-content">${linkContent}</div>` : ''}
  </div>
</body>
</html>`

  return {
    html,
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
