import { RedditTemplate } from './types'

export const djSetDiscussionTemplate: RedditTemplate = {
  id: 'dj-set-discussion',
  name: 'DJ Set Discussion',
  description: 'A Reddit post template for discussing DJ sets and track highlights',
  category: 'discussion',
  template: {
    title: 'DJ {djName} at {venue} - Set Discussion',
    text: `Just caught DJ {djName} at {venue} last night and wanted to discuss the set!

**Event:** {title}
**Venue:** {venue}, {city}
**Date:** {date}

**What I loved:**
- {highlights}

**Track highlights:**
- {tracks}

Thoughts? What did you think of the set? Any recommendations for similar DJs?

#DJ #Techno #Electronic #Music`
  },
  variables: ['djName', 'venue', 'eventTitle', 'city', 'date', 'highlights', 'tracks'],
  recommendedSubreddits: ['r/Techno', 'r/electronicmusic', 'r/DJs'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

