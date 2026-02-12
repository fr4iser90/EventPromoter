/**
 * Twitter Settings Schema
 * 
 * Defines the settings structure for Twitter platform features (formerly Panel).
 * This is NOT for credentials (those are in credentials.ts).
 * 
 * Uses schema-driven fields that are rendered by SchemaRenderer.
 * All data comes from backend API endpoints.
 * 
 * @module platforms/twitter/schema/settings
 */

import { SettingsSchema } from '@/types/schema/index.js'

export const twitterSettingsSchema: SettingsSchema = {
  id: 'twitter-settings-schema',
  version: '1.0.0',
  title: 'platform.twitter.settings.title',
  description: 'platform.twitter.settings.description',
  tabs: [
    {
      id: 'accounts',
      label: 'platform.twitter.settings.tabs.accounts',
      sections: ['account-list', 'add-account', 'edit-account']
    },
    {
      id: 'hashtags',
      label: 'platform.twitter.settings.tabs.hashtags',
      sections: ['hashtag-list', 'add-hashtag']
    },
    {
      id: 'mentions',
      label: 'platform.twitter.settings.tabs.mentions',
      sections: ['mention-list', 'add-mention']
    }
  ],
  sections: [
    {
      id: 'account-list',
      title: 'platform.twitter.settings.accounts.list.title',
      description: 'platform.twitter.settings.accounts.list.description',
      fields: [
        {
          name: 'accounts',
          type: 'target-list',
          label: 'platform.twitter.settings.accounts.table.label',
          description: 'platform.twitter.settings.accounts.table.description',
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
      title: 'platform.twitter.settings.accounts.add.title',
      description: 'platform.twitter.settings.accounts.add.description',
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'platform.twitter.settings.common.twitterUsername',
          placeholder: 'platform.twitter.settings.common.twitterUsernamePlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.twitter.validation.twitterUsernameRequired' },
            { type: 'pattern', value: '^@?[a-zA-Z0-9_]{1,15}$', message: 'platform.twitter.validation.invalidTwitterUsername' }
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
          label: 'platform.twitter.settings.common.displayName',
          placeholder: 'platform.twitter.settings.common.displayNamePlaceholder',
          required: false,
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'platform.twitter.settings.common.description',
          placeholder: 'platform.twitter.settings.common.descriptionPlaceholder',
          required: false,
          ui: {
            width: 12,
            order: 3
          }
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'platform.twitter.settings.common.active',
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
      title: 'platform.twitter.settings.accounts.edit.title',
      description: 'platform.twitter.settings.accounts.edit.description',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'platform.twitter.settings.accounts.edit.selectLabel',
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
      title: 'platform.twitter.settings.hashtags.list.title',
      description: 'platform.twitter.settings.hashtags.list.description',
      fields: [
        {
          name: 'hashtags',
          type: 'target-list',
          label: 'platform.twitter.settings.hashtags.table.label',
          description: 'platform.twitter.settings.hashtags.table.description',
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
      title: 'platform.twitter.settings.hashtags.add.title',
      description: 'platform.twitter.settings.hashtags.add.description',
      fields: [
        {
          name: 'hashtag',
          type: 'text',
          label: 'platform.twitter.settings.hashtags.form.hashtag',
          placeholder: 'platform.twitter.settings.hashtags.form.hashtagPlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.twitter.validation.hashtagRequired' },
            { type: 'pattern', value: '^#?[a-zA-Z0-9_]+$', message: 'platform.twitter.validation.invalidHashtag' }
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
          label: 'platform.twitter.settings.common.description',
          placeholder: 'platform.twitter.settings.hashtags.form.descriptionPlaceholder',
          required: false,
          ui: {
            width: 12,
            order: 2
          }
        }
      ]
    },
    {
      id: 'mention-list',
      title: 'platform.twitter.settings.mentions.list.title',
      description: 'platform.twitter.settings.mentions.list.description',
      fields: [
        {
          name: 'mentions',
          type: 'target-list',
          label: 'platform.twitter.settings.mentions.table.label',
          description: 'platform.twitter.settings.mentions.table.description',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=mention',
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
      id: 'add-mention',
      title: 'platform.twitter.settings.mentions.add.title',
      description: 'platform.twitter.settings.mentions.add.description',
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'platform.twitter.settings.common.twitterUsername',
          placeholder: 'platform.twitter.settings.common.twitterUsernamePlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.twitter.validation.twitterUsernameRequired' },
            { type: 'pattern', value: '^@?[a-zA-Z0-9_]{1,15}$', message: 'platform.twitter.validation.invalidTwitterUsername' }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets?type=mention',
            method: 'POST',
            trigger: 'submit',
            onSuccess: 'reload',
            reloadOptions: true
          },
          ui: {
            width: 12,
            order: 1
          }
        }
      ]
    }
  ],
  targetSchemas: {
    username: {
      baseField: 'username',
      baseFieldLabel: 'platform.twitter.settings.common.twitterUsername',
      baseFieldValidation: [
        { type: 'required', message: 'platform.twitter.validation.usernameRequired' },
        { type: 'pattern', value: '^@?[a-zA-Z0-9_]{1,15}$', message: 'platform.twitter.validation.invalidTwitterUsername' }
      ],
      customFields: [
        {
          name: 'displayName',
          type: 'text',
          label: 'platform.twitter.settings.common.displayName',
          required: false,
          ui: { width: 12, order: 1 }
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'platform.twitter.settings.common.description',
          required: false,
          ui: { width: 12, order: 2 }
        }
      ],
      supportsGroups: false
    }
  }
}
