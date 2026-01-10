/**
 * Facebook Platform Settings Schema
 * 
 * Defines the form structure for Facebook platform settings/configuration.
 * 
 * @module platforms/facebook/schema/settings
 */

import { SettingsSchema } from '../../../types/platformSchema.js'

export const facebookSettingsSchema: SettingsSchema = {
  version: '1.0.0',
  title: 'Facebook Platform Settings',
  description: 'Configure Facebook API credentials',
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
      name: 'pageId',
      type: 'text',
      label: 'Page ID',
      required: true,
      description: 'The Facebook Page ID to post to',
      validation: [
        { type: 'required', message: 'Page ID is required' }
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
      title: 'Facebook API Credentials',
      description: 'Configure your Facebook API credentials',
      fields: ['accessToken', 'pageId'],
      collapsible: false
    }
  ]
}


