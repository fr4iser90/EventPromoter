/**
 * Instagram Platform Credentials Schema
 * 
 * Defines the form structure for Instagram platform credentials/API configuration.
 * 
 * @module platforms/instagram/schema/credentials
 */

import { CredentialsSchema } from '@/types/schema/index.js'

export const instagramCredentialsSchema: CredentialsSchema = {
  version: '1.0.0',
  title: 'platform.instagram.credentials.title',
  description: 'platform.instagram.credentials.description',
  fields: [
    {
      name: 'accessToken',
      type: 'password',
      label: 'platform.instagram.credentials.api.accessToken',
      required: false,
      ui: {
        width: 12,
        order: 1
      }
    },
    {
      name: 'userId',
      type: 'text',
      label: 'platform.instagram.credentials.api.userId',
      required: false,
      ui: {
        width: 12,
        order: 2
      }
    },
    {
      name: 'browser_username',
      type: 'text',
      label: 'platform.instagram.credentials.login.username',
      required: false,
      ui: {
        width: 12,
        order: 3
      }
    },
    {
      name: 'browser_password',
      type: 'password',
      label: 'platform.instagram.credentials.login.password',
      required: false,
      ui: {
        width: 12,
        order: 4
      }
    }
  ],
  groups: [
    {
      id: 'api-credentials',
      title: 'platform.instagram.credentials.api.title',
      description: 'platform.instagram.credentials.api.description',
      method: 'api',
      fields: ['accessToken', 'userId'],
      collapsible: true
    },
    {
      id: 'login-credentials',
      title: 'platform.instagram.credentials.login.title',
      description: 'platform.instagram.credentials.login.description',
      method: 'playwright',
      fields: ['browser_username', 'browser_password'],
      collapsible: true
    }
  ]
}
