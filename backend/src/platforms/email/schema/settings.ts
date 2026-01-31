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

import { SettingsSchema } from '@/types/schema'

export const emailSettingsSchema: SettingsSchema = {
  id: 'email-settings-schema',
  version: '2.0.0',
  title: 'Management of Email Recipients and Groups',
  description: 'Management of Email Recipients and Groups',
  sections: [
    {
      id: 'target-list',
      title: 'Management of Your Email Recipients',
      description: 'Management of Your Email Recipients',
      fields: [
        {
          name: 'recipientSearch',
          type: 'text',
          label: 'Search recipients...',
          placeholder: 'Search recipients...',
          ui: {
            width: 9,
            order: 1,
            isFilterFor: 'targets' // Link search to table
          }
        },
        {
          name: 'newRecipientButton',
          type: 'button',
          label: '+ New Recipient',
          action: {
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
          label: 'Email Address',
          description: 'Overview of all email recipients with details.',
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
                label: 'Email Address',
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
              { id: 'firstName', label: 'First Name' },
              { id: 'lastName', label: 'Last Name' },
              { id: 'birthday', label: 'Birthday', type: 'date' }
            ]
          }
        }
      ]
    },
    {
      id: 'group-management',
      title: 'Management of Your Email Groups',
      description: 'Management of Your Email Groups',
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
          description: 'Overview of all email groups and their member counts.',
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
              }
            ]
          }
        }
      ]
    },
  ],
  targetSchema: {
    baseField: 'email',
    baseFieldLabel: 'Email-Adresse',
    baseFieldValidation: [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Invalid email format' }
    ],
    customFields: [
      {
        name: 'name',
        type: 'text',
        label: 'Name',
        required: false,
        ui: { width: 12, order: 1 }
      },
      {
        name: 'birthday',
        type: 'date',
        label: 'Geburtstag',
        required: false,
        ui: { width: 6, order: 2 }
      },
      {
        name: 'company',
        type: 'text',
        label: 'Firma',
        required: false,
        ui: { width: 12, order: 3 }
      },
      {
        name: 'phone',
        type: 'text',
        label: 'Telefon',
        required: false,
        ui: { width: 12, order: 4 }
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
        ui: { width: 12, order: 5 }
      }
    ],
    supportsGroups: true
  }
}
