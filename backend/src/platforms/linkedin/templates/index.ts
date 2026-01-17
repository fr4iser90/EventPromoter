/**
 * LinkedIn Templates
 * 
 * Centralized template exports and utilities for the LinkedIn platform.
 * 
 * @module platforms/linkedin/templates
 */

// Import and export types
import type { LinkedInTemplate } from './types.js'
export type { LinkedInTemplate } from './types.js'

// Import templates first
import { basicEventAnnouncementTemplate } from './basic-event-announcement.js'
import { professionalEventAnnouncementTemplate } from './professional-event-announcement.js'
import { eventAnnouncementTemplate } from './event-announcement.js'

// Export individual templates
export { basicEventAnnouncementTemplate } from './basic-event-announcement.js'
export { professionalEventAnnouncementTemplate } from './professional-event-announcement.js'
export { eventAnnouncementTemplate } from './event-announcement.js'

// Main templates array
export const LINKEDIN_TEMPLATES: LinkedInTemplate[] = [
  basicEventAnnouncementTemplate,
  professionalEventAnnouncementTemplate,
  eventAnnouncementTemplate
]

// Template utility functions
export function getTemplatesByCategory(category: string): LinkedInTemplate[] {
  return LINKEDIN_TEMPLATES.filter(template => template.category === category)
}

export function getTemplateById(id: string): LinkedInTemplate | undefined {
  return LINKEDIN_TEMPLATES.find(template => template.id === id)
}

export function renderTemplate(template: LinkedInTemplate, variables: Record<string, string>): string {
  let result = template.template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return result
}

