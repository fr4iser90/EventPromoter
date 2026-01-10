// ✅ GENERIC: Uses PlatformRegistry instead of legacy platform imports
import { ParsedEventData, PlatformContent } from '../types/index.js'
import { getPlatformRegistry, initializePlatformRegistry } from './platformRegistry.js'

export class PlatformParsingService {
  // Initialize registry on first use
  private static async ensureRegistry() {
    const registry = getPlatformRegistry()
    if (!registry.isInitialized()) {
      await initializePlatformRegistry()
    }
    return registry
  }

  // Main method to parse content for a specific platform using registry
  static async parseForPlatform(platform: string, parsedData: ParsedEventData): Promise<PlatformContent> {
    const registry = await PlatformParsingService.ensureRegistry()
    const platformModule = registry.getPlatform(platform.toLowerCase())

    if (!platformModule) {
      const availablePlatforms = registry.getPlatformIds()
      throw new Error(`Unsupported platform: ${platform}. Available platforms: ${availablePlatforms.join(', ')}`)
    }

    // ✅ GENERIC: Use the platform's parser to generate platform-specific content
    return platformModule.parser.parse(parsedData)
  }

  // Get all available platforms
  static async getAvailablePlatforms(): Promise<string[]> {
    const registry = await PlatformParsingService.ensureRegistry()
    return registry.getPlatformIds()
  }

  // Get platform capabilities
  static async getPlatformCapabilities(platform: string) {
    const registry = await PlatformParsingService.ensureRegistry()
    const platformModule = registry.getPlatform(platform.toLowerCase())
    return platformModule?.capabilities || null
  }
}
