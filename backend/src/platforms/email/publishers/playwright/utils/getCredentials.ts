/**
 * Get Email Playwright Credentials
 * 
 * @module platforms/email/publishers/playwright/utils/getCredentials
 */

import { ConfigService } from '../../../../../services/configService.js'

export async function getCredentials(): Promise<any> {
  const config = await ConfigService.getConfig('email') || {}
  return {
    email: config.email || process.env.EMAIL_USERNAME,
    password: config.password || process.env.EMAIL_PASSWORD,
    webmailProvider: config.webmailProvider || process.env.EMAIL_WEBMAIL_PROVIDER || 'gmail',
  }
}
