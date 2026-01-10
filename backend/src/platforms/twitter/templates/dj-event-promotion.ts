import { EventTemplate } from './types'

export const djEventPromotionTemplate: EventTemplate = {
  id: 'dj-event',
  name: 'DJ Event Promotion',
  template: '🎧 DJ {djName} live at {venue}!\n\n🎶 {eventTitle}\n📅 {date} | {time}\n📍 {venue}, {city}\n\n{description}\n\n🎵 #DJ #Techno #Nightlife',
  category: 'music',
  variables: ['djName', 'eventTitle', 'date', 'time', 'venue', 'city', 'description']
}

