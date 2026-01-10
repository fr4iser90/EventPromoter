import { EventTemplate } from './types'

export const eventAnnouncementTemplate: EventTemplate = {
  id: 'event-announcement',
  name: 'Event Announcement',
  description: 'A Twitter post template for announcing events with concise formatting',
  category: 'announcement',
  template: '🎉 {eventTitle}\n\n📅 {date} | {time}\n📍 {venue}, {city}\n\n{description}\n\n#Event #Nightlife',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

