import { ParsedEventData, PlatformContent } from '../types/index.js'
import { TwitterParser } from '../platforms/twitter/parser.js'
import { InstagramParser } from '../platforms/instagram/parser.js'
import { FacebookParser } from '../platforms/facebook/parser.js'
import { LinkedInParser } from '../platforms/linkedin/parser.js'
import { RedditParser } from '../platforms/reddit/parser.js'
import { EmailParser } from '../platforms/email/parser.js'

export class PlatformParsingService {
  // Main method to parse content for a specific platform
  static async parseForPlatform(platform: string, parsedData: ParsedEventData): Promise<PlatformContent> {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return TwitterParser.parse(parsedData)
      case 'instagram':
        return InstagramParser.parse(parsedData)
      case 'facebook':
        return FacebookParser.parse(parsedData)
      case 'linkedin':
        return LinkedInParser.parse(parsedData)
      case 'reddit':
        return RedditParser.parse(parsedData)
      case 'email':
        return EmailParser.parse(parsedData)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }
}
