/**
 * Reddit Settings Schema
 * 
 * Defines the settings structure for Reddit platform features (formerly Panel).
 * This is NOT for credentials (those are in credentials.ts).
 * 
 * Uses schema-driven fields that are rendered by SchemaRenderer.
 * All data comes from backend API endpoints.
 * 
 * @module platforms/reddit/schema/settings
 */

import { SettingsSchema } from '@/types/schema'

export const redditSettingsSchema: SettingsSchema = {
  id: 'reddit-settings-schema',
  version: '2.0.0',
  title: 'Reddit Subreddits',
  description: 'Manage subreddits and groups for event posts',
  tabs: [
    {
      id: 'targets',
      label: 'Subreddits',
      sections: ['target-list', 'add-target', 'edit-target']
    },
    {
      id: 'groups',
      label: 'Gruppen',
      sections: ['group-management']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      sections: ['subreddit-stats']
    }
  ],
  sections: [
    {
      id: 'target-list',
      title: 'Subreddits',
      description: 'Verwaltung der Subreddits',
      fields: [
        {
          name: 'targets',
          type: 'target-list',
          label: 'Subreddits',
          description: 'Liste aller Subreddits mit Custom Fields',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
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
      id: 'add-target',
      title: 'Neues Subreddit hinzufügen',
      description: 'Füge ein neues Subreddit mit optionalen Custom Fields hinzu',
      fields: [
        {
          name: 'subreddit',
          type: 'text',
          label: 'Subreddit Name',
          placeholder: 'z.B. electronicmusic',
          required: true,
          validation: [
            { type: 'required', message: 'Subreddit-Name ist erforderlich' },
            { 
              type: 'pattern', 
              value: '^[a-z0-9_]{3,21}$', 
              message: 'Subreddit-Name muss 3-21 Zeichen lang sein und nur Buchstaben, Zahlen und Unterstriche enthalten' 
            }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets',
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
          placeholder: 'z.B. Community für elektronische Musik',
          required: false,
          validation: [
            { type: 'maxLength', value: 500, message: 'Beschreibung darf maximal 500 Zeichen lang sein' }
          ],
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags',
          required: false,
          options: [
            { label: 'Music', value: 'music' },
            { label: 'Events', value: 'events' },
            { label: 'Local', value: 'local' }
          ],
          ui: {
            width: 12,
            order: 3
          }
        }
      ]
    },
    {
      id: 'edit-target',
      title: 'Subreddit bearbeiten',
      description: 'Bearbeite ein bestehendes Subreddit',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Subreddit auswählen',
          required: true,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          },
          ui: {
            width: 12,
            order: 1
          }
        }
        // Note: Custom fields werden dynamisch basierend auf targetSchema geladen
      ]
    },
    {
      id: 'group-management',
      title: 'Subreddit-Gruppen',
      description: 'Verwaltung von Subreddit-Gruppen mit Target-IDs',
      fields: [
        {
          name: 'groupName',
          type: 'text',
          label: 'Gruppenname',
          placeholder: 'z.B. Music Events, Local Events, etc.',
          required: false,
          ui: {
            width: 6,
            order: 1
          }
        },
        {
          name: 'groupTargets',
          type: 'multiselect',
          label: 'Subreddits auswählen',
          description: 'Wähle die Subreddits for diese Gruppe',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          },
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'createGroup',
          type: 'button',
          label: 'Gruppe erstellen',
          action: {
            endpoint: 'platforms/:platformId/target-groups',
            method: 'POST',
            trigger: 'submit',
            bodyMapping: {
              groupName: 'groupName',
              targetIds: 'groupTargets'
            },
            onSuccess: 'reload',
            reloadOptions: true
          },
          ui: {
            width: 12,
            order: 3
          }
        }
      ]
    },
    {
      id: 'subreddit-stats',
      title: 'Subreddit-Statistiken',
      description: 'Zeige Statistiken für ein ausgewähltes Subreddit',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Subreddit auswählen',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          },
          ui: {
            width: 12,
            order: 1
          }
        }
        // Note: Stats werden als read-only Display gerendert (nicht als Field)
      ]
    }
  ],
  targetSchema: {
    baseField: 'subreddit',
    baseFieldLabel: 'Subreddit Name',
    baseFieldValidation: [
      { type: 'pattern', value: '^[a-z0-9_]{3,21}$', message: 'Invalid subreddit name' }
    ],
    customFields: [
      {
        name: 'description',
        type: 'textarea',
        label: 'Beschreibung',
        required: false,
        validation: [
          { type: 'maxLength', value: 500, message: 'Description must be at most 500 characters' }
        ],
        ui: { width: 12, order: 1 }
      },
      {
        name: 'tags',
        type: 'multiselect',
        label: 'Tags',
        required: false,
        options: [
          { label: 'Music', value: 'music' },
          { label: 'Events', value: 'events' },
          { label: 'Local', value: 'local' }
        ],
        ui: { width: 12, order: 2 }
      },
      {
        name: 'active',
        type: 'boolean',
        label: 'Aktiv',
        required: false,
        default: true,
        ui: { width: 6, order: 3 }
      }
    ],
    supportsGroups: true
  }
}
