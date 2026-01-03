// Platform Plugin Registry - Auto-Discovery System
import { PlatformPlugin } from '../types/index.js'

// Import all platform plugins
import TwitterPlugin from './twitter/index.js'
import InstagramPlugin from './instagram/index.js'
import FacebookPlugin from './facebook/index.js'
import LinkedInPlugin from './linkedin/index.js'
import RedditPlugin from './reddit/index.js'
import EmailPlugin from './email/index.js'

// Registry of all available platform plugins
export const AvailablePlatformPlugins: PlatformPlugin[] = [
  TwitterPlugin,
  InstagramPlugin,
  FacebookPlugin,
  LinkedInPlugin,
  RedditPlugin,
  EmailPlugin
]

// Helper functions for platform management
export function getPlatformPlugin(platformName: string): PlatformPlugin | undefined {
  return AvailablePlatformPlugins.find(plugin => plugin.name === platformName)
}

export function getAllPlatformNames(): string[] {
  return AvailablePlatformPlugins.map(plugin => plugin.name)
}

export function getPlatformsWithCapability(capability: string): PlatformPlugin[] {
  return AvailablePlatformPlugins.filter(plugin =>
    plugin.capabilities.some(cap => cap.type === capability)
  )
}

export function validatePlatformExists(platformName: string): boolean {
  return AvailablePlatformPlugins.some(plugin => plugin.name === platformName)
}

// Export individual plugins for direct access
export {
  TwitterPlugin,
  InstagramPlugin,
  FacebookPlugin,
  LinkedInPlugin,
  RedditPlugin,
  EmailPlugin
}
