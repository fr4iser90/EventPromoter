/**
 * Instagram Settings Schema
 * 
 * Defines the settings structure for Instagram platform features (formerly Panel).
 * This is NOT for credentials (those are in credentials.ts).
 * 
 * Uses schema-driven fields that are rendered by SchemaRenderer.
 * All data comes from backend API endpoints.
 * 
 * @module platforms/instagram/schema/settings
 */

import { SettingsSchema } from '@/types/schema/index.js'

export const instagramSettingsSchema: SettingsSchema = {
  id: 'instagram-settings-schema',
  version: '1.0.0',
  title: 'platform.instagram.settings.title',
  description: 'platform.instagram.settings.description',
  tabs: [
    {
      id: 'accounts',
      label: 'platform.instagram.settings.tabs.accounts',
      sections: ['account-list', 'add-account', 'edit-account']
    },
    {
      id: 'hashtags',
      label: 'platform.instagram.settings.tabs.hashtags',
      sections: ['hashtag-list', 'add-hashtag']
    },
    {
      id: 'locations',
      label: 'platform.instagram.settings.tabs.locations',
      sections: ['location-list', 'add-location']
    }
  ],
  sections: [
    {
      id: 'account-list',
      title: 'platform.instagram.settings.accounts.list.title',
      description: 'platform.instagram.settings.accounts.list.description',
      fields: [
        {
          name: 'accounts',
          type: 'target-list',
          label: 'platform.instagram.settings.accounts.table.label',
          description: 'platform.instagram.settings.accounts.table.description',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=account',
            method: 'GET',
            responsePath: 'targets'
          },
          ui: {
            width: 12,
            order: 1
          }
        }
      ]
    },
    {
      id: 'add-account',
      title: 'platform.instagram.settings.accounts.add.title',
      description: 'platform.instagram.settings.accounts.add.description',
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'platform.instagram.settings.accounts.form.username',
          placeholder: 'platform.instagram.settings.accounts.form.usernamePlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.instagram.validation.usernameRequired' },
            { type: 'pattern', value: '^@?[a-zA-Z0-9_.]+$', message: 'platform.instagram.validation.invalidUsername' }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets?type=account',
            method: 'POST',
            trigger: 'submit',
            onSuccess: 'reload',
            reloadOptions: true
          },
          ui: {
            width: 12,
            order: 1
          }
        },
        {
          name: 'displayName',
          type: 'text',
          label: 'platform.instagram.settings.common.displayName',
          placeholder: 'platform.instagram.settings.accounts.form.displayNamePlaceholder',
          required: false,
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'platform.instagram.settings.common.description',
          placeholder: 'platform.instagram.settings.accounts.form.descriptionPlaceholder',
          required: false,
          ui: {
            width: 12,
            order: 3
          }
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'platform.instagram.settings.common.active',
          default: true,
          ui: {
            width: 6,
            order: 4
          }
        }
      ]
    },
    {
      id: 'edit-account',
      title: 'platform.instagram.settings.accounts.edit.title',
      description: 'platform.instagram.settings.accounts.edit.description',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'platform.instagram.settings.accounts.edit.selectLabel',
          required: true,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=account',
            method: 'GET',
            responsePath: 'options'
          },
          ui: {
            width: 12,
            order: 1
          }
        }
      ]
    },
    {
      id: 'hashtag-list',
      title: 'platform.instagram.settings.hashtags.list.title',
      description: 'platform.instagram.settings.hashtags.list.description',
      fields: [
        {
          name: 'hashtags',
          type: 'target-list',
          label: 'platform.instagram.settings.hashtags.table.label',
          description: 'platform.instagram.settings.hashtags.table.description',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=hashtag',
            method: 'GET',
            responsePath: 'targets'
          },
          ui: {
            width: 12,
            order: 1
          }
        }
      ]
    },
    {
      id: 'add-hashtag',
      title: 'platform.instagram.settings.hashtags.add.title',
      description: 'platform.instagram.settings.hashtags.add.description',
      fields: [
        {
          name: 'hashtag',
          type: 'text',
          label: 'platform.instagram.settings.hashtags.form.hashtag',
          placeholder: 'platform.instagram.settings.hashtags.form.hashtagPlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.instagram.validation.hashtagRequired' },
            { type: 'pattern', value: '^#?[a-zA-Z0-9_]+$', message: 'platform.instagram.validation.invalidHashtag' }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets?type=hashtag',
            method: 'POST',
            trigger: 'submit',
            onSuccess: 'reload',
            reloadOptions: true
          },
          ui: {
            width: 12,
            order: 1
          }
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'platform.instagram.settings.common.description',
          placeholder: 'platform.instagram.settings.hashtags.form.descriptionPlaceholder',
          required: false,
          ui: {
            width: 12,
            order: 2
          }
        }
      ]
    },
    {
      id: 'location-list',
      title: 'platform.instagram.settings.locations.list.title',
      description: 'platform.instagram.settings.locations.list.description',
      fields: [
        {
          name: 'locations',
          type: 'target-list',
          label: 'platform.instagram.settings.locations.table.label',
          description: 'platform.instagram.settings.locations.table.description',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=location',
            method: 'GET',
            responsePath: 'targets'
          },
          ui: {
            width: 12,
            order: 1
          }
        }
      ]
    },
    {
      id: 'add-location',
      title: 'platform.instagram.settings.locations.add.title',
      description: 'platform.instagram.settings.locations.add.description',
      fields: [
        {
          name: 'locationName',
          type: 'text',
          label: 'platform.instagram.settings.locations.form.locationName',
          placeholder: 'platform.instagram.settings.locations.form.locationNamePlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.instagram.validation.locationNameRequired' }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets?type=location',
            method: 'POST',
            trigger: 'submit',
            onSuccess: 'reload',
            reloadOptions: true
          },
          ui: {
            width: 12,
            order: 1
          }
        },
        {
          name: 'locationId',
          type: 'text',
          label: 'platform.instagram.settings.locations.form.locationId',
          placeholder: 'platform.instagram.settings.locations.form.locationIdPlaceholder',
          required: false,
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'platform.instagram.settings.locations.form.address',
          placeholder: 'platform.instagram.settings.locations.form.addressPlaceholder',
          required: false,
          ui: {
            width: 12,
            order: 3
          }
        }
      ]
    }
  ],
  targetSchemas: {
    username: {
      baseField: 'username',
      baseFieldLabel: 'platform.instagram.settings.accounts.form.username',
      baseFieldValidation: [
        { type: 'required', message: 'platform.instagram.validation.usernameRequired' },
        { type: 'pattern', value: '^@?[a-zA-Z0-9_.]+$', message: 'platform.instagram.validation.invalidUsername' }
      ],
      customFields: [
        {
          name: 'displayName',
          type: 'text',
          label: 'platform.instagram.settings.common.displayName',
          required: false,
          ui: { width: 12, order: 1 }
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'platform.instagram.settings.common.description',
          required: false,
          ui: { width: 12, order: 2 }
        }
      ],
      supportsGroups: false
    }
  }
}
