/**
 * Markdown Renderer Utility
 * 
 * Converts Markdown text to HTML for preview rendering.
 * Supports common Markdown features: bold, italic, links, lists, code, line breaks.
 * 
 * @module utils/markdownRenderer
 */

/**
 * Convert Markdown text to HTML
 * 
 * Supports:
 * - **bold** and *italic*
 * - [links](url)
 * - `inline code`
 * - Unordered lists (-, *, +)
 * - Ordered lists (1., 2., etc.)
 * - Line breaks (double newline = paragraph, single = <br>)
 * - Headers (# ## ###)
 * 
 * @param markdown - Markdown text to convert
 * @returns HTML string
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }

  let html = markdown

  // Normalize line breaks first - ensure we have \n for processing
  // Handle cases where text might be compressed (no line breaks)
  // Try to detect list patterns even without line breaks: " - " or " * " or " + "
  
  // Convert code blocks first (before other processing)
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const escapedCode = escapeHtml(code.trim())
    return `<pre><code>${escapedCode}</code></pre>`
  })

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const escapedCode = escapeHtml(code)
    return `<code>${escapedCode}</code>`
  })

  // Convert headers (# ## ###) - handle both with and without line breaks
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')
  // Also handle headers without line breaks (compressed)
  html = html.replace(/(?<!\n)### ([^\n]+)/g, '<h3>$1</h3>')
  html = html.replace(/(?<!\n)## ([^\n]+)/g, '<h2>$1</h2>')
  html = html.replace(/(?<!\n)# ([^\n]+)/g, '<h1>$1</h1>')

  // Convert bold (**text** or __text__) - do this first
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')

  // Convert italic (*text* or _text_) - after bold to avoid conflicts
  // Use negative lookbehind/lookahead to ensure single asterisk/underscore
  html = html.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/(?<!_)_(?!_)([^_]+?)(?<!_)_(?!_)/g, '<em>$1</em>')

  // Convert links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Convert unordered lists (-, *, +)
  // First, normalize: if we see " - " pattern, try to split into lines for better processing
  // This handles compressed lists like "**Event Details:** - **Date:** 2026-05-16 - **Time:** 22:00"
  
  // Detect compressed list pattern: look for " - " or " * " or " + " after bold/regular text
  // Pattern: (text) - (text) - (text) where each item might start with **bold**
  // We want to split these into proper list items
  
  // First, try to detect and split compressed lists
  // Look for pattern: " - " that appears after text (not at start of line)
  // This indicates a compressed list format
  const compressedListMatch = html.match(/([^-*+\n]+?)\s+[-*+]\s+([^-*+\n]+?)(?:\s+[-*+]\s+([^-*+\n]+?))*/)
  if (compressedListMatch && !html.includes('\n-') && !html.includes('\n*') && !html.includes('\n+')) {
    // This looks like a compressed list - split it
    // Split on " - ", " * ", or " + " patterns
    const listPattern = /\s+[-*+]\s+/
    const parts = html.split(listPattern)
    if (parts.length > 1) {
      // Reconstruct with line breaks for proper list processing
      html = parts.map((part, index) => {
        if (index === 0) {
          return part.trim()
        } else {
          return `\n- ${part.trim()}`
        }
      }).join('')
    }
  }
  
  // Now handle standard multi-line lists
  const listItems: string[] = []
  html = html.replace(/^[\s]*[-*+]\s+(.+)$/gm, (match, content) => {
    const id = `__LIST_ITEM_${listItems.length}__`
    listItems.push(`<li>${content}</li>`)
    return id
  })

  // Wrap consecutive list items in <ul>
  let inList = false
  const lines = html.split('\n')
  const processedLines: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isListItem = line.includes('__LIST_ITEM_')
    
    if (isListItem && !inList) {
      processedLines.push('<ul>')
      inList = true
    } else if (!isListItem && inList) {
      processedLines.push('</ul>')
      inList = false
    }
    
    processedLines.push(line)
  }
  
  if (inList) {
    processedLines.push('</ul>')
  }
  
  html = processedLines.join('\n')

  // Replace list item markers with actual list items
  listItems.forEach((item, index) => {
    html = html.replace(`__LIST_ITEM_${index}__`, item)
  })

  // Convert ordered lists (1. 2. etc.)
  html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>')
  // Wrap consecutive <li> in <ol> (similar to unordered lists)
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return `<ol>${match}</ol>`
  })

  // Convert line breaks
  // Double newline = paragraph break
  html = html.split(/\n\n+/).map(paragraph => {
    if (paragraph.trim() === '') return ''
    // Check if paragraph already contains block elements (headers, lists, etc.)
    if (/^<(h[1-6]|ul|ol|pre|p)/.test(paragraph.trim())) {
      return paragraph.trim()
    }
    return `<p>${paragraph.trim()}</p>`
  }).join('\n')

  // Single newline within paragraphs = <br>
  html = html.replace(/<\/p>\n<p>/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  
  // Clean up: remove <br> tags that are inside block elements
  html = html.replace(/(<ul>[\s\S]*?<\/ul>)/g, (match) => {
    return match.replace(/<br>/g, '')
  })
  html = html.replace(/(<ol>[\s\S]*?<\/ol>)/g, (match) => {
    return match.replace(/<br>/g, '')
  })
  html = html.replace(/(<pre>[\s\S]*?<\/pre>)/g, (match) => {
    return match.replace(/<br>/g, '\n')
  })

  // Escape remaining HTML (but keep the tags we just created)
  // This is a simplified approach - we trust the markdown conversion above
  // For production, consider using a proper markdown library

  return html
}

/**
 * Escape HTML special characters
 * 
 * @param text - Text to escape
 * @returns Escaped text
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Check if text contains Markdown syntax
 * 
 * @param text - Text to check
 * @returns True if text appears to contain Markdown
 */
export function isMarkdown(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false
  }

  // Check for common Markdown patterns
  // Also check for patterns that might be on a single line (compressed)
  const markdownPatterns = [
    /\*\*[^*]+\*\*/,           // Bold (**text**)
    /__[^_]+__/,               // Bold (__text__)
    /(?<!\*)\*(?!\*)[^*]+\*(?!\*)/,  // Italic (*text*)
    /(?<!_)_(?!_)[^_]+_(?!_)/,       // Italic (_text_)
    /\[.+\]\(.+\)/,            // Links [text](url)
    /`[^`]+`/,                 // Inline code
    /```[\s\S]*?```/,          // Code blocks
    /^#{1,6}\s+.+$/m,          // Headers (with line breaks)
    /#{1,6}\s+[^\n]+/,         // Headers (even without line breaks)
    /^[\s]*[-*+]\s+.+$/m,      // Unordered lists (with line breaks)
    /[\s]*[-*+]\s+[^\n]+/,     // Unordered lists (even without line breaks)
    /^[\s]*\d+\.\s+.+$/m,      // Ordered lists (with line breaks)
    /\d+\.\s+[^\n]+/           // Ordered lists (even without line breaks)
  ]

  return markdownPatterns.some(pattern => pattern.test(text))
}
