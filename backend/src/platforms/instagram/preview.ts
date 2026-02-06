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
}): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
  const { content, schema, mode = 'mobile' } = options
  
  const selectedMode = schema.modes?.find((m: any) => m.id === mode) || schema.modes?.[0]
  const width = selectedMode?.width || 375
  const height = selectedMode?.height || 375
  
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
  
  // ✅ Nur Content-HTML (kein vollständiges Dokument)
  // Frontend besitzt die Preview-Shell
  let contentHtml = `
  <div class="post-container">
    ${content.image ? `<div class="post-media"><img src="${escapeHtml(content.image)}" alt="Instagram post" /></div>` : ''}
    ${captionContent ? `<div class="post-caption">${captionContent}</div>` : ''}
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
      color: var(--preview-text);
      font-family: ${fontFamily};
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
      color: var(--preview-link);
      text-decoration: none;
    }
    .post-caption a:hover {
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
