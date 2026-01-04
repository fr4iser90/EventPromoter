// Email Platform Plugin
import { PlatformPlugin, PlatformCapability } from '../../types/index.js'
import { EmailParser } from './parser.js'
import { EmailService } from './service.js'
import { EMAIL_TEMPLATES } from './templates.js'
import { EmailValidator } from './validator.js'
import { emailPanelConfig } from './panel.js'
import { emailEditorConfig } from './editor.js'
import { emailSettingsConfig } from './settings.js'

const EmailCapabilities: PlatformCapability[] = [
  { type: 'text', required: true },
  { type: 'link', required: false },
  { type: 'image', required: false },
  { type: 'hashtag', required: false }
]

const EmailPlugin: PlatformPlugin = {
  name: 'email',
  version: '1.0.0',
  displayName: 'Email',
  capabilities: EmailCapabilities,

  parser: EmailParser,
  service: new EmailService(),
  validator: {
    validate: (content: any) => EmailValidator.validateContent(content),
    getLimits: () => ({
      maxLength: 50000, // HTML content can be long
      maxImages: 10,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
    })
  },
  templates: EMAIL_TEMPLATES,

  config: {
    apiEndpoints: {
      sendEmail: '/api/email/send'
    },
    rateLimits: {
      requestsPerHour: 100, // Email rate limits are lower
      requestsPerDay: 1000
    },
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
  },

  // UI Configuration for dynamic panel generation
  uiConfig: {
    panel: emailPanelConfig,     // Recipients management
    editor: emailEditorConfig,   // Content editing
    settings: emailSettingsConfig // SMTP credentials
  }
}

export default EmailPlugin
