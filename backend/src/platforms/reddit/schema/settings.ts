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

import { SettingsSchema } from '@/types/schema/index.js'

export const redditSettingsSchema: SettingsSchema = {
  id: 'reddit-settings-schema',
  version: '2.0.0',
  title: 'Reddit Targets',
  description: 'Manage subreddits, users, and groups for event posts and DMs',
  tabs: [
    {
      id: 'subreddits',
      label: 'Subreddits',
      sections: ['subreddit-list']
    },
    {
      id: 'users',
      label: 'Users',
      sections: ['user-list']
    },
    {
      id: 'groups',
      label: 'Groups',
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
      id: 'subreddit-list',
      title: 'Management of Your Subreddits',
      description: 'Management of Your Subreddits',
      fields: [
        {
          name: 'subredditSearch',
          type: 'text',
          label: 'Search subreddits...',
          placeholder: 'Search subreddits...',
          ui: {
            width: 9,
            order: 1,
            isFilterFor: 'targets' // Link search to table
          }
        },
        {
          name: 'newSubredditButton',
          type: 'button',
          label: '+ New Subreddit',
          action: {
            id: 'new-subreddit-action',
            type: 'open-edit-modal',
            schemaId: 'editSubredditSchema',
            endpoint: 'platforms/:platformId/targets',
            method: 'POST',
            onSuccess: 'reload'
          },
          ui: {
            width: 3,
            order: 2,
          }
        },
        {
          name: 'targets',
          type: 'target-list',
          label: 'Subreddit Name',
          description: 'Overview of all subreddits with details.',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=subreddit',
            method: 'GET',
            responsePath: 'targets'
          },
          ui: {
            width: 12,
            order: 3,
            renderAsTable: true,
            tableColumns: [
              {
                id: 'subreddit',
                label: 'Subreddit Name',
                clickable: true,
                action: {
                  id: 'subreddit-edit-action',
                  type: 'open-edit-modal',
                  schemaId: 'editSubredditSchema',
                  dataEndpoint: 'platforms/:platformId/targets/:id',
                  saveEndpoint: 'platforms/:platformId/targets/:id',
                  method: 'PUT',
                  onSuccess: 'reload'
                }
              },
              { id: 'description', label: 'Description' },
              { id: 'tags', label: 'Tags' },
              { id: 'active', label: 'Active', type: 'boolean' }
            ]
          }
        }
      ]
    },
    {
      id: 'user-list',
      title: 'Management of Your Reddit Users',
      description: 'Management of Your Reddit Users',
      fields: [
        {
          name: 'userSearch',
          type: 'text',
          label: 'Search users...',
          placeholder: 'Search users...',
          ui: {
            width: 9,
            order: 1,
            isFilterFor: 'userTargets' // Link search to table
          }
        },
        {
          name: 'newUserButton',
          type: 'button',
          label: '+ New User',
          action: {
            id: 'new-user-action',
            type: 'open-edit-modal',
            schemaId: 'editUserSchema',
            endpoint: 'platforms/:platformId/targets',
            method: 'POST',
            onSuccess: 'reload'
          },
          ui: {
            width: 3,
            order: 2,
          }
        },
        {
          name: 'userTargets',
          type: 'target-list',
          label: 'Reddit Username',
          description: 'Overview of all Reddit users with details.',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=user',
            method: 'GET',
            responsePath: 'targets'
          },
          ui: {
            width: 12,
            order: 3,
            renderAsTable: true,
            tableColumns: [
              {
                id: 'username',
                label: 'Reddit Username',
                clickable: true,
                action: {
                  id: 'user-edit-action',
                  type: 'open-edit-modal',
                  schemaId: 'editUserSchema',
                  dataEndpoint: 'platforms/:platformId/targets/:id',
                  saveEndpoint: 'platforms/:platformId/targets/:id',
                  method: 'PUT',
                  onSuccess: 'reload'
                }
              },
              { id: 'displayName', label: 'Display Name' },
              { id: 'notes', label: 'Notes' },
              { id: 'active', label: 'Active', type: 'boolean' }
            ]
          }
        }
      ]
    },
    {
      id: 'group-management',
      title: 'Management of Your Reddit Groups',
      description: 'Management of Your Reddit Groups (can contain Subreddits and Users)',
      fields: [
        {
          name: 'groupSearch',
          type: 'text',
          label: 'Search groups...',
          placeholder: 'Search groups...',
          ui: {
            width: 9,
            order: 1,
            isFilterFor: 'groupsOverview' // Link search to table
          }
        },
        {
          name: 'newGroupButton',
          type: 'button',
          label: '+ New Group',
          action: {
            id: 'new-group-action',
            type: 'open-edit-modal',
            schemaId: 'editGroupSchema',
            endpoint: 'platforms/:platformId/target-groups',
            method: 'POST',
            onSuccess: 'reload'
          },
          ui: {
            width: 3,
            order: 2,
          }
        },
        {
          name: 'groupsOverview',
          type: 'target-list',
          label: 'Group Name',
          description: 'Overview of all Reddit groups and their member counts (Subreddits and Users).',
          optionsSource: {
            endpoint: 'platforms/:platformId/target-groups',
            method: 'GET',
            responsePath: 'groups',
          },
          ui: {
            width: 12,
            order: 3,
            renderAsTable: true,
            tableColumns: [
              {
                id: 'name',
                label: 'Group Name',
                clickable: true,
                action: {
                  id: 'group-edit-action',
                  type: 'open-edit-modal',
                  schemaId: 'editGroupSchema',
                  dataEndpoint: 'platforms/:platformId/target-groups/:id',
                  saveEndpoint: 'platforms/:platformId/target-groups/:id',
                  method: 'PUT',
                  onSuccess: 'reload'
                }
              },
              {
                id: 'memberCount',
                label: 'Members',
                type: 'number'
              },
              {
                id: 'memberValues',
                label: 'Members',
                type: 'text'
              }
            ]
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
  targetSchemas: {
    subreddit: {
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
    },
    user: {
      baseField: 'username',
      baseFieldLabel: 'Reddit Username',
      baseFieldValidation: [
        { type: 'pattern', value: '^[a-zA-Z0-9_-]{3,20}$', message: 'Invalid username' }
      ],
      customFields: [
        {
          name: 'displayName',
          type: 'text',
          label: 'Display Name',
          required: false,
          ui: { width: 12, order: 1 }
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Notizen',
          required: false,
          validation: [
            { type: 'maxLength', value: 500, message: 'Notes must be at most 500 characters' }
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
}
