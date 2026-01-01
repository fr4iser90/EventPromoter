import { ParsedEventData, PlatformContent } from '../../types/index.js'

export class InstagramParser {
  static parse(eventData: ParsedEventData): PlatformContent {
    let text = ''

    // Emojis and title
    if (eventData.title) {
      text += `🎶 ${eventData.title} 🎶\n\n`
    }

    // Date and time with calendar emoji
    if (eventData.date) {
      const date = new Date(eventData.date)
      const formattedDate = date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
      })
      text += `📅 ${formattedDate}`

      if (eventData.time) {
        text += ` um ${eventData.time} Uhr`
      }
      text += '\n\n'
    }

    // Venue with location emoji
    if (eventData.venue) {
      text += `📍 ${eventData.venue}`
      if (eventData.city) {
        text += ` in ${eventData.city}`
      }
      text += '\n\n'
    }

    // Lineup (detailed for Instagram)
    if (eventData.lineup && eventData.lineup.length > 0) {
      text += `🎤 Lineup:\n`
      eventData.lineup.forEach((artist: string) => {
        text += `• ${artist}\n`
      })
      text += '\n'
    }

    // Description
    if (eventData.description) {
      text += `${eventData.description}\n\n`
    }

    // Price with money emoji
    if (eventData.price) {
      text += `💵 Eintritt: ${eventData.price}\n\n`
    }

    // Website
    if (eventData.website) {
      text += `🔗 Mehr Infos: ${eventData.website}\n\n`
    }

    // Hashtags
    const hashtags = this.generateHashtags(eventData, 15) // More hashtags for Instagram
    text += `${hashtags.join(' ')}\n\n`

    // Call to action
    text += `Wer kommt mit? 👯‍♀️\n#Techno #Club #Nightlife`

    return {
      text,
      metadata: {
        platform: 'instagram',
        hashtags: hashtags,
        recommendedActions: ['Like', 'Comment', 'Share', 'Save']
      }
    }
  }

  // Generate relevant hashtags
  private static generateHashtags(eventData: ParsedEventData, maxCount: number = 15): string[] {
    const hashtags: string[] = []

    // Base hashtags
    hashtags.push('#Techno', '#Club', '#Nightlife', '#Party', '#Music')

    // City-specific
    if (eventData.city) {
      const cityMap: Record<string, string> = {
        'Berlin': '#Berlin',
        'Hamburg': '#Hamburg',
        'München': '#Munich',
        'Köln': '#Cologne',
        'Frankfurt': '#Frankfurt'
      }
      if (cityMap[eventData.city]) {
        hashtags.push(cityMap[eventData.city])
      }
    }

    // Event type detection
    if (eventData.title) {
      const title = eventData.title.toLowerCase()
      if (title.includes('techno')) hashtags.push('#TechnoMusic', '#TechnoParty')
      if (title.includes('house')) hashtags.push('#HouseMusic', '#HouseParty')
      if (title.includes('dj')) hashtags.push('#DJ', '#DJLife')
      if (title.includes('live')) hashtags.push('#LiveMusic', '#Concert')
    }

    // Limit to maxCount
    return hashtags.slice(0, maxCount)
  }
}
