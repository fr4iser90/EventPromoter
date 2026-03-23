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
  title: 'platform.email.template.title',
  description: 'platform.email.template.description',
  defaultStructure: {
    subject: {
      label: 'platform.email.template.subject.label',
      type: 'text',
      default: 'platform.email.template.subject.default',
      placeholder: 'platform.email.template.common.dynamicPlaceholder',
      required: true,
      description: 'platform.email.template.subject.description'
    },
    html: {
      label: 'platform.email.template.html.label',
      type: 'html',
      default: 'platform.email.template.html.default',
      placeholder: 'platform.email.template.common.dynamicPlaceholder',
      required: true,
      description: 'platform.email.template.html.description'
    },
    image: {
      label: 'platform.email.template.image.label',
      type: 'image',
      default: '{image}',
      placeholder: 'platform.email.template.common.dynamicPlaceholder',
      required: false,
      description: 'platform.email.template.image.description'
    }
  },
  variables: [
    {
      name: 'eventTitle',
      label: 'platform.email.template.variables.eventTitle.label',
      description: 'platform.email.template.variables.eventTitle.description',
      type: 'string'
    },
    {
      name: 'description',
      label: 'platform.email.template.variables.description.label',
      description: 'platform.email.template.variables.description.description',
      type: 'string'
    },
    {
      name: 'date',
      label: 'platform.email.template.variables.date.label',
      description: 'platform.email.template.variables.date.description',
      type: 'date'
    },
    {
      name: 'time',
      label: 'platform.email.template.variables.time.label',
      description: 'platform.email.template.variables.time.description',
      type: 'string'
    },
    {
      name: 'venue',
      label: 'platform.email.template.variables.venue.label',
      description: 'platform.email.template.variables.venue.description',
      type: 'string'
    },
    {
      name: 'city',
      label: 'platform.email.template.variables.city.label',
      description: 'platform.email.template.variables.city.description',
      type: 'string'
    },
    {
      name: 'salutation',
      label: 'platform.email.template.variables.salutation.label',
      description: 'platform.email.template.variables.salutation.description',
      type: 'string'
    },
    {
      name: 'target.firstName',
      label: 'platform.email.template.variables.targetFirstName.label',
      description: 'platform.email.template.variables.targetFirstName.description',
      type: 'string'
    },
    {
      name: 'target.lastName',
      label: 'platform.email.template.variables.targetLastName.label',
      description: 'platform.email.template.variables.targetLastName.description',
      type: 'string'
    }
  ],
  variableDefinitions: [
    {
      name: 'title',
      canonicalName: 'title',
      aliases: ['eventTitle', 'name'],
      label: 'event.title',
      description: 'platform.email.template.variableDefinitions.title.description',
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
      description: 'platform.email.template.variableDefinitions.description.description',
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
      description: 'platform.email.template.variableDefinitions.price.description',
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
      name: 'image',
      canonicalName: 'image',
      aliases: ['img1', 'image1'],
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
      label: 'platform.email.template.categories.announcement.label',
      description: 'platform.email.template.categories.announcement.description'
    },
    {
      id: 'reminder',
      label: 'platform.email.template.categories.reminder.label',
      description: 'platform.email.template.categories.reminder.description'
    },
    {
      id: 'follow-up',
      label: 'platform.email.template.categories.followUp.label',
      description: 'platform.email.template.categories.followUp.description'
    }
  ],
  validation: {
    requiredFields: ['subject', 'html'],
    variablePattern: '\\{[^}]+\\}'
  }
}

