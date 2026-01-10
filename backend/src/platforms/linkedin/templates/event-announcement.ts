import { LinkedInTemplate } from './types'

export const eventAnnouncementTemplate: LinkedInTemplate = {
  id: 'event-announcement',
  name: 'Event Announcement',
  template: '🎉 {eventTitle}\n\n📅 {date} | {time}\n📍 {venue}, {city}\n\n{description}\n\n#Event #Networking',
  category: 'announcement',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description']
}

