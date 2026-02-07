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
  title: 'LinkedIn Platform Credentials',
  description: 'Configure LinkedIn API credentials',
  fields: [
    {
      name: 'accessToken',
      type: 'password',
      label: 'Access Token',
      required: true,
      validation: [
        { type: 'required', message: 'Access Token is required' }
      ],
      ui: {
        width: 12,
        order: 1
      }
    },
    {
      name: 'organizationId',
      type: 'text',
      label: 'Organization ID',
      required: false,
      description: 'Optional: For posting as an organization',
      ui: {
        width: 12,
        order: 2
      }
    }
  ],
  groups: [
    {
      id: 'credentials',
      title: 'LinkedIn API Credentials',
      description: 'Configure your LinkedIn API credentials',
      fields: ['accessToken', 'organizationId'],
      collapsible: false
    }
  ]
}
