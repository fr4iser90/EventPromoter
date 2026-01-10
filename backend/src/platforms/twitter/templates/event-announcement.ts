import { EventTemplate } from './types'

export const eventAnnouncementTemplate: EventTemplate = {
  id: 'event-announcement',
  name: 'Event Announcement',
  template: '🎉 {eventTitle}\n\n📅 {date} | {time}\n📍 {venue}, {city}\n\n{description}\n\n#Event #Nightlife',
  category: 'announcement',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description']
}

