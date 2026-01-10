/**
 * Reddit Platform Settings Schema
 * 
 * Defines the form structure for Reddit platform settings/configuration.
 * 
 * @module platforms/reddit/schema/settings
 */

import { SettingsSchema } from '../../../types/platformSchema.js'

export const redditSettingsSchema: SettingsSchema = {
  version: '1.0.0',
  title: 'Reddit Platform Settings',
  description: 'Configure Reddit API credentials',
  fields: [
    {
      name: 'clientId',
      type: 'text',
      label: 'Client ID',
      required: true,
      validation: [
        { type: 'required', message: 'Client ID is required' }
      ],
      ui: {
        width: 12,
        order: 1
      }
    },
    {
      name: 'clientSecret',
      type: 'password',
      label: 'Client Secret',
      required: true,
      validation: [
        { type: 'required', message: 'Client Secret is required' }
      ],
      ui: {
        width: 12,
        order: 2
      }
    },
    {
      name: 'username',
      type: 'text',
      label: 'Username',
      required: true,
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
      label: 'Password',
      required: true,
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
      id: 'credentials',
      title: 'Reddit API Credentials',
      description: 'Configure your Reddit API credentials',
      fields: ['clientId', 'clientSecret', 'username', 'password'],
      collapsible: false
    }
  ]
}


