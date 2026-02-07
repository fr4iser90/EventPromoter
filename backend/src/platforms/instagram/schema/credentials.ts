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
  title: 'Instagram Platform Credentials',
  description: 'Configure Instagram API credentials',
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
      name: 'userId',
      type: 'text',
      label: 'User ID',
      required: true,
      validation: [
        { type: 'required', message: 'User ID is required' }
      ],
      ui: {
        width: 12,
        order: 2
      }
    }
  ],
  groups: [
    {
      id: 'credentials',
      title: 'Instagram API Credentials',
      description: 'Configure your Instagram API credentials',
      fields: ['accessToken', 'userId'],
      collapsible: false
    }
  ]
}
