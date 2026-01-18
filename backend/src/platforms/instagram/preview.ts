/**
 * Instagram Platform Preview Renderer
 * 
 * Handles rendering of Instagram preview HTML with Markdown support
 * 
 * @module platforms/instagram/preview
 */

import { markdownToHtml, isMarkdown } from '../../utils/markdownRenderer.js'

export async function renderInstagramPreview(options: {
  content: Record<string, any>
  schema: any
  mode?: string
  client?: string
  darkMode?: boolean
}): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
  const { content, schema, mode = 'mobile', darkMode = false } = options
  
  const selectedMode = schema.modes?.find((m: any) => m.id === mode) || schema.modes?.[0]
  const width = selectedMode?.width || 375
  const height = selectedMode?.height || 375
  
  const bgColor = darkMode ? '#000000' : '#ffffff'
  const textColor = darkMode ? '#f5f5f5' : '#262626'
  const fontFamily = schema.styling?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  
  // Process caption content - check if it's Markdown
  let captionContent = ''
  if (content.caption) {
    if (isMarkdown(content.caption)) {
      // Render Markdown to HTML (Instagram supports basic formatting)
      captionContent = markdownToHtml(content.caption)
    } else {
      // Plain text - preserve line breaks
      captionContent = escapeHtml(content.caption).replace(/\n/g, '<br>')
    }
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
      padding: 0;
      line-height: 1.5;
    }
    .post-container {
      max-width: ${width}px;
      margin: 0 auto;
      background: ${bgColor};
    }
    .post-media {
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
    }
    .post-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .post-caption {
      font-size: 14px;
      line-height: 18px;
      padding: 12px;
      word-wrap: break-word;
    }
    .post-caption p {
      margin-bottom: 4px;
    }
    .post-caption p:last-child {
      margin-bottom: 0;
    }
    .post-caption strong {
      font-weight: 600;
    }
    .post-caption em {
      font-style: italic;
    }
    .post-caption a {
      color: ${darkMode ? '#8e8e8e' : '#00376b'};
      text-decoration: none;
    }
    .post-caption a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="post-container">
    ${content.image ? `<div class="post-media"><img src="${escapeHtml(content.image)}" alt="Instagram post" /></div>` : ''}
    ${captionContent ? `<div class="post-caption">${captionContent}</div>` : ''}
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
