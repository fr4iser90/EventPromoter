import { InstagramTemplate } from './types'

export const professionalEventAnnouncementTemplate: InstagramTemplate = {
  id: 'professional-event',
  name: 'Professional Event Announcement',
  description: 'A formal Instagram post template for professional events and corporate networking',
  category: 'announcement',
  template: '📅 {eventTitle}\n\nJoin us for an exciting event on {date} at {time}.\n\n📍 Location: {venue}, {city}\n\n{description}\n\n#Event #Networking #ProfessionalDevelopment',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

