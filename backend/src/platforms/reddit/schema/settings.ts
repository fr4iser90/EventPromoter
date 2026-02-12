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
  title: 'platform.reddit.settings.title',
  description: 'platform.reddit.settings.description',
  tabs: [
    {
      id: 'subreddits',
      label: 'platform.reddit.settings.tabs.subreddits',
      sections: ['subreddit-list']
    },
    {
      id: 'users',
      label: 'platform.reddit.settings.tabs.users',
      sections: ['user-list']
    },
    {
      id: 'groups',
      label: 'platform.reddit.settings.tabs.groups',
      sections: ['group-management']
    },
    {
      id: 'analytics',
      label: 'platform.reddit.settings.tabs.analytics',
      sections: ['subreddit-stats']
    }
  ],
  sections: [
    {
      id: 'subreddit-list',
      title: 'platform.reddit.settings.subreddits.title',
      description: 'platform.reddit.settings.subreddits.description',
      fields: [
        {
          name: 'subredditSearch',
          type: 'text',
          label: 'platform.reddit.settings.subreddits.searchLabel',
          placeholder: 'platform.reddit.settings.subreddits.searchPlaceholder',
          ui: {
            width: 9,
            order: 1,
            isFilterFor: 'targets' // Link search to table
          }
        },
        {
          name: 'newSubredditButton',
          type: 'button',
          label: 'platform.reddit.settings.subreddits.newButton',
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
          label: 'platform.reddit.settings.subreddits.table.subredditName',
          description: 'platform.reddit.settings.subreddits.table.description',
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
                label: 'platform.reddit.settings.subreddits.table.subredditName',
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
              { id: 'description', label: 'platform.reddit.settings.common.description' },
              { id: 'tags', label: 'platform.reddit.settings.common.tags' },
              { id: 'active', label: 'platform.reddit.settings.common.active', type: 'boolean' }
            ]
          }
        }
      ]
    },
    {
      id: 'user-list',
      title: 'platform.reddit.settings.users.title',
      description: 'platform.reddit.settings.users.description',
      fields: [
        {
          name: 'userSearch',
          type: 'text',
          label: 'platform.reddit.settings.users.searchLabel',
          placeholder: 'platform.reddit.settings.users.searchPlaceholder',
          ui: {
            width: 9,
            order: 1,
            isFilterFor: 'userTargets' // Link search to table
          }
        },
        {
          name: 'newUserButton',
          type: 'button',
          label: 'platform.reddit.settings.users.newButton',
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
          label: 'platform.reddit.settings.users.table.redditUsername',
          description: 'platform.reddit.settings.users.table.description',
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
                label: 'platform.reddit.settings.users.table.redditUsername',
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
              { id: 'displayName', label: 'platform.reddit.settings.users.table.displayName' },
              { id: 'notes', label: 'platform.reddit.settings.users.table.notes' },
              { id: 'active', label: 'platform.reddit.settings.common.active', type: 'boolean' }
            ]
          }
        }
      ]
    },
    {
      id: 'group-management',
      title: 'platform.reddit.settings.groups.title',
      description: 'platform.reddit.settings.groups.description',
      fields: [
        {
          name: 'groupSearch',
          type: 'text',
          label: 'platform.reddit.settings.groups.searchLabel',
          placeholder: 'platform.reddit.settings.groups.searchPlaceholder',
          ui: {
            width: 9,
            order: 1,
            isFilterFor: 'groupsOverview' // Link search to table
          }
        },
        {
          name: 'newGroupButton',
          type: 'button',
          label: 'platform.reddit.settings.groups.newButton',
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
          label: 'platform.reddit.settings.groups.table.groupName',
          description: 'platform.reddit.settings.groups.table.description',
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
                label: 'platform.reddit.settings.groups.table.groupName',
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
                label: 'platform.reddit.settings.groups.table.members',
                type: 'number'
              },
              {
                id: 'memberValues',
                label: 'platform.reddit.settings.groups.table.members',
                type: 'text'
              }
            ]
          }
        }
      ]
    },
    {
      id: 'subreddit-stats',
      title: 'platform.reddit.settings.analytics.title',
      description: 'platform.reddit.settings.analytics.description',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'platform.reddit.settings.analytics.selectSubreddit',
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
      baseFieldLabel: 'platform.reddit.settings.subreddits.table.subredditName',
      baseFieldValidation: [
        { type: 'pattern', value: '^[a-z0-9_]{3,21}$', message: 'platform.reddit.validation.invalidSubredditName' }
      ],
      customFields: [
        {
          name: 'description',
          type: 'textarea',
          label: 'platform.reddit.settings.common.description',
          required: false,
          validation: [
            { type: 'maxLength', value: 500, message: 'platform.reddit.validation.descriptionMaxLength' }
          ],
          ui: { width: 12, order: 1 }
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'platform.reddit.settings.common.tags',
          required: false,
          options: [
            { label: 'platform.reddit.options.music', value: 'music' },
            { label: 'platform.reddit.options.events', value: 'events' },
            { label: 'platform.reddit.options.local', value: 'local' }
          ],
          ui: { width: 12, order: 2 }
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'platform.reddit.settings.common.active',
          required: false,
          default: true,
          ui: { width: 6, order: 3 }
        }
      ],
      supportsGroups: true
    },
    user: {
      baseField: 'username',
      baseFieldLabel: 'platform.reddit.settings.users.table.redditUsername',
      baseFieldValidation: [
        { type: 'pattern', value: '^[a-zA-Z0-9_-]{3,20}$', message: 'platform.reddit.validation.invalidUsername' }
      ],
      customFields: [
        {
          name: 'displayName',
          type: 'text',
          label: 'platform.reddit.settings.users.table.displayName',
          required: false,
          ui: { width: 12, order: 1 }
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'platform.reddit.settings.users.table.notes',
          required: false,
          validation: [
            { type: 'maxLength', value: 500, message: 'platform.reddit.validation.notesMaxLength' }
          ],
          ui: { width: 12, order: 2 }
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'platform.reddit.settings.common.active',
          required: false,
          default: true,
          ui: { width: 6, order: 3 }
        }
      ],
      supportsGroups: true
    }
  }
}
