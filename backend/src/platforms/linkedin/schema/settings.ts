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
  title: 'platform.linkedin.settings.title',
  description: 'platform.linkedin.settings.description',
  tabs: [
    {
      id: 'connections',
      label: 'platform.linkedin.settings.tabs.connections',
      sections: ['connection-list', 'add-connection', 'edit-connection']
    },
    {
      id: 'pages',
      label: 'platform.linkedin.settings.tabs.pages',
      sections: ['page-list', 'add-page']
    },
    {
      id: 'groups',
      label: 'platform.linkedin.settings.tabs.groups',
      sections: ['group-list', 'add-group']
    }
  ],
  sections: [
    {
      id: 'connection-list',
      title: 'platform.linkedin.settings.connections.list.title',
      description: 'platform.linkedin.settings.connections.list.description',
      fields: [
        {
          name: 'connections',
          type: 'target-list',
          label: 'platform.linkedin.settings.connections.table.label',
          description: 'platform.linkedin.settings.connections.table.description',
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
      title: 'platform.linkedin.settings.connections.add.title',
      description: 'platform.linkedin.settings.connections.add.description',
      fields: [
        {
          name: 'profileUrl',
          type: 'url',
          label: 'platform.linkedin.settings.connections.form.profileUrl',
          placeholder: 'https://linkedin.com/in/username',
          required: true,
          validation: [
            { type: 'required', message: 'platform.linkedin.validation.profileUrlRequired' },
            { type: 'url', message: 'platform.linkedin.validation.invalidUrl' }
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
          label: 'platform.linkedin.settings.common.name',
          placeholder: 'platform.linkedin.settings.connections.form.namePlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.linkedin.validation.nameRequired' }
          ],
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'company',
          type: 'text',
          label: 'platform.linkedin.settings.common.company',
          placeholder: 'platform.linkedin.settings.common.companyPlaceholder',
          required: false,
          ui: {
            width: 12,
            order: 3
          }
        },
        {
          name: 'title',
          type: 'text',
          label: 'platform.linkedin.settings.common.jobTitle',
          placeholder: 'platform.linkedin.settings.common.jobTitlePlaceholder',
          required: false,
          ui: {
            width: 12,
            order: 4
          }
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'platform.linkedin.settings.common.tags',
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
      title: 'platform.linkedin.settings.connections.edit.title',
      description: 'platform.linkedin.settings.connections.edit.description',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'platform.linkedin.settings.connections.edit.selectLabel',
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
      title: 'platform.linkedin.settings.pages.list.title',
      description: 'platform.linkedin.settings.pages.list.description',
      fields: [
        {
          name: 'pages',
          type: 'target-list',
          label: 'platform.linkedin.settings.pages.table.label',
          description: 'platform.linkedin.settings.pages.table.description',
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
      title: 'platform.linkedin.settings.pages.add.title',
      description: 'platform.linkedin.settings.pages.add.description',
      fields: [
        {
          name: 'pageUrl',
          type: 'url',
          label: 'platform.linkedin.settings.pages.form.pageUrl',
          placeholder: 'https://linkedin.com/company/example',
          required: true,
          validation: [
            { type: 'required', message: 'platform.linkedin.validation.pageUrlRequired' },
            { type: 'url', message: 'platform.linkedin.validation.invalidUrl' }
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
          label: 'platform.linkedin.settings.pages.form.pageName',
          placeholder: 'platform.linkedin.settings.pages.form.pageNamePlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.linkedin.validation.pageNameRequired' }
          ],
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'platform.linkedin.settings.common.active',
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
      title: 'platform.linkedin.settings.groups.list.title',
      description: 'platform.linkedin.settings.groups.list.description',
      fields: [
        {
          name: 'groups',
          type: 'target-list',
          label: 'platform.linkedin.settings.groups.table.label',
          description: 'platform.linkedin.settings.groups.table.description',
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
      title: 'platform.linkedin.settings.groups.add.title',
      description: 'platform.linkedin.settings.groups.add.description',
      fields: [
        {
          name: 'groupUrl',
          type: 'url',
          label: 'platform.linkedin.settings.groups.form.groupUrl',
          placeholder: 'https://linkedin.com/groups/123456',
          required: true,
          validation: [
            { type: 'required', message: 'platform.linkedin.validation.groupUrlRequired' },
            { type: 'url', message: 'platform.linkedin.validation.invalidUrl' }
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
          label: 'platform.linkedin.settings.groups.form.groupName',
          placeholder: 'platform.linkedin.settings.groups.form.groupNamePlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.linkedin.validation.groupNameRequired' }
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
      baseFieldLabel: 'platform.linkedin.settings.connections.form.profileUrl',
      baseFieldValidation: [
        { type: 'required', message: 'platform.linkedin.validation.profileUrlRequired' },
        { type: 'url', message: 'platform.linkedin.validation.invalidUrlFormat' }
      ],
      customFields: [
        {
          name: 'name',
          type: 'text',
          label: 'platform.linkedin.settings.common.name',
          required: true,
          ui: { width: 12, order: 1 }
        },
        {
          name: 'company',
          type: 'text',
          label: 'platform.linkedin.settings.common.company',
          required: false,
          ui: { width: 12, order: 2 }
        },
        {
          name: 'title',
          type: 'text',
          label: 'platform.linkedin.settings.common.jobTitle',
          required: false,
          ui: { width: 12, order: 3 }
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'platform.linkedin.settings.common.tags',
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
