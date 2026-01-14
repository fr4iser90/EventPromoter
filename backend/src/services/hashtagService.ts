/**
 * Hashtag Service
 * 
 * Handles hashtag management - global hashtags and platform-specific hashtags.
 * Global hashtags are stored in config/hashtags.json
 * Platform-specific hashtags are stored in platforms/{platformId}/data/hashtags.json
 * 
 * @module services/hashtagService
 */

import { ConfigService } from './configService.js'
import { readPlatformData, writePlatformData } from '../utils/platformDataUtils.js'

export class HashtagService {
  /**
   * Get all hashtags (global + platform-specific merged)
   */
  static async getHashtags(platformId?: string) {
    // Get global hashtags
    const global = await ConfigService.getConfig('hashtags')
    
    // Get platform-specific hashtags if platformId provided
    let platform: any = null
    if (platformId) {
      platform = await readPlatformData(platformId)
      // If platform has hashtags.json, use it, otherwise check if dataSource is hashtags.json
      // For now, we'll check if platform has a hashtags data file
      try {
        const { readPlatformData: readPlatformHashtags } = await import('../utils/platformDataUtils.js')
        // Try to read platform-specific hashtags
        // We'll need to check if the platform has hashtags.json as a separate data source
        // For simplicity, we'll merge global + platform if platform data exists
      } catch (error) {
        // Platform doesn't have hashtags - that's OK
      }
    }
    
    // Merge global and platform-specific
    const available = [
      ...(global?.available || []),
      ...(platform?.available || [])
    ]
    
    const groups = {
      ...(global?.groups || {}),
      ...(platform?.groups || {})
    }
    
    return {
      available: [...new Set(available)], // Remove duplicates
      groups,
      selected: global?.selected || []
    }
  }

  /**
   * Get only global hashtags
   */
  static async getGlobalHashtags() {
    const config = await ConfigService.getConfig('hashtags')
    return {
      available: config?.available || [],
      groups: config?.groups || {},
      selected: config?.selected || []
    }
  }

  /**
   * Get platform-specific hashtags
   */
  static async getPlatformHashtags(platformId: string) {
    // For now, platforms can have hashtags.json in their data directory
    // This is separate from their main dataSource
    const platform = await readPlatformData(platformId)
    return {
      available: platform?.hashtags?.available || [],
      groups: platform?.hashtags?.groups || {},
      selected: platform?.hashtags?.selected || []
    }
  }

  /**
   * Add a hashtag to global list
   */
  static async addHashtag(hashtag: string, group?: string) {
    const hashtagNormalized = hashtag.startsWith('#') ? hashtag : `#${hashtag}`
    
    const config = await ConfigService.getConfig('hashtags')
    const available = config?.available || []
    const groups = config?.groups || {}

    if (available.includes(hashtagNormalized)) {
      return { success: false, error: 'Hashtag already exists' }
    }

    const updated = {
      ...config,
      available: [...available, hashtagNormalized]
    }

    // Add to group if specified
    if (group) {
      if (!groups[group]) {
        groups[group] = []
      }
      if (!groups[group].includes(hashtagNormalized)) {
        groups[group].push(hashtagNormalized)
      }
      updated.groups = groups
    }

    await ConfigService.saveConfig('hashtags', updated)
    return { success: true, hashtag: hashtagNormalized }
  }

  /**
   * Remove a hashtag from global list
   */
  static async removeHashtag(hashtag: string) {
    const config = await ConfigService.getConfig('hashtags')
    const available = (config?.available || []).filter((h: string) => h !== hashtag)
    const groups = { ...(config?.groups || {}) }

    // Remove from all groups
    Object.keys(groups).forEach(groupName => {
      groups[groupName] = groups[groupName].filter((h: string) => h !== hashtag)
    })

    const updated = {
      ...config,
      available,
      groups
    }

    await ConfigService.saveConfig('hashtags', updated)
    return { success: true }
  }

  /**
   * Create a hashtag group
   */
  static async createGroup(groupName: string, hashtags: string[]) {
    const normalizedHashtags = hashtags
      .map(h => h.startsWith('#') ? h : `#${h}`)
      .filter(h => h.length > 1)

    if (normalizedHashtags.length === 0) {
      return { success: false, error: 'No valid hashtags provided' }
    }

    const config = await ConfigService.getConfig('hashtags')
    const groups = config?.groups || {}

    if (groups[groupName]) {
      return { success: false, error: 'Group already exists' }
    }

    // Add hashtags to available list if not already there
    const available = [...(config?.available || [])]
    normalizedHashtags.forEach(hashtag => {
      if (!available.includes(hashtag)) {
        available.push(hashtag)
      }
    })

    const updated = {
      ...config,
      available,
      groups: {
        ...groups,
        [groupName]: normalizedHashtags
      }
    }

    await ConfigService.saveConfig('hashtags', updated)
    return { success: true, group: { name: groupName, hashtags: normalizedHashtags } }
  }

  /**
   * Update selected hashtags (for current event/session)
   */
  static async updateSelected(selected: string[]) {
    const config = await ConfigService.getConfig('hashtags')
    const updated = {
      ...config,
      selected: selected.map(h => h.startsWith('#') ? h : `#${h}`)
    }
    await ConfigService.saveConfig('hashtags', updated)
    return { success: true, selected: updated.selected }
  }

  /**
   * Get suggested hashtags based on event data
   */
  static async getSuggestedHashtags(eventData: any) {
    const config = await ConfigService.getConfig('hashtags')
    const groups = config?.groups || {}
    const suggestions: string[] = []

    // Suggest based on genre
    if (eventData.genre) {
      const genreLower = eventData.genre.toLowerCase()
      if (groups.Music) {
        suggestions.push(...groups.Music)
      }
      // Check for genre-specific groups
      Object.keys(groups).forEach(groupName => {
        if (groupName.toLowerCase().includes(genreLower) || genreLower.includes(groupName.toLowerCase())) {
          suggestions.push(...groups[groupName])
        }
      })
    }

    // Suggest based on location
    if (eventData.venue?.location || eventData.location) {
      const location = eventData.venue?.location || eventData.location
      if (groups.Event) {
        suggestions.push(...groups.Event)
      }
    }

    // Always suggest general hashtags
    if (groups.General) {
      suggestions.push(...groups.General)
    }

    return [...new Set(suggestions)] // Remove duplicates
  }
}
