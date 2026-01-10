import { RedditTemplate } from './types'

export const basicEventAnnouncementTemplate: RedditTemplate = {
  id: 'basic-event',
  name: 'Basic Event Announcement',
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
  category: 'announcement',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link'],
  recommendedSubreddits: ['r/events', 'r/party', 'r/music']
}

