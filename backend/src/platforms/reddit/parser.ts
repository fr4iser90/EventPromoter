import { ParsedEventData, PlatformContent } from '../../types/index.js'

export class RedditParser {
  static parse(eventData: ParsedEventData): PlatformContent {
    const title = eventData.title || 'Techno Event'

    // Reddit title (should be descriptive)
    let redditTitle = `[EVENT] ${title}`

    if (eventData.date) {
      const date = new Date(eventData.date)
      const formattedDate = date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit'
      })
      redditTitle += ` - ${formattedDate}`

      if (eventData.time) {
        redditTitle += ` ${eventData.time}`
      }
    }

    if (eventData.city) {
      redditTitle += ` (${eventData.city})`
    }

    // Reddit post content
    let text = ''

    // Location
    if (eventData.venue) {
      text += `**Location:** ${eventData.venue}`
      if (eventData.city) {
        text += `, ${eventData.city}`
      }
      text += '\n\n'
    }

    // Date/Time details
    if (eventData.date || eventData.time) {
      text += '**When:** '
      if (eventData.date) {
        const date = new Date(eventData.date)
        text += date.toLocaleDateString('de-DE', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      }
      if (eventData.time) {
        text += ` at ${eventData.time}`
      }
      text += '\n\n'
    }

    // Description
    if (eventData.description) {
      text += `${eventData.description}\n\n`
    }

    // Price
    if (eventData.price) {
      text += `**Price:** ${eventData.price}\n\n`
    }

    // Website
    if (eventData.website) {
      text += `**More info:** ${eventData.website}\n\n`
    }

    // Reddit-specific elements
    text += `---\n\n`
    text += `*This event was automatically parsed from a flyer. If you notice any errors, please let me know!*\n\n`

    return {
      text,
      metadata: {
        platform: 'reddit',
        title: redditTitle,
        subreddit: 'r/techno', // Default subreddit
        flair: 'Event'
      }
    }
  }
}
