import { LinkedInTemplate } from './types'

export const basicEventAnnouncementTemplate: LinkedInTemplate = {
  id: 'basic-event',
  name: 'Basic Event Announcement',
  description: 'A simple LinkedIn post template for basic event announcements',
  category: 'announcement',
  template: '🎉 {eventTitle}\n📅 {date} at {time}\n📍 {venue}, {city}\n\n{description}\n\n#Event #Nightlife',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

