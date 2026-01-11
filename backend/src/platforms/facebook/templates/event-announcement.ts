import { FacebookTemplate } from './types'

export const eventAnnouncementTemplate: FacebookTemplate = {
  id: 'event-announcement',
  name: 'Event Announcement',
  description: 'A Facebook post template for announcing events with engaging formatting',
  category: 'announcement',
  template: '🎉 {title}\n\n📅 {date} | {time}\n📍 {venue}, {city}\n\n{description}\n\n#Event #Nightlife',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

