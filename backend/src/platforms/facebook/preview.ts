/**
 * Facebook Platform Preview Renderer
 * 
 * Handles rendering of Facebook preview HTML
 * 
 * @module platforms/facebook/preview
 */

export async function renderFacebookPreview(options: {
  content: Record<string, any>
  schema: any
  mode?: string
  client?: string
}): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
  const { content, schema, mode = 'desktop' } = options
  
  const selectedMode = schema.modes?.find((m: any) => m.id === mode) || schema.modes?.[0]
  const width = selectedMode?.width || 500
  const height = selectedMode?.height || 600
  
  const fontFamily = schema.styling?.fontFamily || 'Helvetica, Arial, sans-serif'
  
  // ✅ Nur Content-HTML (kein vollständiges Dokument)
  // Frontend besitzt die Preview-Shell
  let contentHtml = `
  <div class="post-container">
    ${content.text ? `<div class="post-content">${escapeHtml(content.text)}</div>` : ''}
    ${content.image ? `<div class="post-media"><img src="${escapeHtml(content.image)}" alt="Post media" /></div>` : ''}
    ${content.link ? `<div class="post-content"><a href="${escapeHtml(content.link)}" class="post-link">${escapeHtml(content.link)}</a></div>` : ''}
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
      border-radius: 8px;
      padding: 12px;
    }
    .post-content {
      font-size: 15px;
      line-height: 20px;
      margin-bottom: 12px;
      white-space: pre-wrap;
      word-wrap: break-word;
      color: var(--preview-text);
      font-family: ${fontFamily};
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
