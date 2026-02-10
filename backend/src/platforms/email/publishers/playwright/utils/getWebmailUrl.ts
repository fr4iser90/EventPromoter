/**
 * Get Webmail URL
 * 
 * Returns the webmail URL for the given provider
 * 
 * @module platforms/email/publishers/playwright/utils/getWebmailUrl
 */

export function getWebmailUrl(provider: string): string {
  const urls: Record<string, string> = {
    gmail: 'https://mail.google.com',
    outlook: 'https://outlook.live.com',
    yahoo: 'https://mail.yahoo.com',
  }
  return urls[provider.toLowerCase()] || urls.gmail
}
