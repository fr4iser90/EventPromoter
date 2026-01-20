/**
 * Instagram Panel Schema
 * 
 * Defines the panel structure for Instagram platform features.
 * This is NOT for settings/credentials (those are in settings.ts).
 * 
 * Uses schema-driven fields that are rendered by SchemaRenderer.
 * All data comes from backend API endpoints.
 * 
 * @module platforms/instagram/schema/panel
 */

import { PanelSchema } from '../../../types/platformSchema.js'

export const instagramPanelSchema: PanelSchema = {
  version: '1.0.0',
  title: 'Instagram Accounts, Hashtags & Locations',
  description: 'Manage Instagram accounts, hashtags, and locations for event posts',
  tabs: [
    {
      id: 'accounts',
      label: 'Accounts',
      sections: ['account-list', 'add-account', 'edit-account']
    },
    {
      id: 'hashtags',
      label: 'Hashtags',
      sections: ['hashtag-list', 'add-hashtag']
    },
    {
      id: 'locations',
      label: 'Locations',
      sections: ['location-list', 'add-location']
    }
  ],
  sections: [
    {
      id: 'account-list',
      title: 'Instagram-Accounts',
      description: 'Verwaltung der Instagram-Accounts',
      fields: [
        {
          name: 'accounts',
          type: 'target-list',
          label: 'Accounts',
          description: 'Liste aller Instagram-Accounts',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=account',
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
      id: 'add-account',
      title: 'Neuen Account hinzufügen',
      description: 'Füge einen neuen Instagram-Account hinzu',
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'Instagram Username',
          placeholder: '@username oder username',
          required: true,
          validation: [
            { type: 'required', message: 'Instagram Username ist erforderlich' },
            { type: 'pattern', value: '^@?[a-zA-Z0-9_.]+$', message: 'Ungültiger Instagram Username' }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets?type=account',
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
          name: 'displayName',
          type: 'text',
          label: 'Anzeigename',
          placeholder: 'z.B. EventPromo',
          required: false,
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung',
          placeholder: 'z.B. Offizieller Account für Event-Promotion',
          required: false,
          ui: {
            width: 12,
            order: 3
          }
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'Aktiv',
          default: true,
          ui: {
            width: 6,
            order: 4
          }
        }
      ]
    },
    {
      id: 'edit-account',
      title: 'Account bearbeiten',
      description: 'Bearbeite einen bestehenden Instagram-Account',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Account auswählen',
          required: true,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=account',
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
      id: 'hashtag-list',
      title: 'Hashtags',
      description: 'Verwaltung der Hashtags',
      fields: [
        {
          name: 'hashtags',
          type: 'target-list',
          label: 'Hashtags',
          description: 'Liste aller Hashtags',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=hashtag',
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
      id: 'add-hashtag',
      title: 'Neuen Hashtag hinzufügen',
      description: 'Füge einen neuen Hashtag hinzu',
      fields: [
        {
          name: 'hashtag',
          type: 'text',
          label: 'Hashtag',
          placeholder: '#hashtag oder hashtag',
          required: true,
          validation: [
            { type: 'required', message: 'Hashtag ist erforderlich' },
            { type: 'pattern', value: '^#?[a-zA-Z0-9_]+$', message: 'Ungültiger Hashtag' }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets?type=hashtag',
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
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung',
          placeholder: 'z.B. Allgemeiner Hashtag für Events',
          required: false,
          ui: {
            width: 12,
            order: 2
          }
        }
      ]
    },
    {
      id: 'location-list',
      title: 'Locations',
      description: 'Verwaltung der Locations',
      fields: [
        {
          name: 'locations',
          type: 'target-list',
          label: 'Locations',
          description: 'Liste aller Locations',
          required: false,
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=location',
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
      id: 'add-location',
      title: 'Neue Location hinzufügen',
      description: 'Füge eine neue Location hinzu',
      fields: [
        {
          name: 'locationName',
          type: 'text',
          label: 'Location Name',
          placeholder: 'z.B. Werk 2',
          required: true,
          validation: [
            { type: 'required', message: 'Location Name ist erforderlich' }
          ],
          action: {
            endpoint: 'platforms/:platformId/targets?type=location',
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
          name: 'locationId',
          type: 'text',
          label: 'Instagram Location ID',
          placeholder: 'z.B. 123456789',
          required: false,
          ui: {
            width: 12,
            order: 2
          }
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Adresse',
          placeholder: 'z.B. Kochstraße 132, 04277 Leipzig',
          required: false,
          ui: {
            width: 12,
            order: 3
          }
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'username',
    baseFieldLabel: 'Instagram Username',
    baseFieldValidation: [
      { type: 'required', message: 'Username is required' },
      { type: 'pattern', value: '^@?[a-zA-Z0-9_.]+$', message: 'Invalid Instagram username' }
    ],
    customFields: [
      {
        name: 'displayName',
        type: 'text',
        label: 'Anzeigename',
        required: false,
        ui: { width: 12, order: 1 }
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Beschreibung',
        required: false,
        ui: { width: 12, order: 2 }
      }
    ],
    supportsGroups: false
  }
}
