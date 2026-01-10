import { EventTemplate } from './types'

export const afterpartyAnnouncementTemplate: EventTemplate = {
  id: 'afterparty',
  name: 'Afterparty Announcement',
  description: 'A Twitter post template for announcing afterparty events',
  category: 'afterparty',
  template: '🎉 Party continues! Join us for the afterparty at {venue}\n\n🥂 {eventTitle}\n📅 {date} from {time}\n🎶 DJ {djName}\n\nFree entry for event guests!\n\n#Afterparty #Nightlife',
  variables: ['venue', 'eventTitle', 'date', 'time', 'djName'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

