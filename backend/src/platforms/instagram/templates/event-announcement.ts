import { InstagramTemplate } from './types'

export const eventAnnouncementTemplate: InstagramTemplate = {
  id: 'event-announcement',
  name: 'Event Announcement',
  description: 'An Instagram post template for announcing events with music focus',
  category: 'announcement',
  template: '🎶 {title}\n\n📅 {date} | {time}\n📍 {venue}, {city}\n\n{description}\n\n#Event #Nightlife #Music',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

