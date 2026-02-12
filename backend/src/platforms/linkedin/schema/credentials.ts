/**
 * LinkedIn Platform Credentials Schema
 * 
 * Defines the form structure for LinkedIn platform credentials/API configuration.
 * 
 * @module platforms/linkedin/schema/credentials
 */

import { CredentialsSchema } from '@/types/schema/index.js'

export const linkedinCredentialsSchema: CredentialsSchema = {
  version: '1.0.0',
  title: 'platform.linkedin.credentials.title',
  description: 'platform.linkedin.credentials.description',
  fields: [
    {
      name: 'accessToken',
      type: 'password',
      label: 'platform.linkedin.credentials.api.accessToken',
      required: false,
      ui: {
        width: 12,
        order: 1
      }
    },
    {
      name: 'organizationId',
      type: 'text',
      label: 'platform.linkedin.credentials.api.organizationId',
      required: false,
      ui: {
        width: 12,
        order: 2
      }
    },
    {
      name: 'browser_username',
      type: 'text',
      label: 'platform.linkedin.credentials.login.username',
      required: false,
      ui: {
        width: 12,
        order: 3
      }
    },
    {
      name: 'browser_password',
      type: 'password',
      label: 'platform.linkedin.credentials.login.password',
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
      title: 'platform.linkedin.credentials.api.title',
      description: 'platform.linkedin.credentials.api.description',
      method: 'api',
      fields: ['accessToken', 'organizationId'],
      collapsible: true
    },
    {
      id: 'login-credentials',
      title: 'platform.linkedin.credentials.login.title',
      description: 'platform.linkedin.credentials.login.description',
      method: 'playwright',
      fields: ['browser_username', 'browser_password'],
      collapsible: true
    }
  ]
}
