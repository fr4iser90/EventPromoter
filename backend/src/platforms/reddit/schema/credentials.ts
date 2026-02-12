/**
 * Reddit Platform Credentials Schema
 * 
 * Defines the form structure for Reddit platform credentials/API configuration.
 * 
 * @module platforms/reddit/schema/credentials
 */

import { CredentialsSchema } from '@/types/schema/index.js'

export const redditCredentialsSchema: CredentialsSchema = {
  version: '1.0.0',
  title: 'platform.reddit.credentials.title',
  description: 'platform.reddit.credentials.description',
  fields: [
    {
      name: 'clientId',
      type: 'text',
      label: 'platform.reddit.credentials.api.clientId',
      required: false,
      ui: {
        width: 12,
        order: 1
      }
    },
    {
      name: 'clientSecret',
      type: 'password',
      label: 'platform.reddit.credentials.api.clientSecret',
      required: false,
      ui: {
        width: 12,
        order: 2
      }
    },
    {
      name: 'username',
      type: 'text',
      label: 'platform.reddit.credentials.login.username',
      required: false,
      ui: {
        width: 12,
        order: 3
      }
    },
    {
      name: 'password',
      type: 'password',
      label: 'platform.reddit.credentials.login.password',
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
      title: 'platform.reddit.credentials.api.title',
      description: 'platform.reddit.credentials.api.description',
      method: 'api',
      fields: ['clientId', 'clientSecret'],
      collapsible: true
    },
    {
      id: 'login-credentials',
      title: 'platform.reddit.credentials.login.title',
      description: 'platform.reddit.credentials.login.description',
      method: 'playwright',
      fields: ['username', 'password'],
      collapsible: true
    }
  ]
}
