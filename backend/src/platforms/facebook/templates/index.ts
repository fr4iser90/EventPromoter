/**
 * Facebook Templates
 * 
 * Centralized template exports and utilities for the Facebook platform.
 * 
 * @module platforms/facebook/templates
 */

// Import and export types
import type { FacebookTemplate } from './types.js'
export type { FacebookTemplate } from './types.js'

// Import templates first
import { basicEventAnnouncementTemplate } from './basic-event-announcement.js'
import { professionalEventAnnouncementTemplate } from './professional-event-announcement.js'
import { eventAnnouncementTemplate } from './event-announcement.js'
import { ticketSalePromotionTemplate } from './ticket-sale-promotion.js'

// Export individual templates
export { basicEventAnnouncementTemplate } from './basic-event-announcement.js'
export { professionalEventAnnouncementTemplate } from './professional-event-announcement.js'
export { eventAnnouncementTemplate } from './event-announcement.js'
export { ticketSalePromotionTemplate } from './ticket-sale-promotion.js'

// Main templates array
export const FACEBOOK_TEMPLATES: FacebookTemplate[] = [
  basicEventAnnouncementTemplate,
  professionalEventAnnouncementTemplate,
  eventAnnouncementTemplate,
  ticketSalePromotionTemplate
]

// Template utility functions
export function getTemplatesByCategory(category: string): FacebookTemplate[] {
  return FACEBOOK_TEMPLATES.filter(template => template.category === category)
}

export function getTemplateById(id: string): FacebookTemplate | undefined {
  return FACEBOOK_TEMPLATES.find(template => template.id === id)
}

export function renderTemplate(template: FacebookTemplate, variables: Record<string, string>): string {
  let result = template.template

  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }

  return result
}

