import { LinkedInTemplate } from './types'

export const eventAnnouncementTemplate: LinkedInTemplate = {
  id: 'event-announcement',
  name: 'Event Announcement',
  description: 'A professional LinkedIn post template for announcing events with networking focus',
  category: 'announcement',
  template: '🎉 {title}\n\n📅 {date} | {time}\n📍 {venue}, {city}\n\n{description}\n\n#Event #Networking',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

