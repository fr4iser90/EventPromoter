// Email content templates

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

import { eventAnnouncementTemplate, lastMinuteTicketsTemplate, eventReminderTemplate } from './templates/index';

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  eventAnnouncementTemplate,
  lastMinuteTicketsTemplate,
  eventReminderTemplate
]

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
