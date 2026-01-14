/**
 * Reddit Subreddit Service
 * 
 * Handles all subreddit management logic for the Reddit platform.
 * This is platform-specific business logic that belongs in the backend.
 * 
 * @module platforms/reddit/subredditService
 */

import { readPlatformData, writePlatformData } from '../../utils/platformDataUtils.js'

const PLATFORM_ID = 'reddit'

export class RedditSubredditService {
  /**
   * Get all subreddits and groups
   */
  static async getSubreddits() {
    // ✅ GENERIC: Use platform data utility (reads from platforms/reddit/data/subreddits.json)
    const config = await readPlatformData(PLATFORM_ID)
    return {
      available: config?.available || [],
      groups: config?.groups || {},
      selected: config?.selected || []
    }
  }

  /**
   * Add a new subreddit
   */
  static async addSubreddit(subreddit: string) {
    const subredditLower = subreddit.trim().toLowerCase().replace(/^r\//, '').replace(/^\//, '')
    
    // Validate subreddit name (Reddit rules: 3-21 chars, alphanumeric + underscore)
    if (!/^[a-z0-9_]{3,21}$/.test(subredditLower)) {
      return { success: false, error: 'Invalid subreddit name. Must be 3-21 characters, alphanumeric and underscores only.' }
    }

    // ✅ GENERIC: Use platform data utility
    const config = await readPlatformData(PLATFORM_ID)
    const available = config?.available || []

    if (available.includes(subredditLower)) {
      return { success: false, error: 'Subreddit already exists' }
    }

    const updated = {
      ...config,
      available: [...available, subredditLower]
    }

    // ✅ GENERIC: Use platform data utility
    await writePlatformData(PLATFORM_ID, updated)
    return { success: true, subreddit: subredditLower }
  }

  /**
   * Remove a subreddit
   */
  static async removeSubreddit(subreddit: string) {
    const subredditLower = subreddit.trim().toLowerCase().replace(/^r\//, '').replace(/^\//, '')
    
    // ✅ GENERIC: Use platform data utility
    const config = await readPlatformData(PLATFORM_ID)
    const available = (config?.available || []).filter((s: string) => s !== subredditLower)
    const groups = { ...(config?.groups || {}) }

    // Remove from all groups
    Object.keys(groups).forEach(groupName => {
      groups[groupName] = groups[groupName].filter((s: string) => s !== subredditLower)
    })

    const updated = {
      ...config,
      available,
      groups
    }

    // ✅ GENERIC: Use platform data utility
    await writePlatformData(PLATFORM_ID, updated)
    return { success: true }
  }

  /**
   * Create a subreddit group
   */
  static async createGroup(groupName: string, subreddits: string[]) {
    const normalizedSubreddits = subreddits
      .map(s => s.trim().toLowerCase().replace(/^r\//, '').replace(/^\//, ''))
      .filter(s => /^[a-z0-9_]{3,21}$/.test(s))

    if (normalizedSubreddits.length === 0) {
      return { success: false, error: 'No valid subreddits provided' }
    }

    // ✅ GENERIC: Use platform data utility
    const config = await readPlatformData(PLATFORM_ID)
    const groups = config?.groups || {}

    if (groups[groupName]) {
      return { success: false, error: 'Group already exists' }
    }

    // Add subreddits to available list if not already there
    const available = [...(config?.available || [])]
    normalizedSubreddits.forEach(subreddit => {
      if (!available.includes(subreddit)) {
        available.push(subreddit)
      }
    })

    const updated = {
      ...config,
      available,
      groups: {
        ...groups,
        [groupName]: normalizedSubreddits
      }
    }

    // ✅ GENERIC: Use platform data utility
    await writePlatformData(PLATFORM_ID, updated)
    return { success: true, group: { name: groupName, subreddits: normalizedSubreddits } }
  }

  /**
   * Update a subreddit group
   */
  static async updateGroup(groupName: string, subreddits: string[]) {
    const normalizedSubreddits = subreddits
      .map((s: string) => s.trim().toLowerCase().replace(/^r\//, '').replace(/^\//, ''))
      .filter((s: string) => /^[a-z0-9_]{3,21}$/.test(s))

    if (normalizedSubreddits.length === 0) {
      return { success: false, error: 'No valid subreddits provided' }
    }

    // ✅ GENERIC: Use platform data utility
    const config = await readPlatformData(PLATFORM_ID)
    const groups = config?.groups || {}

    if (!groups[groupName]) {
      return { success: false, error: 'Group does not exist' }
    }

    // Add subreddits to available list if not already there
    const available = [...(config?.available || [])]
    normalizedSubreddits.forEach(subreddit => {
      if (!available.includes(subreddit)) {
        available.push(subreddit)
      }
    })

    const updated = {
      ...config,
      available,
      groups: {
        ...groups,
        [groupName]: normalizedSubreddits
      }
    }

    // ✅ GENERIC: Use platform data utility
    await writePlatformData(PLATFORM_ID, updated)
    return { success: true, group: { name: groupName, subreddits: normalizedSubreddits } }
  }

  /**
   * Delete a subreddit group
   */
  static async deleteGroup(groupName: string) {
    // ✅ GENERIC: Use platform data utility
    const config = await readPlatformData(PLATFORM_ID)
    const groups = { ...(config?.groups || {}) }
    delete groups[groupName]

    const updated = {
      ...config,
      groups
    }

    // ✅ GENERIC: Use platform data utility
    await writePlatformData(PLATFORM_ID, updated)
    return { success: true }
  }

  /**
   * Import groups from JSON
   */
  static async importGroups(groupsData: Record<string, string[]>) {
    // ✅ GENERIC: Use platform data utility
    const config = await readPlatformData(PLATFORM_ID)
    const groups = { ...(config?.groups || {}) }
    const available = [...(config?.available || [])]

    // Validate and normalize all subreddits
    Object.entries(groupsData).forEach(([groupName, subreddits]) => {
      const normalizedSubreddits = subreddits
        .map(s => s.trim().toLowerCase().replace(/^r\//, '').replace(/^\//, ''))
        .filter(s => /^[a-z0-9_]{3,21}$/.test(s))

      groups[groupName] = normalizedSubreddits

      // Add to available list
      normalizedSubreddits.forEach(subreddit => {
        if (!available.includes(subreddit)) {
          available.push(subreddit)
        }
      })
    })

    const updated = {
      ...config,
      available,
      groups
    }

    // ✅ GENERIC: Use platform data utility
    await writePlatformData(PLATFORM_ID, updated)
    return { success: true, groups }
  }

  /**
   * Export groups as JSON
   */
  static async exportGroups() {
    // ✅ GENERIC: Use platform data utility
    const config = await readPlatformData(PLATFORM_ID)
    return {
      success: true,
      groups: config?.groups || {}
    }
  }
}
