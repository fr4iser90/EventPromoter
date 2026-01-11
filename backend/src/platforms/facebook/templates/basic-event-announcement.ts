import { FacebookTemplate } from './types'

export const basicEventAnnouncementTemplate: FacebookTemplate = {
  id: 'basic-event',
  name: 'Basic Event Announcement',
  description: 'A simple Facebook post template for basic event announcements',
  category: 'announcement',
  template: '🎉 {title}\n\n📅 {date} at {time}\n📍 {venue}, {city}\n\n{description}\n\nGet your tickets now! 🎫\n\n#Event #Nightlife',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

