// Platform Manager - Central hub for all platform services

import { TwitterService } from '../platforms/twitter/service.js'
import { RedditService } from '../platforms/reddit/service.js'
import { EmailService } from '../platforms/email/service.js'

export class PlatformManager {
  private static platforms = new Map<string, any>()

  // Initialize platform services
  static initialize() {
    // Register platform services
    this.platforms.set('twitter', TwitterService)
    this.platforms.set('reddit', RedditService)
    this.platforms.set('email', EmailService)
    this.platforms.set('facebook', null) // TODO: implement
    this.platforms.set('instagram', null) // TODO: implement
    this.platforms.set('linkedin', null) // TODO: implement
  }

  // Get platform service instance
  static getPlatformService(platform: string, config: any = {}) {
    const ServiceClass = this.platforms.get(platform.toLowerCase())
    if (!ServiceClass) {
      throw new Error(`Platform '${platform}' not supported`)
    }
    return new ServiceClass(config)
  }

  // Validate content for specific platform
  static validateContent(platform: string, content: any) {
    const service = this.getPlatformService(platform)
    return service.validateContent(content)
  }

  // Get platform requirements
  static getPlatformRequirements(platform: string) {
    try {
      const service = this.getPlatformService(platform)
      return service.getRequirements()
    } catch {
      // Fallback for unimplemented platforms
      return {
        maxLength: null,
        supports: ['text'],
        required: ['text']
      }
    }
  }

  // Get all supported platforms
  static getSupportedPlatforms(): string[] {
    return Array.from(this.platforms.keys())
  }

  // Check if platform is supported
  static isPlatformSupported(platform: string): boolean {
    return this.platforms.has(platform.toLowerCase())
  }

  // Get platform-specific optimization tips
  static getOptimizationTips(platform: string, content: any): string[] {
    try {
      const service = this.getPlatformService(platform)
      return service.getOptimizationTips(content)
    } catch {
      return []
    }
  }
}

// Initialize on module load
PlatformManager.initialize()
