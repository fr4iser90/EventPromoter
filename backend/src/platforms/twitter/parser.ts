import { ParsedEventData, PlatformContent } from '../../types/index.js'

export class TwitterParser {
  static parse(eventData: ParsedEventData): PlatformContent {
    let text = ''

    // Title
    if (eventData.title) {
      text += `🎵 ${eventData.title}\n`
    }

    // Date and time
    if (eventData.date) {
      const date = new Date(eventData.date)
      const formattedDate = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
      text += `📅 ${formattedDate}`

      if (eventData.time) {
        text += ` ${eventData.time}`
      }
      text += '\n'
    }

    // Venue
    if (eventData.venue) {
      text += `📍 ${eventData.venue}`
      if (eventData.city) {
        text += `, ${eventData.city}`
      }
      text += '\n'
    }

    // Lineup (if available)
    if (eventData.lineup && eventData.lineup.length > 0) {
      if (eventData.lineup.length === 1) {
        text += `🎤 ${eventData.lineup[0]}\n`
      } else if (eventData.lineup.length === 2) {
        text += `🎤 ${eventData.lineup.join(' & ')}\n`
      } else {
        // More than 2 artists - show first 2 + "and more"
        text += `🎤 ${eventData.lineup.slice(0, 2).join(', ')} & more\n`
      }
    }

    // Price
    if (eventData.price) {
      text += `💰 ${eventData.price}\n`
    }

    // Description (truncated to fit)
    if (eventData.description) {
      const maxDescLength = 280 - text.length - 10 // Leave room for hashtags
      if (maxDescLength > 20) {
        let desc = eventData.description.substring(0, maxDescLength)
        if (eventData.description.length > maxDescLength) {
          desc = desc.substring(0, desc.lastIndexOf(' ')) + '...'
        }
        text += `\n${desc}`
      }
    }

    // Hashtags
    const hashtags = this.generateHashtags(eventData)
    const remainingChars = 280 - text.length
    if (remainingChars > 10 && hashtags.length > 0) {
      text += `\n\n${hashtags.join(' ')}`
    }

    // Ensure we don't exceed character limit
    if (text.length > 280) {
      text = text.substring(0, 277) + '...'
    }

    return {
      text,
      metadata: {
        platform: 'twitter',
        characterCount: text.length,
        maxCharacters: 280,
        hashtags: hashtags
      }
    }
  }

  // Generate relevant hashtags
  private static generateHashtags(eventData: ParsedEventData): string[] {
    const hashtags: string[] = []

    // Base hashtags
    hashtags.push('#Techno', '#Club', '#Nightlife')

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
      if (title.includes('techno')) hashtags.push('#TechnoMusic')
      if (title.includes('house')) hashtags.push('#HouseMusic')
      if (title.includes('dj')) hashtags.push('#DJ')
      if (title.includes('live')) hashtags.push('#LiveMusic')
    }

    // Genre-based hashtags
    if (eventData.genre) {
      const genre = eventData.genre.toLowerCase()
      if (genre.includes('techno')) hashtags.push('#TechnoMusic')
      if (genre.includes('house')) hashtags.push('#HouseMusic')
      if (genre.includes('electronic')) hashtags.push('#ElectronicMusic')
      if (genre.includes('synth')) hashtags.push('#SynthPop')
      if (genre.includes('pop')) hashtags.push('#PopMusic')
    }

    // Limit to 5 hashtags for Twitter
    return hashtags.slice(0, 5)
  }
}
