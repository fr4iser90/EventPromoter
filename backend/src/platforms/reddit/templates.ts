// Reddit content templates

export interface RedditTemplate {
  id: string
  name: string
  template: {
    title: string
    text: string
  }
  category: string
  variables: string[]
  recommendedSubreddits: string[]
}

export const REDDIT_TEMPLATES: RedditTemplate[] = [
  {
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
    category: 'event',
    variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link', 'highlights'],
    recommendedSubreddits: ['r/events', 'r/party', 'r/music']
  },
  {
    id: 'dj-set-discussion',
    name: 'DJ Set Discussion',
    template: {
      title: 'DJ {djName} at {venue} - Set Discussion',
      text: `Just caught DJ {djName} at {venue} last night and wanted to discuss the set!

**Event:** {eventTitle}
**Venue:** {venue}, {city}
**Date:** {date}

**What I loved:**
- {highlights}

**Track highlights:**
- {tracks}

Thoughts? What did you think of the set? Any recommendations for similar DJs?

#DJ #Techno #Electronic #Music`
    },
    category: 'discussion',
    variables: ['djName', 'venue', 'eventTitle', 'city', 'date', 'highlights', 'tracks'],
    recommendedSubreddits: ['r/Techno', 'r/electronicmusic', 'r/DJs']
  },
  {
    id: 'music-discovery',
    name: 'Music Discovery Share',
    template: {
      title: 'Just discovered this amazing track - thoughts?',
      text: `Found this track through {eventTitle} at {venue} and it's been on repeat!

**Track:** {trackName}
**Artist:** {artist}
**Played at:** {eventTitle} - {venue}, {city}

**Why I love it:**
- {reasons}

Have you heard this? What do you think? Any similar recommendations?

**Listen here:** {link}

#Music #Discovery #Electronic #Techno`
    },
    category: 'music',
    variables: ['eventTitle', 'venue', 'trackName', 'artist', 'city', 'reasons', 'link'],
    recommendedSubreddits: ['r/electronicmusic', 'r/Techno', 'r/Music']
  },
  {
    id: 'venue-review',
    name: 'Venue Review',
    template: {
      title: 'Venue Review: {venue} - {rating}/10',
      text: `Just experienced an event at {venue} and wanted to share my thoughts.

**Venue:** {venue}
**Location:** {city}
**Event:** {eventTitle}
**Date:** {date}

**Rating:** {rating}/10

**What I liked:**
- {positives}

**What could be improved:**
- {improvements}

**Atmosphere:** {atmosphere}
**Sound quality:** {soundQuality}/10
**Crowd:** {crowdDescription}

Would I go back? {recommendation}

#VenueReview #Nightlife #Club #Event`
    },
    category: 'review',
    variables: ['venue', 'rating', 'city', 'eventTitle', 'date', 'positives', 'improvements', 'atmosphere', 'soundQuality', 'crowdDescription', 'recommendation'],
    recommendedSubreddits: ['r/nightlife', 'r/clubs', 'r/party']
  }
]

export function getTemplatesByCategory(category: string): RedditTemplate[] {
  return REDDIT_TEMPLATES.filter(template => template.category === category)
}

export function getTemplateById(id: string): RedditTemplate | undefined {
  return REDDIT_TEMPLATES.find(template => template.id === id)
}

export function renderTemplate(template: RedditTemplate, variables: Record<string, string>): { title: string, text: string } {
  let title = template.template.title
  let text = template.template.text

  // Replace variables in both title and text
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g')
    title = title.replace(regex, value)
    text = text.replace(regex, value)
  }

  return { title, text }
}

export function getRecommendedSubredditsForEvent(eventType: string): string[] {
  switch (eventType.toLowerCase()) {
    case 'techno':
    case 'electronic':
      return ['r/Techno', 'r/electronicmusic', 'r/rave']
    case 'house':
      return ['r/HouseMusic', 'r/electronicmusic', 'r/party']
    case 'party':
    case 'club':
      return ['r/party', 'r/nightlife', 'r/clubs']
    default:
      return ['r/events', 'r/party', 'r/music']
  }
}
