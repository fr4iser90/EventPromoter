// Email-specific types

export interface EmailContent {
  subject: string
  html?: string
  bodyText?: string
  recipients: string[]
  cc?: string[]
  bcc?: string[]
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  name: string
  type: string
  size: number
  base64?: string // Optional: for legacy support
  url?: string // Optional: URL to file (preferred for n8n)
  fileId?: string // Optional: file ID for mapping to UploadedFile
  id?: string // Optional: alternative file ID field
  filename?: string // Optional: alternative name field
  contentType?: string // Optional: alternative type field
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
  warnings: string[]
  recipientCount: number
  totalSize: number
}
