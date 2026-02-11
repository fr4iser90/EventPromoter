/**
 * Email Platform Template Schema
 * 
 * Template configuration for the Email platform (structure, variables, categories, validation)
 * 
 * @module platforms/email/schema/template
 */

import { TemplateSchema } from '@/types/schema/index.js'

export const emailTemplateSchema: TemplateSchema = {
  version: '1.0.0',
  title: 'Email Templates',
  description: 'Manage email templates with variable placeholders',
  defaultStructure: {
    subject: {
      label: 'Email Subject',
      type: 'text',
      default: 'New Event: {title}',
      placeholder: 'Use {variable} for dynamic content',
      required: true,
      description: 'Email subject line template'
    },
    html: {
      label: 'Email HTML Content',
      type: 'html',
      default: '<h1>{title}</h1><p>{description}</p>',
      placeholder: 'Use {variable} for dynamic content',
      required: true,
      description: 'HTML email body template'
    }
  },
  variables: [
    {
      name: 'eventTitle',
      label: 'Event Title',
      description: 'The title of the event',
      type: 'string'
    },
    {
      name: 'description',
      label: 'Event Description',
      description: 'The event description',
      type: 'string'
    },
    {
      name: 'date',
      label: 'Event Date',
      description: 'The event date',
      type: 'date'
    },
    {
      name: 'time',
      label: 'Event Time',
      description: 'The event time',
      type: 'string'
    },
    {
      name: 'venue',
      label: 'Venue',
      description: 'The event venue',
      type: 'string'
    },
    {
      name: 'city',
      label: 'City',
      description: 'The event city',
      type: 'string'
    },
    {
      name: 'salutation',
      label: 'Personalized Salutation',
      description: 'Automatic salutation based on recipient metadata (e.g., "Hallo Max" or "Sehr geehrter Herr Müller")',
      type: 'string'
    },
    {
      name: 'target.firstName',
      label: 'Recipient First Name',
      description: 'First name of the recipient',
      type: 'string'
    },
    {
      name: 'target.lastName',
      label: 'Recipient Last Name',
      description: 'Last name of the recipient',
      type: 'string'
    }
  ],
  // Note: Categories are now loaded dynamically from templates with translations.
  // This is kept for documentation purposes only.
  // Actual categories and their translations come from template.categoryTranslations.
  categories: [
    {
      id: 'announcement',
      label: 'Announcement',
      description: 'Event announcements'
    },
    {
      id: 'reminder',
      label: 'Reminder',
      description: 'Event reminders'
    },
    {
      id: 'follow-up',
      label: 'Follow-up',
      description: 'Post-event follow-ups'
    }
  ],
  validation: {
    requiredFields: ['subject', 'html'],
    variablePattern: '\\{[^}]+\\}'
  }
}

