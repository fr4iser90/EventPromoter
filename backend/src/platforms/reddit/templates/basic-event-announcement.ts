import { RedditTemplate } from './types'

export const basicEventAnnouncementTemplate: RedditTemplate = {
  id: 'basic-event',
  name: 'Basic Event Announcement',
  description: 'A simple Reddit post template for basic event announcements',
  category: 'announcement',
  template: {
    title: '[EVENT] {eventTitle} - {date}',
    text: `**Event Details:**
- **Date:** {date}
- **Time:** {time}
- **Location:** {venue}, {city}
- **Description:** {description}

**Tickets/Info:** {link}

#Event #Nightlife`
  },
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link'],
  recommendedSubreddits: ['r/events', 'r/party', 'r/music'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

