import { RedditTemplate } from './types'

export const eventAnnouncementTemplate: RedditTemplate = {
  id: 'event-announcement',
  name: 'Event Announcement',
  description: 'A Reddit post template for announcing events with markdown formatting',
  category: 'announcement',
  template: {
    title: '[EVENT] {title} - {date}',
    text: `**Event Details:**
- **Date:** {date}
- **Time:** {time}
- **Location:** {venue}, {city}
- **Description:** {description}

**Tickets/Info:** {link}

We're excited to announce {title}! This promises to be an amazing event with great music, atmosphere, and people.

**What to expect:**
- {highlights}

Feel free to ask questions in the comments! 🎉

#Event #Music #Nightlife`
  },
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link', 'highlights'],
  recommendedSubreddits: ['r/events', 'r/party', 'r/music'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

