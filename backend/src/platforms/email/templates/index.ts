/**
 * Email Templates
 * 
 * Centralized template exports and utilities for the Email platform.
 * 
 * @module platforms/email/templates
 */

// Template type definition
export interface EmailTemplate {
  id: string
  name: string
  template: {
    subject: string
    html: string
  }
  category: string
  variables: string[]
}

// Import templates first
import { basicEventAnnouncementTemplate } from './basic-event-announcement'
import { professionalEventAnnouncementTemplate } from './professional-event-announcement'
import { eventAnnouncementTemplate } from './event-announcement'
import { lastMinuteTicketsTemplate } from './last-minute-tickets'
import { eventReminderTemplate } from './event-reminder'

// Export individual templates
export { basicEventAnnouncementTemplate } from './basic-event-announcement'
export { professionalEventAnnouncementTemplate } from './professional-event-announcement'
export { eventAnnouncementTemplate } from './event-announcement'
export { lastMinuteTicketsTemplate } from './last-minute-tickets'
export { eventReminderTemplate } from './event-reminder'

// Main templates array
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  basicEventAnnouncementTemplate,
  professionalEventAnnouncementTemplate,
  eventAnnouncementTemplate,
  lastMinuteTicketsTemplate,
  eventReminderTemplate
]

// Template utility functions
export function getTemplatesByCategory(category: string): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter(template => template.category === category)
}

export function getTemplateById(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find(template => template.id === id)
}

export function renderTemplate(template: EmailTemplate, variables: Record<string, string>): { subject: string, html: string } {
  let subject = template.template.subject
  let html = template.template.html

  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g')
    subject = subject.replace(regex, value)
    html = html.replace(regex, value)
  }

  return { subject, html }
}

export function createUnsubscribeLink(userId: string, emailId: string): string {
  return `https://yourapp.com/unsubscribe?user=${userId}&email=${emailId}`
}

export function createEventLink(eventId: string): string {
  return `https://yourapp.com/events/${eventId}`
}
