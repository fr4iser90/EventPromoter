/**
 * Step 1: Validate Credentials
 * 
 * Validates that SMTP credentials are configured
 * 
 * @module platforms/email/publishers/api/steps/step1_ValidateCredentials
 */

export function step1_ValidateCredentials(credentials: any): void {
  if (!credentials.username || !credentials.password || !credentials.fromEmail) {
    throw new Error('Email SMTP credentials not configured (need username, password, fromEmail)')
  }
}
