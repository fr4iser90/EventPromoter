import { EventTemplate } from './types'

export const basicEventAnnouncementTemplate: EventTemplate = {
  id: 'basic-event',
  name: 'Basic Event Announcement',
  template: '🎉 {eventTitle}\n📅 {date} at {time}\n📍 {venue}, {city}\n\n{description}\n\n#Event #Nightlife',
  category: 'announcement',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description']
}

