/**
 * HTML to Text
 * 
 * Simple HTML to text conversion
 * 
 * @module platforms/email/publishers/api/utils/htmlToText
 */

export function htmlToText(html: string): string {
  // Simple HTML to text conversion
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}
