/**
 * Twitter Templates
 * 
 * Centralized template exports and utilities for the Twitter platform.
 * 
 * @module platforms/twitter/templates
 */

// Import and export types
import type { EventTemplate } from './types.js'
export type { EventTemplate } from './types.js'

// Import templates first
import { basicEventAnnouncementTemplate } from './basic-event-announcement.js'
import { professionalEventAnnouncementTemplate } from './professional-event-announcement.js'
import { eventAnnouncementTemplate } from './event-announcement.js'
import { djEventPromotionTemplate } from './dj-event-promotion.js'
import { ticketReminderTemplate } from './ticket-reminder.js'
import { afterpartyAnnouncementTemplate } from './afterparty-announcement.js'

// Export individual templates
export { basicEventAnnouncementTemplate } from './basic-event-announcement.js'
export { professionalEventAnnouncementTemplate } from './professional-event-announcement.js'
export { eventAnnouncementTemplate } from './event-announcement.js'
export { djEventPromotionTemplate } from './dj-event-promotion.js'
export { ticketReminderTemplate } from './ticket-reminder.js'
export { afterpartyAnnouncementTemplate } from './afterparty-announcement.js'

// Main templates array
export const TWITTER_TEMPLATES: EventTemplate[] = [
  basicEventAnnouncementTemplate,
  professionalEventAnnouncementTemplate,
  eventAnnouncementTemplate,
  djEventPromotionTemplate,
  ticketReminderTemplate,
  afterpartyAnnouncementTemplate
]

// Template utility functions
export function getTemplatesByCategory(category: string): EventTemplate[] {
  return TWITTER_TEMPLATES.filter(template => template.category === category)
}

export function getTemplateById(id: string): EventTemplate | undefined {
  return TWITTER_TEMPLATES.find(template => template.id === id)
}

export function renderTemplate(template: EventTemplate, variables: Record<string, string>): string {
  let result = template.template

  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }

  return result
}

