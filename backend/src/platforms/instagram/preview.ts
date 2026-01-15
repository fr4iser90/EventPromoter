/**
 * Instagram Platform Preview Renderer
 * 
 * Handles rendering of Instagram preview HTML
 * 
 * @module platforms/instagram/preview
 */

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
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div class="post-container">
    ${content.image ? `<div class="post-media"><img src="${content.image}" alt="Instagram post" /></div>` : ''}
    ${content.caption ? `<div class="post-caption">${escapeHtml(content.caption)}</div>` : ''}
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
