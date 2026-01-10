import { EventTemplate } from './types'

export const djEventPromotionTemplate: EventTemplate = {
  id: 'dj-event',
  name: 'DJ Event Promotion',
  description: 'A Twitter post template for promoting DJ events and music performances',
  category: 'music',
  template: '🎧 DJ {djName} live at {venue}!\n\n🎶 {eventTitle}\n📅 {date} | {time}\n📍 {venue}, {city}\n\n{description}\n\n🎵 #DJ #Techno #Nightlife',
  variables: ['djName', 'eventTitle', 'date', 'time', 'venue', 'city', 'description'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

