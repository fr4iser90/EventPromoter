/**
 * Email Platform Credentials Schema
 * 
 * Credentials configuration for the Email platform (SMTP, credentials, etc.)
 * 
 * @module platforms/email/schema/credentials
 */

import { CredentialsSchema } from '@/types/schema/index.js'

export const emailCredentialsSchema: CredentialsSchema = {
  version: '1.0.0',
  title: 'Email Platform Credentials',
  description: 'Configure SMTP credentials for email platform',
  fields: [
    {
      name: 'host',
      type: 'text',
      label: 'platform.email.credentials.api.host',
      placeholder: 'smtp.gmail.com',
      required: false,
      validation: [
        { type: 'pattern', value: '^[a-zA-Z0-9.-]+$', message: 'Invalid hostname format' }
      ],
      ui: {
        width: 12,
        order: 1
      }
    },
    {
      name: 'port',
      type: 'number',
      label: 'platform.email.credentials.api.port',
      placeholder: '587',
      default: 587,
      required: false,
      validation: [
        { type: 'min', value: 1, message: 'Port must be at least 1' },
        { type: 'max', value: 65535, message: 'Port must be at most 65535' }
      ],
      ui: {
        width: 6,
        order: 2
      }
    },
    {
      name: 'username',
      type: 'text',
      label: 'platform.email.credentials.api.username',
      required: false,
      validation: [
        { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Invalid email format' }
      ],
      ui: {
        width: 12,
        order: 3
      }
    },
    {
      name: 'password',
      type: 'password',
      label: 'platform.email.credentials.api.password',
      required: false,
      ui: {
        width: 12,
        order: 4
      }
    },
    {
      name: 'fromEmail',
      type: 'text',
      label: 'platform.email.credentials.api.fromEmail',
      required: false,
      validation: [
        { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Invalid email format' }
      ],
      ui: {
        width: 12,
        order: 5
      }
    },
    {
      name: 'fromName',
      type: 'text',
      label: 'platform.email.credentials.api.fromName',
      placeholder: 'Your Name',
      required: false,
      ui: {
        width: 12,
        order: 6
      }
    },
    {
      name: 'browser_username',
      type: 'text',
      label: 'platform.email.credentials.login.username',
      required: false,
      ui: {
        width: 12,
        order: 7
      }
    },
    {
      name: 'browser_password',
      type: 'password',
      label: 'platform.email.credentials.login.password',
      required: false,
      ui: {
        width: 12,
        order: 8
      }
    }
  ],
  groups: [
    {
      id: 'api-credentials',
      title: 'platform.email.credentials.api.title',
      description: 'platform.email.credentials.api.description',
      method: 'api',
      fields: ['host', 'port', 'username', 'password', 'fromEmail', 'fromName'],
      collapsible: true
    },
    {
      id: 'login-credentials',
      title: 'platform.email.credentials.login.title',
      description: 'platform.email.credentials.login.description',
      method: 'playwright',
      fields: ['browser_username', 'browser_password'],
      collapsible: true
    }
  ]
}
