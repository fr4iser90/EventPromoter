import { ParsedEventData, PlatformContent, PlatformParser } from '../../types/index.js'

export class LinkedInParser implements PlatformParser {
  static parse(eventData: ParsedEventData): PlatformContent {
    let text = ''

    // Professional introduction
    text += `🎵 Event-Empfehlung: ${eventData.title || 'Techno Event'}\n\n`

    // Date and location
    if (eventData.date) {
      const date = new Date(eventData.date)
      const formattedDate = date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      text += `📅 Datum: ${formattedDate}`

      if (eventData.time) {
        text += ` | ⏰ Uhrzeit: ${eventData.time} Uhr`
      }
      text += '\n\n'
    }

    // Venue
    if (eventData.venue) {
      text += `📍 Location: ${eventData.venue}`
      if (eventData.city) {
        text += `, ${eventData.city}`
      }
      text += '\n\n'
    }

    // Professional description
    if (eventData.description) {
      text += `${eventData.description}\n\n`
    }

    // Price info
    if (eventData.price) {
      text += `💼 Eintritt: ${eventData.price}\n\n`
    }

    // Website
    if (eventData.website) {
      text += `🔗 Weitere Informationen: ${eventData.website}\n\n`
    }

    // Professional call to action
    text += `Networking und gute Musik erwartet euch! 🎧\n\n`

    // Industry hashtags
    const hashtags = ['#Techno', '#ClubCulture', '#Nightlife', '#Berlin', '#MusicEvents', '#DJ']
    text += `${hashtags.join(' ')}\n\n`

    text += `Was haltet ihr von diesem Event? Kommentiert gerne! 👇`

    return {
      text,
      metadata: {
        platform: 'linkedin',
        hashtags: hashtags,
        targetAudience: 'professionals',
        industry: 'entertainment'
      }
    }
  }
}
