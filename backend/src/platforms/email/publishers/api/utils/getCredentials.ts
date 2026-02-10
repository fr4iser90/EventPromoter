/**
 * Get Email SMTP Credentials
 * 
 * @module platforms/email/publishers/api/utils/getCredentials
 */

import { ConfigService } from '../../../../../services/configService.js'

export async function getCredentials(): Promise<any> {
  // Load from platform settings (uses schema field names: host, port, username, password)
  const config = await ConfigService.getPlatformSettings('email') || {}
  return {
    host: config.host || process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
    port: config.port || parseInt(process.env.EMAIL_SMTP_PORT || '587'),
    username: config.username || process.env.EMAIL_SMTP_USER,
    password: config.password || process.env.EMAIL_SMTP_PASSWORD,
    fromEmail: config.fromEmail || process.env.EMAIL_FROM,
    fromName: config.fromName || process.env.EMAIL_FROM_NAME || 'EventPromoter',
  }
}
