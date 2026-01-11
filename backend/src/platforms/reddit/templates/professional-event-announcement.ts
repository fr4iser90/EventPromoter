import { RedditTemplate } from './types'

export const professionalEventAnnouncementTemplate: RedditTemplate = {
  id: 'professional-event',
  name: 'Professional Event Announcement',
  description: 'A formal Reddit post template for professional events and networking',
  category: 'announcement',
  template: {
    title: '[EVENT] {title} - {date}',
    text: `**Event Announcement**

We are pleased to announce {title}.

**Event Details:**
- **Date:** {date}
- **Time:** {time}
- **Location:** {venue}, {city}
- **Description:** {description}

**Additional Information:** {link}

This event promises to be an excellent opportunity for networking and professional development.

#Event #Networking #ProfessionalDevelopment`
  },
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link'],
  recommendedSubreddits: ['r/networking', 'r/professional', 'r/events'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

