/**
 * LinkedIn Settings Schema
 * 
 * Defines the settings structure for LinkedIn platform features (formerly Panel).
 * This is NOT for credentials (those are in credentials.ts).
 * 
 * Uses schema-driven fields that are rendered by SchemaRenderer.
 * All data comes from backend API endpoints.
 * 
 * @module platforms/linkedin/schema/settings
 */

import { SettingsSchema } from '@/types/schema/index.js'

export const linkedinSettingsSchema: SettingsSchema = {
  id: 'linkedin-settings-schema',
  version: '1.0.0',
  title: 'LinkedIn Connections & Pages',
  description: 'Manage LinkedIn connections, company pages, and groups',
  tabs: [
    {
      id: 'connections',
      label: 'Connections',
      sections: ['connection-list', 'add-connection', 'edit-connection']
    },
    {
      id: 'pages',
      label: 'Company Pages',
      sections: ['page-list', 'add-page']
    },
    {
      id: 'groups',
      label: 'Groups',
      sections: ['group-list', 'add-group']
    }
  ],
  sections: [
    {
      id: 'connection-list',
      title: 'LinkedIn-Connections',
      description: 'Verwaltung der LinkedIn-Connections',
      fields: [
        {
          name: 'connections',
          type: 'target-list',
          label: 'Connections',
          description: 'Liste aller LinkedIn-Connections',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=connection',
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
      id: 'add-connection',
      title: 'Neue Connection hinzufügen',
      description: 'Füge eine neue LinkedIn-Connection hinzu',
      fields: [
        {
          name: 'profileUrl',
          type: 'url',
          label: 'LinkedIn Profile URL',
          placeholder: 'https://linkedin.com/in/username',
          required: true,
          validation: [
            { type: 'required', message: 'LinkedIn Profile URL ist erforderlich' },
            { type: 'url', message: 'Ungültige URL' }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets?type=connection',
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
          name: 'name',
          type: 'text',
          label: 'Name',
          placeholder: 'z.B. Max Mustermann',
          required: true,
          validation: [
            { type: 'required', message: 'Name ist erforderlich' }
          ],
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'company',
          type: 'text',
          label: 'Firma',
          placeholder: 'z.B. Example Corp',
          required: false,
          ui: {
            width: 12,
            order: 3
          }
        },
        {
          name: 'title',
          type: 'text',
          label: 'Job-Titel',
          placeholder: 'z.B. CEO',
          required: false,
          ui: {
            width: 12,
            order: 4
          }
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/tags',
            method: 'GET',
            responsePath: 'tags'
          },
          ui: {
            width: 12,
            order: 5
          }
        }
      ]
    },
    {
      id: 'edit-connection',
      title: 'Connection bearbeiten',
      description: 'Bearbeite eine bestehende LinkedIn-Connection',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Connection auswählen',
          required: true,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=connection',
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
      id: 'page-list',
      title: 'Company Pages',
      description: 'Verwaltung der Company Pages',
      fields: [
        {
          name: 'pages',
          type: 'target-list',
          label: 'Company Pages',
          description: 'Liste aller Company Pages',
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
      title: 'Neue Company Page hinzufügen',
      description: 'Füge eine neue Company Page hinzu',
      fields: [
        {
          name: 'pageUrl',
          type: 'url',
          label: 'Company Page URL',
          placeholder: 'https://linkedin.com/company/example',
          required: true,
          validation: [
            { type: 'required', message: 'Company Page URL ist erforderlich' },
            { type: 'url', message: 'Ungültige URL' }
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
          placeholder: 'z.B. Example Corp',
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
          name: 'active',
          type: 'boolean',
          label: 'Aktiv',
          default: true,
          ui: {
            width: 6,
            order: 3
          }
        }
      ]
    },
    {
      id: 'group-list',
      title: 'LinkedIn Groups',
      description: 'Verwaltung der LinkedIn Groups',
      fields: [
        {
          name: 'groups',
          type: 'target-list',
          label: 'Groups',
          description: 'Liste aller LinkedIn Groups',
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
      description: 'Füge eine neue LinkedIn Group hinzu',
      fields: [
        {
          name: 'groupUrl',
          type: 'url',
          label: 'Group URL',
          placeholder: 'https://linkedin.com/groups/123456',
          required: true,
          validation: [
            { type: 'required', message: 'Group URL ist erforderlich' },
            { type: 'url', message: 'Ungültige URL' }
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
          placeholder: 'z.B. Event Marketing Professionals',
          required: true,
          validation: [
            { type: 'required', message: 'Group Name ist erforderlich' }
          ],
          ui: {
            width: 12,
            order: 2
          }
        }
      ]
    }
  ],
  targetSchemas: {
    profileUrl: {
      baseField: 'profileUrl',
      baseFieldLabel: 'LinkedIn Profile URL',
      baseFieldValidation: [
        { type: 'required', message: 'Profile URL is required' },
        { type: 'url', message: 'Invalid URL format' }
      ],
      customFields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: true,
          ui: { width: 12, order: 1 }
        },
        {
          name: 'company',
          type: 'text',
          label: 'Firma',
          required: false,
          ui: { width: 12, order: 2 }
        },
        {
          name: 'title',
          type: 'text',
          label: 'Job-Titel',
          required: false,
          ui: { width: 12, order: 3 }
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/tags',
            method: 'GET',
            responsePath: 'tags'
          },
          ui: { width: 12, order: 4 }
        }
      ],
      supportsGroups: false
    }
  }
}
