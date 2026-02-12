/**
 * Facebook Settings Schema
 * 
 * Defines the settings structure for Facebook platform features (formerly Panel).
 * This is NOT for credentials (those are in credentials.ts).
 * 
 * Uses schema-driven fields that are rendered by SchemaRenderer.
 * All data comes from backend API endpoints.
 * 
 * @module platforms/facebook/schema/settings
 */

import { SettingsSchema } from '@/types/schema/index.js'

export const facebookSettingsSchema: SettingsSchema = {
  id: 'facebook-settings-schema',
  version: '1.0.0',
  title: 'platform.facebook.settings.title',
  description: 'platform.facebook.settings.description',
  tabs: [
    {
      id: 'pages',
      label: 'platform.facebook.settings.tabs.pages',
      sections: ['page-list', 'add-page', 'edit-page']
    },
    {
      id: 'groups',
      label: 'platform.facebook.settings.tabs.groups',
      sections: ['group-list', 'add-group']
    },
    {
      id: 'events',
      label: 'platform.facebook.settings.tabs.events',
      sections: ['event-list', 'add-event']
    }
  ],
  sections: [
    {
      id: 'page-list',
      title: 'platform.facebook.settings.pages.list.title',
      description: 'platform.facebook.settings.pages.list.description',
      fields: [
        {
          name: 'pages',
          type: 'target-list',
          label: 'platform.facebook.settings.pages.table.label',
          description: 'platform.facebook.settings.pages.table.description',
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
      title: 'platform.facebook.settings.pages.add.title',
      description: 'platform.facebook.settings.pages.add.description',
      fields: [
        {
          name: 'pageId',
          type: 'text',
          label: 'platform.facebook.settings.pages.form.pageId',
          placeholder: 'platform.facebook.settings.pages.form.pageIdPlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.facebook.validation.pageIdRequired' }
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
          label: 'platform.facebook.settings.pages.form.pageName',
          placeholder: 'platform.facebook.settings.pages.form.pageNamePlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.facebook.validation.pageNameRequired' }
          ],
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'pageUrl',
          type: 'url',
          label: 'platform.facebook.settings.pages.form.pageUrl',
          placeholder: 'https://facebook.com/eventpromo',
          required: false,
          validation: [
            { type: 'url', message: 'platform.facebook.validation.invalidUrl' }
          ],
          ui: {
            width: 12,
            order: 3
          }
        },
        {
          name: 'category',
          type: 'select',
          label: 'platform.facebook.settings.common.category',
          required: false,
          options: [
            { label: 'platform.facebook.settings.categories.business', value: 'business' },
            { label: 'platform.facebook.settings.categories.entertainment', value: 'entertainment' },
            { label: 'platform.facebook.settings.categories.event', value: 'event' },
            { label: 'platform.facebook.settings.categories.music', value: 'music' },
            { label: 'platform.facebook.settings.categories.nightlife', value: 'nightlife' }
          ],
          ui: {
            width: 12,
            order: 4
          }
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'platform.facebook.settings.common.active',
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
      title: 'platform.facebook.settings.pages.edit.title',
      description: 'platform.facebook.settings.pages.edit.description',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'platform.facebook.settings.pages.edit.selectLabel',
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
      title: 'platform.facebook.settings.groups.list.title',
      description: 'platform.facebook.settings.groups.list.description',
      fields: [
        {
          name: 'groups',
          type: 'target-list',
          label: 'platform.facebook.settings.groups.table.label',
          description: 'platform.facebook.settings.groups.table.description',
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
      title: 'platform.facebook.settings.groups.add.title',
      description: 'platform.facebook.settings.groups.add.description',
      fields: [
        {
          name: 'groupId',
          type: 'text',
          label: 'platform.facebook.settings.groups.form.groupId',
          placeholder: 'platform.facebook.settings.groups.form.groupIdPlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.facebook.validation.groupIdRequired' }
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
          label: 'platform.facebook.settings.groups.form.groupName',
          placeholder: 'platform.facebook.settings.groups.form.groupNamePlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.facebook.validation.groupNameRequired' }
          ],
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'platform.facebook.settings.common.description',
          placeholder: 'platform.facebook.settings.groups.form.descriptionPlaceholder',
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
      title: 'platform.facebook.settings.events.list.title',
      description: 'platform.facebook.settings.events.list.description',
      fields: [
        {
          name: 'events',
          type: 'target-list',
          label: 'platform.facebook.settings.events.table.label',
          description: 'platform.facebook.settings.events.table.description',
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
      title: 'platform.facebook.settings.events.add.title',
      description: 'platform.facebook.settings.events.add.description',
      fields: [
        {
          name: 'eventId',
          type: 'text',
          label: 'platform.facebook.settings.events.form.eventId',
          placeholder: 'platform.facebook.settings.events.form.eventIdPlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.facebook.validation.eventIdRequired' }
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
          label: 'platform.facebook.settings.events.form.eventName',
          placeholder: 'platform.facebook.settings.events.form.eventNamePlaceholder',
          required: true,
          validation: [
            { type: 'required', message: 'platform.facebook.validation.eventNameRequired' }
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
    pageId: {
      baseField: 'pageId',
      baseFieldLabel: 'platform.facebook.settings.pages.form.pageId',
      baseFieldValidation: [
        { type: 'required', message: 'platform.facebook.validation.pageIdRequired' }
      ],
      customFields: [
        {
          name: 'pageName',
          type: 'text',
          label: 'platform.facebook.settings.pages.form.pageName',
          required: true,
          ui: { width: 12, order: 1 }
        },
        {
          name: 'pageUrl',
          type: 'url',
          label: 'platform.facebook.settings.pages.form.pageUrl',
          required: false,
          ui: { width: 12, order: 2 }
        },
        {
          name: 'category',
          type: 'select',
          label: 'platform.facebook.settings.common.category',
          required: false,
          options: [
            { label: 'platform.facebook.settings.categories.business', value: 'business' },
            { label: 'platform.facebook.settings.categories.entertainment', value: 'entertainment' },
            { label: 'platform.facebook.settings.categories.event', value: 'event' }
          ],
          ui: { width: 12, order: 3 }
        }
      ],
      supportsGroups: false
    }
  }
}
