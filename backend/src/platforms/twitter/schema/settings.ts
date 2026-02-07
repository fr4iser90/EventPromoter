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
  title: 'Twitter Accounts & Hashtags',
  description: 'Manage Twitter accounts and hashtags for event posts',
  tabs: [
    {
      id: 'accounts',
      label: 'Accounts',
      sections: ['account-list', 'add-account', 'edit-account']
    },
    {
      id: 'hashtags',
      label: 'Hashtags',
      sections: ['hashtag-list', 'add-hashtag']
    },
    {
      id: 'mentions',
      label: 'Mentions',
      sections: ['mention-list', 'add-mention']
    }
  ],
  sections: [
    {
      id: 'account-list',
      title: 'Twitter-Accounts',
      description: 'Verwaltung der Twitter-Accounts',
      fields: [
        {
          name: 'accounts',
          type: 'target-list',
          label: 'Accounts',
          description: 'Liste aller Twitter-Accounts',
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
      title: 'Neuen Account hinzufügen',
      description: 'Füge einen neuen Twitter-Account hinzu',
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'Twitter Username',
          placeholder: '@username oder username',
          required: true,
          validation: [
            { type: 'required', message: 'Twitter Username ist erforderlich' },
            { type: 'pattern', value: '^@?[a-zA-Z0-9_]{1,15}$', message: 'Ungültiger Twitter Username' }
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
          label: 'Anzeigename',
          placeholder: 'z.B. EventPromo',
          required: false,
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung',
          placeholder: 'z.B. Offizieller Account für Event-Promotion',
          required: false,
          ui: {
            width: 12,
            order: 3
          }
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'Aktiv',
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
      title: 'Account bearbeiten',
      description: 'Bearbeite einen bestehenden Twitter-Account',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Account auswählen',
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
      title: 'Hashtags',
      description: 'Verwaltung der Hashtags',
      fields: [
        {
          name: 'hashtags',
          type: 'target-list',
          label: 'Hashtags',
          description: 'Liste aller Hashtags',
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
      title: 'Neuen Hashtag hinzufügen',
      description: 'Füge einen neuen Hashtag hinzu',
      fields: [
        {
          name: 'hashtag',
          type: 'text',
          label: 'Hashtag',
          placeholder: '#hashtag oder hashtag',
          required: true,
          validation: [
            { type: 'required', message: 'Hashtag ist erforderlich' },
            { type: 'pattern', value: '^#?[a-zA-Z0-9_]+$', message: 'Ungültiger Hashtag' }
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
          label: 'Beschreibung',
          placeholder: 'z.B. Allgemeiner Hashtag für Events',
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
      title: 'Mentions',
      description: 'Verwaltung der Mentions/User',
      fields: [
        {
          name: 'mentions',
          type: 'target-list',
          label: 'Mentions',
          description: 'Liste aller Mentions/User',
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
      title: 'Neue Mention hinzufügen',
      description: 'Füge einen neuen User/Mention hinzu',
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'Twitter Username',
          placeholder: '@username oder username',
          required: true,
          validation: [
            { type: 'required', message: 'Twitter Username ist erforderlich' },
            { type: 'pattern', value: '^@?[a-zA-Z0-9_]{1,15}$', message: 'Ungültiger Twitter Username' }
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
      baseFieldLabel: 'Twitter Username',
      baseFieldValidation: [
        { type: 'required', message: 'Username is required' },
        { type: 'pattern', value: '^@?[a-zA-Z0-9_]{1,15}$', message: 'Invalid Twitter username' }
      ],
      customFields: [
        {
          name: 'displayName',
          type: 'text',
          label: 'Anzeigename',
          required: false,
          ui: { width: 12, order: 1 }
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung',
          required: false,
          ui: { width: 12, order: 2 }
        }
      ],
      supportsGroups: false
    }
  }
}
