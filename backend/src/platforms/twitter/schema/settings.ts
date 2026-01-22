/**
 * Twitter Platform Settings Schema
 * 
 * Defines the form structure for Twitter platform settings/configuration.
 * 
 * @module platforms/twitter/schema/settings
 */

import { SettingsSchema } from '@/types/schema'

export const twitterSettingsSchema: SettingsSchema = {
  version: '1.0.0',
  title: 'Twitter Platform Settings',
  description: 'Configure Twitter API credentials',
  fields: [
    {
      name: 'apiKey',
      type: 'text',
      label: 'API Key',
      required: true,
      validation: [
        { type: 'required', message: 'API Key is required' }
      ],
      ui: {
        width: 12,
        order: 1
      }
    },
    {
      name: 'apiSecret',
      type: 'password',
      label: 'API Secret',
      required: true,
      validation: [
        { type: 'required', message: 'API Secret is required' }
      ],
      ui: {
        width: 12,
        order: 2
      }
    },
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
        order: 3
      }
    },
    {
      name: 'accessTokenSecret',
      type: 'password',
      label: 'Access Token Secret',
      required: true,
      validation: [
        { type: 'required', message: 'Access Token Secret is required' }
      ],
      ui: {
        width: 12,
        order: 4
      }
    }
  ],
  groups: [
    {
      id: 'credentials',
      title: 'Twitter API Credentials',
      description: 'Configure your Twitter API credentials',
      fields: ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret'],
      collapsible: false
    }
  ]
}


