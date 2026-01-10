// ✅ GENERIC: Platform Manager - Uses PlatformRegistry instead of hardcoded imports
// This replaces the old hardcoded platform service map

import { getPlatformRegistry, initializePlatformRegistry } from './platformRegistry.js'

export class PlatformManager {
  // Initialize registry on first use
  private static async ensureRegistry() {
    const registry = getPlatformRegistry()
    if (!registry.isInitialized()) {
      await initializePlatformRegistry()
    }
    return registry
  }

  // ✅ GENERIC: Get platform service instance from registry
  static async getPlatformService(platform: string, config: any = {}) {
    const registry = await PlatformManager.ensureRegistry()
    const platformModule = registry.getPlatform(platform.toLowerCase())
    
    if (!platformModule) {
      throw new Error(`Platform '${platform}' not found`)
    }

    // Return service instance (services are already instantiated in PlatformModule)
    return platformModule.service
  }

  // ✅ GENERIC: Validate content for specific platform
  static async validateContent(platform: string, content: any) {
    const service = await PlatformManager.getPlatformService(platform)
    if (typeof service.validateContent === 'function') {
      return service.validateContent(content)
    }
    // Fallback to validator if service doesn't have validateContent
    const registry = await PlatformManager.ensureRegistry()
    const platformModule = registry.getPlatform(platform.toLowerCase())
    if (platformModule?.validator) {
      return platformModule.validator.validate(content)
    }
    return { isValid: false, errors: ['Validation not available'] }
  }

  // ✅ GENERIC: Get platform requirements from validator
  static async getPlatformRequirements(platform: string) {
    try {
      const registry = await PlatformManager.ensureRegistry()
      const platformModule = registry.getPlatform(platform.toLowerCase())
      
      if (!platformModule) {
        throw new Error(`Platform '${platform}' not found`)
      }

      const limits = platformModule.validator.getLimits()
      return {
        maxLength: limits.maxLength,
        supports: [
          ...(platformModule.capabilities.supportsText ? ['text'] : []),
          ...(platformModule.capabilities.supportsImages ? ['image'] : []),
          ...(platformModule.capabilities.supportsVideo ? ['video'] : []),
          ...(platformModule.capabilities.supportsLinks ? ['link'] : [])
        ],
        required: ['text'] // Default required
      }
    } catch {
      // Fallback for unimplemented platforms
      return {
        maxLength: null,
        supports: ['text'],
        required: ['text']
      }
    }
  }

  // ✅ GENERIC: Get all supported platforms from registry
  static async getSupportedPlatforms(): Promise<string[]> {
    const registry = await PlatformManager.ensureRegistry()
    return registry.getPlatformIds()
  }

  // ✅ GENERIC: Check if platform is supported
  static async isPlatformSupported(platform: string): Promise<boolean> {
    const registry = await PlatformManager.ensureRegistry()
    return registry.hasPlatform(platform.toLowerCase())
  }

  // ✅ GENERIC: Get platform-specific optimization tips
  static async getOptimizationTips(platform: string, content: any): Promise<string[]> {
    try {
      const service = await PlatformManager.getPlatformService(platform)
      if (typeof service.getOptimizationTips === 'function') {
        return service.getOptimizationTips(content)
      }
      return []
    } catch {
      return []
    }
  }
}
