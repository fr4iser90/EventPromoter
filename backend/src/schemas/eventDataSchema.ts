/**
 * Event Data Schema Definition
 * 
 * Defines the structure for extensible event data fields:
 * - Ticket Information (Presale, Box Office)
 * - Contact Information
 * - Social Media Links
 * - Additional Information
 * 
 * @module schemas/eventDataSchema
 */

import { EventDataSchema } from '../types/schema/eventData.js'

export const eventDataSchema: EventDataSchema = {
  version: '1.0.0',
  groups: [
    {
      id: 'ticketInfo',
      label: 'Ticket-Informationen',
      icon: '🎫',
      collapsible: true,
      defaultExpanded: false,
      variablePrefix: 'ticket',
      showWhenEmpty: true,
      fields: [
        {
          id: 'presale',
          type: 'group',
          label: 'Vorkasse / Presale',
          fields: [
            {
              id: 'price',
              type: 'text',
              label: 'Preis',
              placeholder: 'z.B. 25€',
              ui: { width: 12 }
            },
            {
              id: 'url',
              type: 'url',
              label: 'Ticket-URL',
              placeholder: 'https://...',
              ui: { width: 12 }
            },
            {
              id: 'available',
              type: 'boolean',
              label: 'Vorkasse verfügbar',
              default: true,
              ui: { width: 12 }
            },
            {
              id: 'until',
              type: 'date',
              label: 'Verfügbar bis',
              ui: { width: 12 }
            }
          ]
        },
        {
          id: 'boxOffice',
          type: 'group',
          label: 'Abendkasse / Box Office',
          fields: [
            {
              id: 'price',
              type: 'text',
              label: 'Preis',
              placeholder: 'z.B. 30€',
              ui: { width: 12 }
            },
            {
              id: 'available',
              type: 'boolean',
              label: 'Abendkasse verfügbar',
              default: true,
              ui: { width: 12 }
            },
            {
              id: 'note',
              type: 'textarea',
              label: 'Hinweis',
              placeholder: 'z.B. Teurer als Vorkasse',
              ui: { width: 12 }
            }
          ]
        },
        {
          id: 'info',
          type: 'textarea',
          label: 'Allgemeine Ticket-Informationen',
          placeholder: 'Zusätzliche Infos zu Tickets...',
          description: 'Wird in Templates als {ticketInfo} verfügbar sein',
          ui: { width: 12 }
        },
        {
          id: 'url',
          type: 'url',
          label: 'Ticket-URL (Allgemein)',
          placeholder: 'https://tickets.example.com',
          ui: { width: 12 }
        }
      ]
    },
    {
      id: 'contactInfo',
      label: 'Kontakt-Informationen',
      icon: '📞',
      collapsible: true,
      defaultExpanded: false,
      showWhenEmpty: true,
      fields: [
        {
          id: 'email',
          type: 'email',
          label: 'E-Mail',
          placeholder: 'info@example.com',
          ui: { width: 12 }
        },
        {
          id: 'phone',
          type: 'tel',
          label: 'Telefon',
          placeholder: '+49 341 1234567',
          ui: { width: 12 }
        },
        {
          id: 'contactPerson',
          type: 'text',
          label: 'Ansprechpartner',
          placeholder: 'Max Mustermann',
          ui: { width: 12 }
        }
      ]
    },
    {
      id: 'socialMedia',
      label: 'Social Media Links',
      icon: '📱',
      collapsible: true,
      defaultExpanded: false,
      showWhenEmpty: true,
      fields: [
        {
          id: 'facebook',
          type: 'url',
          label: 'Facebook Event',
          placeholder: 'https://facebook.com/events/...',
          ui: { width: 12 }
        },
        {
          id: 'instagram',
          type: 'url',
          label: 'Instagram Post',
          placeholder: 'https://instagram.com/p/...',
          ui: { width: 12 }
        },
        {
          id: 'twitter',
          type: 'url',
          label: 'Twitter/X',
          placeholder: 'https://twitter.com/status/...',
          ui: { width: 12 }
        }
      ]
    },
    {
      id: 'additionalInfo',
      label: 'Zusätzliche Informationen',
      icon: 'ℹ️',
      collapsible: true,
      defaultExpanded: false,
      showWhenEmpty: true,
      fields: [
        {
          id: 'ageRestriction',
          type: 'text',
          label: 'Altersbeschränkung',
          placeholder: '18+',
          ui: { width: 6 }
        },
        {
          id: 'dressCode',
          type: 'text',
          label: 'Dresscode',
          placeholder: 'Casual',
          ui: { width: 6 }
        },
        {
          id: 'parking',
          type: 'textarea',
          label: 'Parkmöglichkeiten',
          placeholder: 'Kostenlose Parkplätze verfügbar',
          ui: { width: 12 }
        },
        {
          id: 'accessibility',
          type: 'textarea',
          label: 'Barrierefreiheit',
          placeholder: 'Rollstuhlgerechter Zugang vorhanden',
          ui: { width: 12 }
        }
      ]
    }
  ]
}
