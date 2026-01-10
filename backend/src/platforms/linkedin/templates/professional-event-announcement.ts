import { LinkedInTemplate } from './types'

export const professionalEventAnnouncementTemplate: LinkedInTemplate = {
  id: 'professional-event',
  name: 'Professional Event Announcement',
  template: '📅 {eventTitle}\n\nJoin us for an exciting event on {date} at {time}.\n\n📍 Location: {venue}, {city}\n\n{description}\n\n#Event #Networking #ProfessionalDevelopment',
  category: 'announcement',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description']
}

