/**
 * Facebook Panel Schema
 * 
 * Defines the panel structure for Facebook platform features.
 * This is NOT for settings/credentials (those are in settings.ts).
 * 
 * Uses schema-driven fields that are rendered by SchemaRenderer.
 * All data comes from backend API endpoints.
 * 
 * @module platforms/facebook/schema/panel
 */

import { PanelSchema } from '../../../types/platformSchema.js'

export const facebookPanelSchema: PanelSchema = {
  version: '1.0.0',
  title: 'Facebook Pages, Groups & Events',
  description: 'Manage Facebook pages, groups, and events for event posts',
  tabs: [
    {
      id: 'pages',
      label: 'Pages',
      sections: ['page-list', 'add-page', 'edit-page']
    },
    {
      id: 'groups',
      label: 'Groups',
      sections: ['group-list', 'add-group']
    },
    {
      id: 'events',
      label: 'Events',
      sections: ['event-list', 'add-event']
    }
  ],
  sections: [
    {
      id: 'page-list',
      title: 'Facebook-Pages',
      description: 'Verwaltung der Facebook-Pages',
      fields: [
        {
          name: 'pages',
          type: 'target-list',
          label: 'Pages',
          description: 'Liste aller Facebook-Pages',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=page',
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
      id: 'add-page',
      title: 'Neue Page hinzufügen',
      description: 'Füge eine neue Facebook-Page hinzu',
      fields: [
        {
          name: 'pageId',
          type: 'text',
          label: 'Facebook Page ID',
          placeholder: 'z.B. 123456789012345',
          required: true,
          validation: [
            { type: 'required', message: 'Facebook Page ID ist erforderlich' }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets?type=page',
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
          name: 'pageName',
          type: 'text',
          label: 'Page Name',
          placeholder: 'z.B. EventPromo',
          required: true,
          validation: [
            { type: 'required', message: 'Page Name ist erforderlich' }
          ],
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'pageUrl',
          type: 'url',
          label: 'Page URL',
          placeholder: 'https://facebook.com/eventpromo',
          required: false,
          validation: [
            { type: 'url', message: 'Ungültige URL' }
          ],
          ui: {
            width: 12,
            order: 3
          }
        },
        {
          name: 'category',
          type: 'select',
          label: 'Kategorie',
          required: false,
          options: [
            { label: 'Business', value: 'business' },
            { label: 'Entertainment', value: 'entertainment' },
            { label: 'Event', value: 'event' },
            { label: 'Music', value: 'music' },
            { label: 'Nightlife', value: 'nightlife' }
          ],
          ui: {
            width: 12,
            order: 4
          }
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'Aktiv',
          default: true,
          ui: {
            width: 6,
            order: 5
          }
        }
      ]
    },
    {
      id: 'edit-page',
      title: 'Page bearbeiten',
      description: 'Bearbeite eine bestehende Facebook-Page',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Page auswählen',
          required: true,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=page',
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
      id: 'group-list',
      title: 'Facebook-Groups',
      description: 'Verwaltung der Facebook-Groups',
      fields: [
        {
          name: 'groups',
          type: 'target-list',
          label: 'Groups',
          description: 'Liste aller Facebook-Groups',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=group',
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
      id: 'add-group',
      title: 'Neue Group hinzufügen',
      description: 'Füge eine neue Facebook-Group hinzu',
      fields: [
        {
          name: 'groupId',
          type: 'text',
          label: 'Facebook Group ID',
          placeholder: 'z.B. 987654321098765',
          required: true,
          validation: [
            { type: 'required', message: 'Facebook Group ID ist erforderlich' }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets?type=group',
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
          name: 'groupName',
          type: 'text',
          label: 'Group Name',
          placeholder: 'z.B. Leipzig Events',
          required: true,
          validation: [
            { type: 'required', message: 'Group Name ist erforderlich' }
          ],
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung',
          placeholder: 'z.B. Gruppe für lokale Events in Leipzig',
          required: false,
          ui: {
            width: 12,
            order: 3
          }
        }
      ]
    },
    {
      id: 'event-list',
      title: 'Facebook Events',
      description: 'Verwaltung der Facebook Events',
      fields: [
        {
          name: 'events',
          type: 'target-list',
          label: 'Events',
          description: 'Liste aller Facebook Events',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=event',
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
      id: 'add-event',
      title: 'Neues Event hinzufügen',
      description: 'Füge ein neues Facebook Event hinzu',
      fields: [
        {
          name: 'eventId',
          type: 'text',
          label: 'Facebook Event ID',
          placeholder: 'z.B. 123456789012345',
          required: true,
          validation: [
            { type: 'required', message: 'Facebook Event ID ist erforderlich' }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets?type=event',
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
          name: 'eventName',
          type: 'text',
          label: 'Event Name',
          placeholder: 'z.B. Depeche Mode Party',
          required: true,
          validation: [
            { type: 'required', message: 'Event Name ist erforderlich' }
          ],
          ui: {
            width: 12,
            order: 2
          }
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'pageId',
    baseFieldLabel: 'Facebook Page ID',
    baseFieldValidation: [
      { type: 'required', message: 'Page ID is required' }
    ],
    customFields: [
      {
        name: 'pageName',
        type: 'text',
        label: 'Page Name',
        required: true,
        ui: { width: 12, order: 1 }
      },
      {
        name: 'pageUrl',
        type: 'url',
        label: 'Page URL',
        required: false,
        ui: { width: 12, order: 2 }
      },
      {
        name: 'category',
        type: 'select',
        label: 'Kategorie',
        required: false,
        options: [
          { label: 'Business', value: 'business' },
          { label: 'Entertainment', value: 'entertainment' },
          { label: 'Event', value: 'event' }
        ],
        ui: { width: 12, order: 3 }
      },
      {
        name: 'active',
        type: 'boolean',
        label: 'Aktiv',
        required: false,
        default: true,
        ui: { width: 6, order: 4 }
      }
    ],
    supportsGroups: false
  }
}
