/**
 * Validate Credentials
 * 
 * Validates that SMTP credentials are configured
 * 
 * @module platforms/email/publishers/api/steps/validateCredentials
 */

export function validateCredentials(credentials: any): void {
  if (!credentials.username || !credentials.password || !credentials.fromEmail) {
    throw new Error('Email SMTP credentials not configured (need username, password, fromEmail)')
  }
}
