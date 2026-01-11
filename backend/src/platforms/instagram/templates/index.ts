/**
 * Instagram Templates
 * 
 * Centralized template exports and utilities for the Instagram platform.
 * 
 * @module platforms/instagram/templates
 */

// Import and export types
import type { InstagramTemplate } from './types'
export type { InstagramTemplate } from './types'

// Import templates first
import { basicEventAnnouncementTemplate } from './basic-event-announcement'
import { professionalEventAnnouncementTemplate } from './professional-event-announcement'
import { eventAnnouncementTemplate } from './event-announcement'

// Export individual templates
export { basicEventAnnouncementTemplate } from './basic-event-announcement'
export { professionalEventAnnouncementTemplate } from './professional-event-announcement'
export { eventAnnouncementTemplate } from './event-announcement'

// Main templates array
export const INSTAGRAM_TEMPLATES: InstagramTemplate[] = [
  basicEventAnnouncementTemplate,
  professionalEventAnnouncementTemplate,
  eventAnnouncementTemplate
]

// Template utility functions
export function getTemplatesByCategory(category: string): InstagramTemplate[] {
  return INSTAGRAM_TEMPLATES.filter(template => template.category === category)
}

export function getTemplateById(id: string): InstagramTemplate | undefined {
  return INSTAGRAM_TEMPLATES.find(template => template.id === id)
}

export function renderTemplate(template: InstagramTemplate, variables: Record<string, string>): string {
  let result = template.template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return result
}

