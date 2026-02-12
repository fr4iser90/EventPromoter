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
  variableDefinitions: [
    {
      name: 'title',
      canonicalName: 'title',
      aliases: ['eventTitle', 'name'],
      label: 'event.title',
      description: 'Canonical event title variable',
      type: 'string',
      source: 'parsed',
      parsedField: 'title',
      editable: true,
      showWhenEmpty: true,
      icon: '🎉'
    },
    {
      name: 'description',
      canonicalName: 'description',
      aliases: ['desc', 'text'],
      label: 'event.description',
      description: 'Main event description',
      type: 'string',
      source: 'parsed_optional',
      parsedField: 'description',
      editable: true,
      showWhenEmpty: true,
      icon: '📝'
    },
    {
      name: 'date',
      canonicalName: 'date',
      aliases: ['eventDate'],
      label: 'event.date',
      type: 'date',
      source: 'parsed_optional',
      parsedField: 'date',
      editable: true,
      showWhenEmpty: true,
      icon: '📅'
    },
    {
      name: 'time',
      canonicalName: 'time',
      aliases: ['eventTime'],
      label: 'event.time',
      type: 'string',
      source: 'parsed_optional',
      parsedField: 'time',
      editable: true,
      showWhenEmpty: true,
      icon: '🕒'
    },
    {
      name: 'venue',
      canonicalName: 'venue',
      aliases: ['location'],
      label: 'event.venue',
      type: 'string',
      source: 'parsed_optional',
      parsedField: 'venue',
      editable: true,
      showWhenEmpty: true,
      icon: '📍'
    },
    {
      name: 'city',
      canonicalName: 'city',
      label: 'event.city',
      type: 'string',
      source: 'parsed_optional',
      parsedField: 'city',
      editable: true,
      showWhenEmpty: true,
      icon: '🏙️'
    },
    {
      name: 'price',
      canonicalName: 'price',
      aliases: ['ticketPrice'],
      label: 'event.price',
      description: 'Optional parsed price; can always be manually set',
      type: 'string',
      source: 'parsed_optional',
      parsedField: 'price',
      editable: true,
      showWhenEmpty: true,
      icon: '💰'
    },
    {
      name: 'lineup',
      canonicalName: 'lineup',
      aliases: ['performers', 'artists'],
      label: 'event.lineup',
      type: 'string',
      source: 'parsed_optional',
      parsedField: 'lineup',
      editable: true,
      showWhenEmpty: true,
      icon: '🎤'
    },
    {
      name: 'website',
      canonicalName: 'website',
      aliases: ['url', 'link'],
      label: 'event.website',
      type: 'url',
      source: 'parsed_optional',
      parsedField: 'website',
      editable: true,
      showWhenEmpty: true,
      icon: '🔗'
    },
    {
      name: 'organizer',
      canonicalName: 'organizer',
      aliases: ['organiser'],
      label: 'event.organizer',
      type: 'string',
      source: 'parsed_optional',
      parsedField: 'organizer',
      editable: true,
      showWhenEmpty: true,
      icon: '👤'
    },
    {
      name: 'img1',
      canonicalName: 'img1',
      aliases: ['image1'],
      label: 'event.primaryImage',
      type: 'image',
      source: 'computed',
      editable: true,
      showWhenEmpty: true,
      icon: '📌'
    },
    {
      name: 'target.firstName',
      canonicalName: 'target.firstName',
      label: 'platform.email.variables.target.firstName',
      type: 'string',
      source: 'target',
      editable: false,
      showWhenEmpty: false,
      icon: '🪪'
    },
    {
      name: 'target.lastName',
      canonicalName: 'target.lastName',
      label: 'platform.email.variables.target.lastName',
      type: 'string',
      source: 'target',
      editable: false,
      showWhenEmpty: false,
      icon: '🪪'
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

