/**
 * Twitter Templates
 * 
 * Centralized template exports and utilities for the Twitter platform.
 * 
 * @module platforms/twitter/templates
 */

// Export types
export type { EventTemplate } from './types'

// Import templates first
import { basicEventAnnouncementTemplate } from './basic-event-announcement'
import { professionalEventAnnouncementTemplate } from './professional-event-announcement'
import { eventAnnouncementTemplate } from './event-announcement'
import { djEventPromotionTemplate } from './dj-event-promotion'
import { ticketReminderTemplate } from './ticket-reminder'
import { afterpartyAnnouncementTemplate } from './afterparty-announcement'

// Export individual templates
export { basicEventAnnouncementTemplate } from './basic-event-announcement'
export { professionalEventAnnouncementTemplate } from './professional-event-announcement'
export { eventAnnouncementTemplate } from './event-announcement'
export { djEventPromotionTemplate } from './dj-event-promotion'
export { ticketReminderTemplate } from './ticket-reminder'
export { afterpartyAnnouncementTemplate } from './afterparty-announcement'

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

