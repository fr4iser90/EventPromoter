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
      label: 'SMTP Host',
      placeholder: 'smtp.gmail.com',
      required: true,
      validation: [
        { type: 'required', message: 'SMTP host is required' },
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
      label: 'Port',
      placeholder: '587',
      default: 587,
      required: true,
      validation: [
        { type: 'required', message: 'Port is required' },
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
      label: 'Username',
      required: true,
      validation: [
        { type: 'required', message: 'Username is required' },
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
      label: 'Password',
      required: true,
      validation: [
        { type: 'required', message: 'Password is required' },
        { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
      ],
      ui: {
        width: 12,
        order: 4
      }
    },
    {
      name: 'fromEmail',
      type: 'text',
      label: 'From Email',
      required: true,
      validation: [
        { type: 'required', message: 'From email is required' },
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
      label: 'From Name',
      placeholder: 'Your Name',
      required: false,
      ui: {
        width: 12,
        order: 6
      }
    }
  ],
  groups: [
    {
      id: 'smtp',
      title: 'SMTP Configuration',
      description: 'Configure your SMTP server settings',
      fields: ['host', 'port', 'username', 'password', 'fromEmail', 'fromName'],
      collapsible: false
    }
  ]
}
