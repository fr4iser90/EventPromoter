import { RedditTemplate } from './types'

export const professionalEventAnnouncementTemplate: RedditTemplate = {
  id: 'professional-event',
  name: 'Professional Event Announcement',
  template: {
    title: '[EVENT] {eventTitle} - {date}',
    text: `**Event Announcement**

We are pleased to announce {eventTitle}.

**Event Details:**
- **Date:** {date}
- **Time:** {time}
- **Location:** {venue}, {city}
- **Description:** {description}

**Additional Information:** {link}

This event promises to be an excellent opportunity for networking and professional development.

#Event #Networking #ProfessionalDevelopment`
  },
  category: 'announcement',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link'],
  recommendedSubreddits: ['r/networking', 'r/professional', 'r/events']
}

