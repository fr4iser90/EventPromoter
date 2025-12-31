// Email-specific types

export interface EmailContent {
  subject: string
  html: string
  recipients: string[]
  cc?: string[]
  bcc?: string[]
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  name: string
  type: string
  size: number
  base64: string
}

export interface EmailConfig {
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPass?: string
  fromEmail?: string
  fromName?: string
}

export interface EmailValidation {
  isValid: boolean
  errors: string[]
  recipientCount: number
  totalSize: number
}
