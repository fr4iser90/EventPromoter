/**
 * Email Settings Schema
 * 
 * Defines the settings structure for email platform features (formerly Panel).
 * This is NOT for credentials (those are in credentials.ts).
 * 
 * Uses schema-driven fields that are rendered by SchemaRenderer.
 * All data comes from backend API endpoints.
 * 
 * @module platforms/email/schema/settings
 */

import { SettingsSchema } from '@/types/schema/index.js'

export const emailSettingsSchema: SettingsSchema = {
  id: 'email-settings-schema',
  version: '2.0.0',
  title: 'platform.email.settings.title',
  description: 'platform.email.settings.description',
  sections: [
    {
      id: 'target-list',
      title: 'platform.email.settings.recipients.title',
      description: 'platform.email.settings.recipients.description',
      fields: [
        {
          name: 'recipientSearch',
          type: 'text',
          label: 'platform.email.settings.recipients.searchLabel',
          placeholder: 'platform.email.settings.recipients.searchPlaceholder',
          ui: {
            width: 9,
            order: 1,
            isFilterFor: 'targets' // Link search to table
          }
        },
        {
          name: 'newRecipientButton',
          type: 'button',
          label: 'platform.email.settings.recipients.newButton',
          action: {
            id: 'new-recipient-action',
            type: 'open-edit-modal',
            schemaId: 'editRecipientSchema',
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
          label: 'platform.email.settings.recipients.table.emailAddress',
          description: 'platform.email.settings.recipients.table.description',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'targets'
          },
          ui: {
            width: 12,
            order: 3,
            renderAsTable: true,
            tableColumns: [
              {
                id: 'email',
                label: 'platform.email.settings.recipients.table.emailAddress',
                clickable: true,
                        action: {
                          id: 'email-edit-action',
                          type: 'open-edit-modal',
                          schemaId: 'editRecipientSchema',
                          dataEndpoint: 'platforms/:platformId/targets/:id',
                          saveEndpoint: 'platforms/:platformId/targets/:id',
                          method: 'PUT',
                          onSuccess: 'reload'
                        }
              },
              { id: 'firstName', label: 'platform.email.settings.recipients.table.firstName' },
              { id: 'lastName', label: 'platform.email.settings.recipients.table.lastName' },
              { id: 'birthday', label: 'platform.email.settings.recipients.table.birthday', type: 'date' }
            ]
          }
        }
      ]
    },
    {
      id: 'group-management',
      title: 'platform.email.settings.groups.title',
      description: 'platform.email.settings.groups.description',
      fields: [
        {
          name: 'groupSearch',
          type: 'text',
          label: 'platform.email.settings.groups.searchLabel',
          placeholder: 'platform.email.settings.groups.searchPlaceholder',
          ui: {
            width: 9,
            order: 1,
            isFilterFor: 'groupsOverview' // Link search to table
          }
        },
        {
          name: 'newGroupButton',
          type: 'button',
          label: 'platform.email.settings.groups.newButton',
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
          label: 'platform.email.settings.groups.table.groupName',
          description: 'platform.email.settings.groups.table.description',
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
                label: 'platform.email.settings.groups.table.groupName',
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
                label: 'platform.email.settings.groups.table.members',
                type: 'number'
              },
              {
                id: 'memberValues',
                label: 'platform.email.settings.groups.table.members',
                type: 'text'
              }
            ]
          }
        }
      ]
    },
  ],
  targetSchemas: {
    email: {
      baseField: 'email',
      baseFieldLabel: 'platform.email.settings.targetSchemas.email.baseFieldLabel',
      baseFieldValidation: [
        { type: 'required', message: 'platform.email.validation.emailRequired' },
        { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'platform.email.validation.invalidEmailFormat' }
      ],
      customFields: [
        {
          name: 'name',
          type: 'text',
          label: 'platform.email.settings.targetSchemas.email.customFields.name',
          required: false,
          ui: { width: 12, order: 1 }
        },
        {
          name: 'birthday',
          type: 'date',
          label: 'platform.email.settings.targetSchemas.email.customFields.birthday',
          required: false,
          ui: { width: 6, order: 2 }
        },
        {
          name: 'company',
          type: 'text',
          label: 'platform.email.settings.targetSchemas.email.customFields.company',
          required: false,
          ui: { width: 12, order: 3 }
        },
        {
          name: 'phone',
          type: 'text',
          label: 'platform.email.settings.targetSchemas.email.customFields.phone',
          required: false,
          ui: { width: 12, order: 4 }
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'platform.email.settings.targetSchemas.email.customFields.tags',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/tags',
            method: 'GET',
            responsePath: 'tags'
          },
          ui: { width: 12, order: 5 }
        }
      ],
      supportsGroups: true
    }
  }
}
