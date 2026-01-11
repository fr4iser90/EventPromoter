import { EventTemplate } from './types'

export const basicEventAnnouncementTemplate: EventTemplate = {
  id: 'basic-event',
  name: 'Basic Event Announcement',
  description: 'A simple Twitter post template for basic event announcements',
  category: 'announcement',
  template: '🎉 {title}\n📅 {date} at {time}\n📍 {venue}, {city}\n\n{description}\n\n#Event #Nightlife',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

