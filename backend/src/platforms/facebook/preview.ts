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
  darkMode?: boolean
}): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
  const { content, schema, mode = 'desktop', darkMode = false } = options
  
  const selectedMode = schema.modes?.find((m: any) => m.id === mode) || schema.modes?.[0]
  const width = selectedMode?.width || 500
  const height = selectedMode?.height || 600
  
  const bgColor = darkMode ? '#18191a' : '#f0f2f5'
  const cardBg = darkMode ? '#242526' : '#ffffff'
  const textColor = darkMode ? '#e4e6eb' : '#050505'
  const fontFamily = schema.styling?.fontFamily || 'Helvetica, Arial, sans-serif'
  
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
      padding: 12px;
      line-height: 1.5;
    }
    .post-container {
      max-width: ${width}px;
      margin: 0 auto;
      background: ${cardBg};
      border-radius: 8px;
      padding: 12px;
    }
    .post-content {
      font-size: 15px;
      line-height: 20px;
      margin-bottom: 12px;
      white-space: pre-wrap;
      word-wrap: break-word;
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
      color: ${darkMode ? '#8ab4f8' : '#1877f2'};
      text-decoration: none;
    }
    .post-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="post-container">
    ${content.text ? `<div class="post-content">${escapeHtml(content.text)}</div>` : ''}
    ${content.image ? `<div class="post-media"><img src="${content.image}" alt="Post media" /></div>` : ''}
    ${content.link ? `<div class="post-content"><a href="${content.link}" class="post-link">${escapeHtml(content.link)}</a></div>` : ''}
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
