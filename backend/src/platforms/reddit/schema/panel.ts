/**
 * Reddit Panel Schema
 * 
 * Defines the panel structure for Reddit platform features.
 * This is NOT for settings/credentials (those are in settings.ts).
 * 
 * Uses schema-driven fields that are rendered by SchemaRenderer.
 * All data comes from backend API endpoints.
 * 
 * @module platforms/reddit/schema/panel
 */

import { PanelSchema } from '../../../types/platformSchema.js'

export const redditPanelSchema: PanelSchema = {
  version: '1.0.0',
  title: 'Reddit Subreddits',
  description: 'Manage subreddits and groups for event posts',
  tabs: [
    {
      id: 'subreddits',
      label: 'Subreddits',
      sections: ['subreddit-list', 'add-subreddit']
    },
    {
      id: 'groups',
      label: 'Gruppen',
      sections: ['group-management']
    }
  ],
  sections: [
    {
      id: 'subreddit-list',
      title: 'Subreddits',
      description: 'Verwaltung der Subreddits',
      fields: [
        {
          name: 'subreddits',
          type: 'multiselect',
          label: 'Subreddits auswählen',
          description: 'Wähle die Subreddits für diesen Post',
          required: false,
          // ✅ GENERIC: Options come from backend API (already transformed)
          optionsSource: {
            endpoint: '/api/platforms/:platformId/subreddits',
            method: 'GET',
            responsePath: 'options' // Backend returns { success: true, options: [{ label, value }] }
          },
          ui: {
            width: 12,
            order: 1
          }
        }
      ]
    },
    {
      id: 'add-subreddit',
      title: 'Neues Subreddit hinzufügen',
      description: 'Füge ein neues Subreddit zur Liste hinzu',
      fields: [
        {
          name: 'newSubreddit',
          type: 'text',
          label: 'Subreddit Name',
          placeholder: 'z.B. electronicmusic oder r/electronicmusic',
          required: false,
          validation: [
            { 
              type: 'pattern', 
              value: '^[a-z0-9_]{3,21}$', 
              message: 'Subreddit-Name muss 3-21 Zeichen lang sein und nur Buchstaben, Zahlen und Unterstriche enthalten' 
            }
          ],
          // ✅ GENERIC: Action to add subreddit via API
          action: {
            endpoint: '/api/platforms/:platformId/subreddits',
            method: 'POST',
            trigger: 'submit',
            bodyMapping: { subreddit: 'newSubreddit' },
            onSuccess: 'reload',
            reloadOptions: true
          },
          ui: {
            width: 12,
            order: 1
          }
        }
      ]
    },
    {
      id: 'group-management',
      title: 'Subreddit-Gruppen',
      description: 'Verwaltung von Subreddit-Gruppen',
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
          name: 'groupSubreddits',
          type: 'textarea',
          label: 'Subreddits (komma-getrennt)',
          placeholder: 'electronicmusic, techno, house',
          required: false,
          validation: [
            { type: 'pattern', value: '^[^,]+(,[^,]+)*$', message: 'Komma-getrennte Subreddit-Namen erwartet' }
          ],
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'createGroup',
          type: 'text',
          label: 'Gruppe erstellen',
          // ✅ GENERIC: Action to create group via API
          action: {
            endpoint: '/api/platforms/:platformId/subreddit-groups',
            method: 'POST',
            trigger: 'submit',
            bodyMapping: {
              groupName: 'groupName',
              subreddits: 'groupSubreddits'
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
    }
  ]
}
