import { RedditTemplate } from './types'

export const musicDiscoveryShareTemplate: RedditTemplate = {
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
}

