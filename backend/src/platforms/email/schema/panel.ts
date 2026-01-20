/**
 * Email Panel Schema
 * 
 * Defines the panel structure for email platform features.
 * This is NOT for settings/credentials (those are in settings.ts).
 * 
 * Uses schema-driven fields that are rendered by SchemaRenderer.
 * All data comes from backend API endpoints.
 * 
 * @module platforms/email/schema/panel
 */

import { PanelSchema } from '../../../types/platformSchema.js'

export const emailPanelSchema: PanelSchema = {
  version: '2.0.0',
  title: 'Email Recipients',
  description: 'Manage email recipients and groups for event announcements',
  tabs: [
    {
      id: 'targets',
      label: 'Empfänger',
      sections: ['target-list', 'add-target', 'edit-target']
    },
    {
      id: 'groups',
      label: 'Gruppen',
      sections: ['group-management']
    },
    {
      id: 'personalization',
      label: 'Personalisierung',
      sections: ['personalization-settings']
    }
  ],
  sections: [
    {
      id: 'target-list',
      title: 'Email-Empfänger',
      description: 'Verwaltung der Email-Empfänger',
      fields: [
        {
          name: 'targets',
          type: 'target-list',
          label: 'Empfänger',
          description: 'Liste aller Email-Empfänger mit Custom Fields',
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
      title: 'Neue Email hinzufügen',
      description: 'Füge eine neue Email-Adresse mit optionalen Custom Fields hinzu',
      fields: [
        {
          name: 'email',
          type: 'text',
          label: 'Email-Adresse',
          placeholder: 'z.B. events@venue.de',
          required: true,
          validation: [
            { type: 'required', message: 'Email-Adresse ist erforderlich' },
            { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Bitte gültige Email-Adresse eingeben' }
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
          name: 'name',
          type: 'text',
          label: 'Name',
          placeholder: 'z.B. Max Mustermann',
          required: false,
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'birthday',
          type: 'date',
          label: 'Geburtstag',
          required: false,
          ui: {
            width: 6,
            order: 3
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
            order: 4
          }
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Telefon',
          placeholder: 'z.B. +49 123 456789',
          required: false,
          validation: [
            { type: 'pattern', value: '^[\\d\\s\\+\\-\\(\\)]+$', message: 'Ungültiges Telefonnummer-Format' }
          ],
          ui: {
            width: 12,
            order: 5
          }
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags',
          required: false,
          options: [],
          ui: {
            width: 12,
            order: 6
          }
        }
      ]
    },
    {
      id: 'edit-target',
      title: 'Empfänger bearbeiten',
      description: 'Bearbeite einen bestehenden Empfänger',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Empfänger auswählen',
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
      title: 'Email-Gruppen',
      description: 'Verwaltung von Email-Gruppen mit Target-IDs',
      fields: [
        {
          name: 'groupName',
          type: 'text',
          label: 'Gruppenname',
          placeholder: 'z.B. VIPs, Newsletter, etc.',
          required: false,
          ui: {
            width: 6,
            order: 1
          }
        },
        {
          name: 'groupTargets',
          type: 'multiselect',
          label: 'Empfänger auswählen',
          description: 'Wähle die Empfänger für diese Gruppe',
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
      id: 'personalization-settings',
      title: 'Personalisierungs-Einstellungen',
      description: 'Konfiguriere Personalisierung für Email-Templates',
      fields: [
        {
          name: 'usePersonalization',
          type: 'boolean',
          label: 'Personalisierung aktivieren',
          description: 'Aktiviere die Verwendung von Custom Fields in Templates',
          default: false,
          ui: {
            width: 12,
            order: 1
          }
        },
        {
          name: 'personalizationFields',
          type: 'multiselect',
          label: 'Zu verwendende Felder',
          description: 'Wähle welche Custom Fields in Templates verwendet werden sollen',
          required: false,
          options: [
            { label: 'Name', value: 'name' },
            { label: 'Geburtstag', value: 'birthday' },
            { label: 'Firma', value: 'company' },
            { label: 'Telefon', value: 'phone' }
          ],
          visibleWhen: {
            field: 'usePersonalization',
            operator: 'equals',
            value: true
          },
          ui: {
            width: 12,
            order: 2
          }
        }
      ]
    }
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
        validation: [
          { type: 'pattern', value: '^[\\d\\s\\+\\-\\(\\)]+$', message: 'Invalid phone number format' }
        ],
        ui: { width: 12, order: 4 }
      },
      {
        name: 'tags',
        type: 'multiselect',
        label: 'Tags',
        required: false,
        options: [],
        ui: { width: 12, order: 5 }
      }
    ],
    supportsGroups: true
  }
}

