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
  title: 'Reddit Platform Credentials',
  description: 'Configure Reddit API credentials',
  fields: [
    {
      name: 'clientId',
      type: 'text',
      label: 'Client ID (for API only)',
      required: false,
      description: 'Required only for Reddit API publishing. Not needed for Playwright.',
      ui: {
        width: 12,
        order: 1
      }
    },
    {
      name: 'clientSecret',
      type: 'password',
      label: 'Client Secret (for API only)',
      required: false,
      description: 'Required only for Reddit API publishing. Not needed for Playwright.',
      ui: {
        width: 12,
        order: 2
      }
    },
    {
      name: 'username',
      type: 'text',
      label: 'Reddit Username',
      required: true,
      description: 'Required for both API and Playwright publishing',
      validation: [
        { type: 'required', message: 'Username is required' }
      ],
      ui: {
        width: 12,
        order: 3
      }
    },
    {
      name: 'password',
      type: 'password',
      label: 'Reddit Password',
      required: true,
      description: 'Required for both API and Playwright publishing',
      validation: [
        { type: 'required', message: 'Password is required' }
      ],
      ui: {
        width: 12,
        order: 4
      }
    }
  ],
  groups: [
    {
      id: 'api-credentials',
      title: 'Reddit API Credentials (Optional)',
      description: 'Only required if you want to use Reddit API publishing. Leave empty if you only use Playwright.',
      fields: ['clientId', 'clientSecret'],
      collapsible: true
    },
    {
      id: 'login-credentials',
      title: 'Reddit Login Credentials (Required)',
      description: 'Required for both API and Playwright publishing',
      fields: ['username', 'password'],
      collapsible: false
    }
  ]
}
