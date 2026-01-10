import { RedditTemplate } from './types'

export const eventAnnouncementTemplate: RedditTemplate = {
  id: 'event-announcement',
  name: 'Event Announcement',
  template: {
    title: '[EVENT] {eventTitle} - {date}',
    text: `**Event Details:**
- **Date:** {date}
- **Time:** {time}
- **Location:** {venue}, {city}
- **Description:** {description}

**Tickets/Info:** {link}

We're excited to announce {eventTitle}! This promises to be an amazing event with great music, atmosphere, and people.

**What to expect:**
- {highlights}

Feel free to ask questions in the comments! 🎉

#Event #Music #Nightlife`
  },
  category: 'announcement',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link', 'highlights'],
  recommendedSubreddits: ['r/events', 'r/party', 'r/music']
}

