import { RedditTemplate } from './types'

export const venueReviewTemplate: RedditTemplate = {
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

