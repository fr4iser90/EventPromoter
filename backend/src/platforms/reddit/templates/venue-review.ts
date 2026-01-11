import { RedditTemplate } from './types'

export const venueReviewTemplate: RedditTemplate = {
  id: 'venue-review',
  name: 'Venue Review',
  description: 'A Reddit post template for reviewing venues after events',
  category: 'review',
  template: {
    title: 'Venue Review: {venue} - {rating}/10',
    text: `Just experienced an event at {venue} and wanted to share my thoughts.

**Venue:** {venue}
**Location:** {city}
**Event:** {title}
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
  variables: ['venue', 'rating', 'city', 'eventTitle', 'date', 'positives', 'improvements', 'atmosphere', 'soundQuality', 'crowdDescription', 'recommendation'],
  recommendedSubreddits: ['r/nightlife', 'r/clubs', 'r/party'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

