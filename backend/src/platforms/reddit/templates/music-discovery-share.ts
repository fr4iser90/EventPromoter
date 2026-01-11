import { RedditTemplate } from './types'

export const musicDiscoveryShareTemplate: RedditTemplate = {
  id: 'music-discovery',
  name: 'Music Discovery Share',
  description: 'A Reddit post template for sharing music discoveries from events',
  category: 'music',
  template: {
    title: 'Just discovered this amazing track - thoughts?',
    text: `Found this track through {title} at {venue} and it's been on repeat!

**Track:** {trackName}
**Artist:** {artist}
**Played at:** {title} - {venue}, {city}

**Why I love it:**
- {reasons}

Have you heard this? What do you think? Any similar recommendations?

**Listen here:** {link}

#Music #Discovery #Electronic #Techno`
  },
  variables: ['eventTitle', 'venue', 'trackName', 'artist', 'city', 'reasons', 'link'],
  recommendedSubreddits: ['r/electronicmusic', 'r/Techno', 'r/Music'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

