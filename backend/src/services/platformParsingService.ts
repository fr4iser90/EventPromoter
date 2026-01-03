import { ParsedEventData, PlatformContent } from '../types/index.js'
import { getPlatformPlugin, getAllPlatformNames } from '../platforms/index.js'

export class PlatformParsingService {
  // Main method to parse content for a specific platform using plugin architecture
  static async parseForPlatform(platform: string, parsedData: ParsedEventData): Promise<PlatformContent> {
    const plugin = getPlatformPlugin(platform.toLowerCase())

    if (!plugin) {
      throw new Error(`Unsupported platform: ${platform}. Available platforms: ${getAllPlatformNames().join(', ')}`)
    }

    // Use the plugin's parser to generate platform-specific content
    return plugin.parser.parse(parsedData)
  }

  // Get all available platforms
  static getAvailablePlatforms(): string[] {
    return getAllPlatformNames()
  }

  // Get platform capabilities
  static getPlatformCapabilities(platform: string) {
    const plugin = getPlatformPlugin(platform.toLowerCase())
    return plugin?.capabilities || []
  }
}
