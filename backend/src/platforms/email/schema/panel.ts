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
  version: '1.0.0',
  title: 'Email Recipients',
  description: 'Manage email recipients and groups for event announcements',
  tabs: [
    {
      id: 'recipients',
      label: 'Empfänger',
      sections: ['recipient-list', 'add-recipient']
    },
    {
      id: 'groups',
      label: 'Gruppen',
      sections: ['group-management']
    }
  ],
  sections: [
    {
      id: 'recipient-list',
      title: 'Email-Empfänger',
      description: 'Verwaltung der Email-Empfänger',
      fields: [
        {
          name: 'recipients',
          type: 'multiselect',
          label: 'Empfänger auswählen',
          description: 'Wähle die Email-Empfänger für diesen Versand',
          required: false,
          // ✅ GENERIC: Options come from backend API (already transformed)
          optionsSource: {
            endpoint: '/api/platforms/:platformId/recipients',
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
      id: 'add-recipient',
      title: 'Neue Email hinzufügen',
      description: 'Füge eine neue Email-Adresse zur Liste hinzu',
      fields: [
        {
          name: 'newEmail',
          type: 'text',
          label: 'Email-Adresse',
          placeholder: 'z.B. events@venue.de',
          required: false,
          validation: [
            { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Bitte gültige Email-Adresse eingeben' }
          ],
          // ✅ GENERIC: Action to add recipient via API
          action: {
            endpoint: '/api/platforms/:platformId/recipients',
            method: 'POST',
            trigger: 'submit',
            bodyMapping: { email: 'newEmail' },
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
      title: 'Email-Gruppen',
      description: 'Verwaltung von Email-Gruppen',
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
          name: 'groupEmails',
          type: 'textarea',
          label: 'Email-Adressen (komma-getrennt)',
          placeholder: 'email1@example.com, email2@example.com',
          required: false,
          validation: [
            { type: 'pattern', value: '^[^,]+(,[^,]+)*$', message: 'Komma-getrennte Email-Adressen erwartet' }
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
            endpoint: '/api/platforms/:platformId/recipient-groups',
            method: 'POST',
            trigger: 'submit',
            bodyMapping: {
              groupName: 'groupName',
              emails: 'groupEmails'
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

