import { FacebookTemplate } from './types'

export const basicEventAnnouncementTemplate: FacebookTemplate = {
  id: 'basic-event',
  name: 'Basic Event Announcement',
  template: '🎉 {eventTitle}\n\n📅 {date} at {time}\n📍 {venue}, {city}\n\n{description}\n\nGet your tickets now! 🎫\n\n#Event #Nightlife',
  category: 'announcement',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description']
}

