/**
 * Twitter Platform Preview Renderer
 * 
 * Handles rendering of Twitter preview HTML
 * 
 * @module platforms/twitter/preview
 */

export async function renderTwitterPreview(options: {
  content: Record<string, any>
  schema: any
  mode?: string
  client?: string
  darkMode?: boolean
}): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
  const { content, schema, mode = 'mobile', darkMode = false } = options
  
  const selectedMode = schema.modes?.find((m: any) => m.id === mode) || schema.modes?.[0]
  const width = selectedMode?.width || 375
  const height = selectedMode?.height || 667
  
  const bgColor = darkMode ? '#000000' : '#ffffff'
  const textColor = darkMode ? '#ffffff' : '#0f1419'
  const borderColor = darkMode ? '#2f3336' : '#eff3f4'
  const fontFamily = schema.styling?.fontFamily || 'TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  
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
    .tweet-container {
      max-width: ${width}px;
      margin: 0 auto;
      background: ${bgColor};
      border: 1px solid ${borderColor};
      border-radius: 16px;
      padding: 12px;
    }
    .tweet-content {
      font-size: 15px;
      line-height: 20px;
      word-wrap: break-word;
      white-space: pre-wrap;
      margin-bottom: 12px;
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
  </style>
</head>
<body>
  <div class="tweet-container">
    <div class="tweet-content">${escapeHtml(content.text || '')}</div>
    ${content.image ? `<div class="tweet-media"><img src="${content.image}" alt="Tweet media" /></div>` : ''}
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
