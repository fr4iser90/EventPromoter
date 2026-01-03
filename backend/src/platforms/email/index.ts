// Email Platform Plugin
import { PlatformPlugin, PlatformCapability } from '../../types/index.js'
import { EmailParser } from './parser.js'
import { EmailService } from './service.js'
import { EMAIL_TEMPLATES } from './templates.js'
import { EmailValidator } from './validator.js'

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
    panel: {
      title: 'Email Configuration',
      sections: [
        {
          id: 'recipients',
          title: 'Email Recipients',
          component: 'recipient-selector',
          props: {
            source: 'email-list',
            multiple: true,
            allowCustom: true,
            required: true
          }
        },
        {
          id: 'content',
          title: 'Email Content',
          component: 'email-content-editor',
          props: {
            showSubject: true,
            showHtml: true,
            showPreview: true,
            maxLength: 50000
          }
        },
        {
          id: 'smtp',
          title: 'SMTP Settings',
          component: 'settings-form',
          props: {
            fields: [
              {
                name: 'host',
                type: 'text',
                label: 'SMTP Host',
                placeholder: 'smtp.gmail.com',
                required: true,
                validation: 'hostname'
              },
              {
                name: 'port',
                type: 'number',
                label: 'Port',
                placeholder: '587',
                default: 587,
                required: true,
                validation: 'port'
              },
              {
                name: 'username',
                type: 'text',
                label: 'Username',
                required: true
              },
              {
                name: 'password',
                type: 'password',
                label: 'Password',
                required: true
              },
              {
                name: 'fromEmail',
                type: 'email',
                label: 'From Email',
                required: true
              },
              {
                name: 'fromName',
                type: 'text',
                label: 'From Name',
                placeholder: 'Your Name'
              }
            ]
          }
        }
      ]
    }
  }
}

export default EmailPlugin
