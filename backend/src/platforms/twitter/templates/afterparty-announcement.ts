import { EventTemplate } from './types'

export const afterpartyAnnouncementTemplate: EventTemplate = {
  id: 'afterparty',
  name: 'Afterparty Announcement',
  template: '🎉 Party continues! Join us for the afterparty at {venue}\n\n🥂 {eventTitle}\n📅 {date} from {time}\n🎶 DJ {djName}\n\nFree entry for event guests!\n\n#Afterparty #Nightlife',
  category: 'afterparty',
  variables: ['venue', 'eventTitle', 'date', 'time', 'djName']
}

