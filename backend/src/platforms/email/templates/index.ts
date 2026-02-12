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
  description?: string
  template: {
    subject: string
    html: string
  }
  translations?: {
    de?: {
      subject: string
      html: string
      name?: string
      description?: string
    }
    es?: {
      subject: string
      html: string
      name?: string
      description?: string
    }
  }
  /** Optional default locale for this template (overrides user language preference) */
  defaultLocale?: 'en' | 'de' | 'es'
  category: string // Category ID from TEMPLATE_CATEGORIES
  variables: string[]
  variableDefinitions?: Array<{
    name: string
    canonicalName?: string
    aliases?: string[]
    label: string
    description?: string
    type?: 'string' | 'date' | 'number' | 'url' | 'image'
    source?: 'parsed' | 'parsed_optional' | 'manual' | 'target' | 'computed'
    parsedField?: string
    editable?: boolean
    showWhenEmpty?: boolean
    icon?: string
    defaultValue?: string
  }>
  /** Optional: Target fields that must exist on selected targets (e.g., ['name', 'firstName']) */
  requiredTargetFields?: string[]
  createdAt?: string
  updatedAt?: string
}

// Import templates first
import { basicEventAnnouncementTemplate } from './basic-event-announcement.js'
import { professionalEventAnnouncementTemplate } from './professional-event-announcement.js'
import { eventAnnouncementTemplate } from './event-announcement.js'
import { lastMinuteTicketsTemplate } from './last-minute-tickets.js'
import { eventReminderTemplate } from './event-reminder.js'
import { personalInvitationTemplate } from './personal-invitation.js'

// Export individual templates
export { basicEventAnnouncementTemplate } from './basic-event-announcement.js'
export { professionalEventAnnouncementTemplate } from './professional-event-announcement.js'
export { eventAnnouncementTemplate } from './event-announcement.js'
export { lastMinuteTicketsTemplate } from './last-minute-tickets.js'
export { eventReminderTemplate } from './event-reminder.js'
export { personalInvitationTemplate } from './personal-invitation.js'

// Main templates array
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  basicEventAnnouncementTemplate,
  professionalEventAnnouncementTemplate,
  eventAnnouncementTemplate,
  lastMinuteTicketsTemplate,
  eventReminderTemplate,
  personalInvitationTemplate
]

// Template utility functions
export function getTemplatesByCategory(category: string): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter(template => template.category === category)
}

export function getTemplateById(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find(template => template.id === id)
}

export function renderTemplate(
  template: EmailTemplate, 
  variables: Record<string, string>,
  locale?: 'en' | 'de' | 'es'
): { subject: string, html: string } {
  // If locale not provided, use template default or 'en'
  const templateLocale = locale || template.defaultLocale || 'en'
  
  // Get template content based on locale
  let templateContent = template.template
  
  if (templateLocale !== 'en' && template.translations?.[templateLocale]) {
    templateContent = template.translations[templateLocale]
  }

  let subject = templateContent.subject
  let html = templateContent.html

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

/**
 * Extract locale from target or group
 * 
 * @param targetOrGroup - Target or Group object
 * @returns Locale if found, undefined otherwise
 */
export function extractLocaleFromTargetOrGroup(targetOrGroup: any): 'en' | 'de' | 'es' | undefined {
  if (!targetOrGroup) return undefined

  // Check direct locale field
  if (targetOrGroup.locale && ['en', 'de', 'es'].includes(targetOrGroup.locale)) {
    return targetOrGroup.locale
  }

  // Check metadata.locale
  if (targetOrGroup.metadata?.locale && ['en', 'de', 'es'].includes(targetOrGroup.metadata.locale)) {
    return targetOrGroup.metadata.locale
  }

  return undefined
}

/**
 * Resolve locale for email template rendering
 * Priority: emailLocale > targetLocale > groupLocale > template.defaultLocale > userLanguage > 'en'
 * 
 * @param options - Locale resolution options
 * @returns Resolved locale
 */
export function resolveTemplateLocale(options: {
  emailLocale?: 'en' | 'de' | 'es'
  targetLocale?: 'en' | 'de' | 'es'
  groupLocale?: 'en' | 'de' | 'es'
  template?: EmailTemplate
  userLanguage?: string
}): 'en' | 'de' | 'es' {
  const { emailLocale, targetLocale, groupLocale, template, userLanguage } = options

  // Priority 1: Email-level locale (highest priority)
  if (emailLocale && ['en', 'de', 'es'].includes(emailLocale)) {
    return emailLocale
  }

  // Priority 2: Target-level locale
  if (targetLocale && ['en', 'de', 'es'].includes(targetLocale)) {
    return targetLocale
  }

  // Priority 3: Group-level locale
  if (groupLocale && ['en', 'de', 'es'].includes(groupLocale)) {
    return groupLocale
  }

  // Priority 4: Template default locale
  if (template?.defaultLocale && ['en', 'de', 'es'].includes(template.defaultLocale)) {
    return template.defaultLocale
  }

  // Priority 5: User language preference
  if (userLanguage) {
    // Normalize language code (e.g., 'de-DE' -> 'de', 'en-US' -> 'en')
    const normalized = userLanguage.toLowerCase().split('-')[0]
    if (['en', 'de', 'es'].includes(normalized)) {
      return normalized as 'en' | 'de' | 'es'
    }
  }

  // Default: English
  return 'en'
}
