import { ParsedEventData, PlatformContent, PlatformParser } from '../../types/index.js'

export class FacebookParser implements PlatformParser {
  static parse(eventData: ParsedEventData): PlatformContent {
    let text = ''

    // Title as heading
    if (eventData.title) {
      text += `${eventData.title}\n\n`
    }

    // Event details
    text += '📅 Wann: '
    if (eventData.date) {
      const date = new Date(eventData.date)
      const formattedDate = date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      text += formattedDate

      if (eventData.time) {
        text += `, ${eventData.time} Uhr`
      }
    }
    text += '\n\n'

    // Location
    text += '📍 Wo: '
    if (eventData.venue) {
      text += eventData.venue
      if (eventData.city) {
        text += `, ${eventData.city}`
      }
    }
    text += '\n\n'

    // Description
    if (eventData.description) {
      text += `🎵 ${eventData.description}\n\n`
    }

    // Price
    if (eventData.price) {
      text += `💰 Eintritt: ${eventData.price}\n\n`
    }

    // Website
    if (eventData.website) {
      text += `🔗 Mehr Informationen: ${eventData.website}\n\n`
    }

    // Call to action
    text += 'Interessiert? Dann komm vorbei! 🎉\n\n'

    // Hashtags
    const hashtags = this.generateHashtags(eventData, 8)
    text += `${hashtags.join(' ')}`

    return {
      text,
      metadata: {
        platform: 'facebook',
        hashtags: hashtags,
        eventType: 'public'
      }
    }
  }

  // Generate relevant hashtags
  private static generateHashtags(eventData: ParsedEventData, maxCount: number = 8): string[] {
    const hashtags: string[] = []

    // Base hashtags
    hashtags.push('#Techno', '#Club', '#Nightlife', '#Event', '#Party')

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
      if (title.includes('house')) hashtags.push('#HouseMusic')
      if (title.includes('dj')) hashtags.push('#DJ', '#DJSet')
      if (title.includes('live')) hashtags.push('#LiveMusic')
    }

    // Limit to maxCount
    return hashtags.slice(0, maxCount)
  }
}
