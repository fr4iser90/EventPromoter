/**
 * Facebook Platform Credentials Schema
 * 
 * Defines the form structure for Facebook platform credentials/API configuration.
 * 
 * @module platforms/facebook/schema/credentials
 */

import { CredentialsSchema } from '@/types/schema/index.js'

export const facebookCredentialsSchema: CredentialsSchema = {
  version: '1.0.0',
  title: 'Facebook Platform Credentials',
  description: 'Configure Facebook API credentials',
  fields: [
    {
      name: 'accessToken',
      type: 'password',
      label: 'platform.facebook.credentials.api.accessToken',
      required: false,
      ui: {
        width: 12,
        order: 1
      }
    },
    {
      name: 'pageId',
      type: 'text',
      label: 'platform.facebook.credentials.api.pageId',
      required: false,
      ui: {
        width: 12,
        order: 2
      }
    },
    {
      name: 'browser_username',
      type: 'text',
      label: 'platform.facebook.credentials.login.username',
      required: false,
      ui: {
        width: 12,
        order: 3
      }
    },
    {
      name: 'browser_password',
      type: 'password',
      label: 'platform.facebook.credentials.login.password',
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
      title: 'platform.facebook.credentials.api.title',
      description: 'platform.facebook.credentials.api.description',
      method: 'api',
      fields: ['accessToken', 'pageId'],
      collapsible: true
    },
    {
      id: 'login-credentials',
      title: 'platform.facebook.credentials.login.title',
      description: 'platform.facebook.credentials.login.description',
      method: 'playwright',
      fields: ['browser_username', 'browser_password'],
      collapsible: true
    }
  ]
}
