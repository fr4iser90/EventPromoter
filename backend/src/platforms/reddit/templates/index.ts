/**
 * Reddit Templates
 * 
 * Centralized template exports and utilities for the Reddit platform.
 * 
 * @module platforms/reddit/templates
 */

// Import and export types
import type { RedditTemplate } from './types'
export type { RedditTemplate } from './types'

// Import templates first
import { basicEventAnnouncementTemplate } from './basic-event-announcement.js'
import { professionalEventAnnouncementTemplate } from './professional-event-announcement.js'
import { eventAnnouncementTemplate } from './event-announcement.js'
import { djSetDiscussionTemplate } from './dj-set-discussion.js'
import { musicDiscoveryShareTemplate } from './music-discovery-share.js'
import { venueReviewTemplate } from './venue-review.js'

// Export individual templates
export { basicEventAnnouncementTemplate } from './basic-event-announcement.js'
export { professionalEventAnnouncementTemplate } from './professional-event-announcement.js'
export { eventAnnouncementTemplate } from './event-announcement.js'
export { djSetDiscussionTemplate } from './dj-set-discussion.js'
export { musicDiscoveryShareTemplate } from './music-discovery-share.js'
export { venueReviewTemplate } from './venue-review.js'

// Main templates array
export const REDDIT_TEMPLATES: RedditTemplate[] = [
  basicEventAnnouncementTemplate,
  professionalEventAnnouncementTemplate,
  eventAnnouncementTemplate,
  djSetDiscussionTemplate,
  musicDiscoveryShareTemplate,
  venueReviewTemplate
]

// Template utility functions
export function getTemplatesByCategory(category: string): RedditTemplate[] {
  return REDDIT_TEMPLATES.filter(template => template.category === category)
}

export function getTemplateById(id: string): RedditTemplate | undefined {
  return REDDIT_TEMPLATES.find(template => template.id === id)
}

export function renderTemplate(template: RedditTemplate, variables: Record<string, string>): { title: string, text: string } {
  let title = template.template.title
  let text = template.template.text

  // Replace variables in both title and text
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g')
    title = title.replace(regex, value)
    text = text.replace(regex, value)
  }

  return { title, text }
}

export function getRecommendedSubredditsForEvent(eventType: string): string[] {
  switch (eventType.toLowerCase()) {
    case 'techno':
    case 'electronic':
      return ['r/Techno', 'r/electronicmusic', 'r/rave']
    case 'house':
      return ['r/HouseMusic', 'r/electronicmusic', 'r/party']
    case 'party':
    case 'club':
      return ['r/party', 'r/nightlife', 'r/clubs']
    default:
      return ['r/events', 'r/party', 'r/music']
  }
}

