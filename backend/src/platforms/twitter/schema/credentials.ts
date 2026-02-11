/**
 * Twitter Platform Credentials Schema
 * 
 * Defines the form structure for Twitter platform credentials/API configuration.
 * 
 * @module platforms/twitter/schema/credentials
 */

import { CredentialsSchema } from '@/types/schema/index.js'

export const twitterCredentialsSchema: CredentialsSchema = {
  version: '1.0.0',
  title: 'Twitter Platform Credentials',
  description: 'Configure Twitter API credentials',
  fields: [
    {
      name: 'apiKey',
      type: 'text',
      label: 'platform.twitter.credentials.api.apiKey',
      required: false,
      ui: {
        width: 12,
        order: 1
      }
    },
    {
      name: 'apiSecret',
      type: 'password',
      label: 'platform.twitter.credentials.api.apiSecret',
      required: false,
      ui: {
        width: 12,
        order: 2
      }
    },
    {
      name: 'accessToken',
      type: 'password',
      label: 'platform.twitter.credentials.api.accessToken',
      required: false,
      ui: {
        width: 12,
        order: 3
      }
    },
    {
      name: 'accessTokenSecret',
      type: 'password',
      label: 'platform.twitter.credentials.api.accessTokenSecret',
      required: false,
      ui: {
        width: 12,
        order: 4
      }
    },
    {
      name: 'browser_username',
      type: 'text',
      label: 'platform.twitter.credentials.login.username',
      required: false,
      ui: {
        width: 12,
        order: 5
      }
    },
    {
      name: 'browser_password',
      type: 'password',
      label: 'platform.twitter.credentials.login.password',
      required: false,
      ui: {
        width: 12,
        order: 6
      }
    }
  ],
  groups: [
    {
      id: 'api-credentials',
      title: 'platform.twitter.credentials.api.title',
      description: 'platform.twitter.credentials.api.description',
      method: 'api',
      fields: ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret'],
      collapsible: true
    },
    {
      id: 'login-credentials',
      title: 'platform.twitter.credentials.login.title',
      description: 'platform.twitter.credentials.login.description',
      method: 'playwright',
      fields: ['browser_username', 'browser_password'],
      collapsible: true
    }
  ]
}
