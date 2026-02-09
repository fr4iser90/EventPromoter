// Reddit platform service

import { RedditContent, RedditConfig, RedditTargets } from './types.js'
import { RedditValidator } from './validator.js'
import { renderRedditPreview } from './preview.js'
import { RedditTargetService } from './services/targetService.js'

export class RedditService {
  private config: RedditConfig

  constructor(config: RedditConfig = {}) {
    this.config = config
  }

  /**
   * Extract user names from targets configuration
   * Helper function to convert targets (mode/groups/individual) to user name array
   */
  async extractUsersFromTargets(targetsConfig: RedditTargets): Promise<string[]> {
    if (!targetsConfig) return []

    const targetService = new RedditTargetService()
    const allTargets = await targetService.getTargets('user')
    const groups = await targetService.getGroups()

    // targetType is REQUIRED - no fallbacks
    const allUsers = allTargets.map((t: any) => {
      if (!t.targetType) {
        console.error(`Target ${t.id} missing targetType - this should not happen`)
        return undefined
      }
      const baseField = targetService.getBaseField(t.targetType)
      return t[baseField]
    }).filter((username: string | undefined): username is string => username !== undefined)

    if (targetsConfig.mode === 'all') {
      return allUsers
    } else if (targetsConfig.mode === 'groups' && targetsConfig.groups && Array.isArray(targetsConfig.groups)) {
      // Collect all users from selected groups
      const users: string[] = []
      const groupsArray = Array.isArray(groups) ? groups : Object.values(groups)
      for (const groupIdentifier of targetsConfig.groups) {
        // Find group by ID or name
        const group = groupsArray.find((g: any) => g.id === groupIdentifier || g.name === groupIdentifier) as any
        if (!group || !group.targetIds || !Array.isArray(group.targetIds)) continue
        
        // Convert target IDs to usernames (only user type targets)
        const groupUsers = group.targetIds
          .map((targetId: string) => {
            const target = allTargets.find((t: any) => t.id === targetId && t.targetType === 'user')
            if (!target) return undefined
            if (!target.targetType) {
              console.error(`Target ${target.id} missing targetType - this should not happen`)
              return undefined
            }
            const baseField = targetService.getBaseField(target.targetType)
            return target[baseField]
          })
          .filter((username: string | undefined): username is string => username !== undefined)
        users.push(...groupUsers)
      }
      return [...new Set(users)] // Remove duplicates
    } else if (targetsConfig.mode === 'individual' && targetsConfig.individual && Array.isArray(targetsConfig.individual)) {
      // targetType is REQUIRED - no fallbacks
      const targetMapEntries: [string, string][] = []
      for (const t of allTargets) {
        if (!t.targetType) {
          console.error(`Target ${t.id} missing targetType - this should not happen`)
          continue
        }
        const baseField = targetService.getBaseField(t.targetType)
        const baseValue = t[baseField]
        if (baseValue) {
          targetMapEntries.push([t.id, baseValue])
        }
      }
      const targetMap = new Map(targetMapEntries)
      
      const individualUsers: string[] = targetsConfig.individual
        .map((targetId: string) => targetMap.get(targetId))
        .filter((username: string | undefined): username is string => username !== undefined)
      return [...new Set(individualUsers)]
    }

    return []
  }

  /**
   * Extract subreddit names from targets configuration
   * Helper function to convert targets (mode/groups/individual) to subreddit name array
   */
  async extractSubredditsFromTargets(targetsConfig: RedditTargets): Promise<string[]> {
    if (!targetsConfig) return []

    const targetService = new RedditTargetService()
    const allTargets = await targetService.getTargets('subreddit')
    const groups = await targetService.getGroups()

    // targetType is REQUIRED - no fallbacks
    const allSubreddits = allTargets.map((t: any) => {
      if (!t.targetType) {
        console.error(`Target ${t.id} missing targetType - this should not happen`)
        return undefined
      }
      const baseField = targetService.getBaseField(t.targetType)
      return t[baseField]
    }).filter((subreddit: string | undefined): subreddit is string => subreddit !== undefined)

    if (targetsConfig.mode === 'all') {
      return allSubreddits
    } else if (targetsConfig.mode === 'groups' && targetsConfig.groups && Array.isArray(targetsConfig.groups)) {
      // Collect all subreddits from selected groups
      const subreddits: string[] = []
      for (const groupIdentifier of targetsConfig.groups) {
        // Find group by ID or name
        const group = Object.values(groups).find((g: any) => g.id === groupIdentifier || g.name === groupIdentifier)
        if (!group) continue
        
        // Convert target IDs to subreddit names (only subreddit type targets)
        const groupSubreddits = group.targetIds
          .map((targetId: string) => {
            const target = allTargets.find((t: any) => t.id === targetId && t.targetType === 'subreddit')
            if (!target) return undefined
            if (!target.targetType) {
              console.error(`Target ${target.id} missing targetType - this should not happen`)
              return undefined
            }
            const baseField = targetService.getBaseField(target.targetType)
            return target[baseField]
          })
          .filter((subreddit: string | undefined): subreddit is string => subreddit !== undefined)
        subreddits.push(...groupSubreddits)
      }
      return [...new Set(subreddits)] // Remove duplicates
    } else if (targetsConfig.mode === 'individual' && targetsConfig.individual && Array.isArray(targetsConfig.individual)) {
      // targetType is REQUIRED - no fallbacks
      const targetMap = new Map(allTargets.map((t: any) => {
        if (!t.targetType) {
          console.error(`Target ${t.id} missing targetType - this should not happen`)
          return [t.id, undefined]
        }
        const baseField = targetService.getBaseField(t.targetType)
        return [t.id, t[baseField]]
      }).filter((entry): entry is [string, string] => entry[1] !== undefined))
      
      const individualSubreddits: string[] = targetsConfig.individual
        .map((targetId: string) => targetMap.get(targetId))
        .filter((subreddit: string | undefined): subreddit is string => subreddit !== undefined)
      return [...new Set(individualSubreddits)]
    }

    return []
  }

  validateContent(content: RedditContent) {
    return RedditValidator.validateContent(content)
  }

  formatSubreddit(subreddit: string) {
    return RedditValidator.formatSubreddit(subreddit)
  }

  getSubredditUrl(subreddit: string) {
    return RedditValidator.getSubredditUrl(subreddit)
  }

  async transformForAPI(content: RedditContent) {
    // ✅ Support both subreddits AND users
    if (content.subreddits) {
      const subreddits = await this.extractSubredditsFromTargets(content.subreddits)
      if (subreddits.length === 0) {
        throw new Error('No subreddits found in targets configuration')
      }
      const subreddit = subreddits[0]
      
      return {
        title: content.title,
        text: content.text,
        sr: subreddit,
        ...(content.link && { url: content.link }),
        ...(content.image && { media: content.image })
      }
    } else if (content.users) {
      // ✅ User DMs - different API endpoint
      const users = await this.extractUsersFromTargets(content.users)
      if (users.length === 0) {
        throw new Error('No users found in targets configuration')
      }
      // TODO: Implement DM API call
      throw new Error('User DMs not yet implemented in API publisher')
    } else {
      throw new Error('Either subreddits or users target configuration is required')
    }
  }

  generateHashtags(baseTags: string[]): string[] {
    const redditTags = [...baseTags]

    // Reddit doesn't use traditional hashtags, but we can add relevant terms
    if (!redditTags.some(tag => tag.toLowerCase().includes('reddit'))) {
      redditTags.push('discussion')
    }

    return redditTags
  }

  getRequirements() {
    return {
      maxTitleLength: 300,
      supports: ['text', 'image', 'link'],
      required: ['title', 'text', 'targets'], // ✅ GENERIC: targets (subreddits OR users)
      recommended: ['image', 'link', 'detailed-description']
    }
  }

  async getOptimizationTips(content: RedditContent): Promise<string[]> {
    const tips: string[] = []
    const validation = this.validateContent(content)

    if (validation.titleLength < 30) {
      tips.push('Consider a more descriptive title (30+ characters)')
    }

    if (validation.titleLength > 100) {
      tips.push('Very long title - consider shortening for better visibility')
    }

    if (!content.text.includes('?')) {
      tips.push('Consider asking a question to encourage discussion')
    }

    if (content.text.length < 200) {
      tips.push('Reddit posts with more content tend to get better engagement')
    }

    if (!content.image && !content.link) {
      tips.push('Add an image or link to make your post more engaging')
    }

    // Subreddit-specific tips (extract from targets)
    if (content.subreddits) {
      const subreddits = await this.extractSubredditsFromTargets(content.subreddits)
      for (const sub of subreddits) {
        const subLower = sub.toLowerCase()
        if (subLower.includes('event') || subLower.includes('party')) {
          tips.push(`Subreddit '${sub}' appears to be an event subreddit - ensure you follow posting rules`)
          break // Only add once
        }
      }
    }

    return tips
  }

  getPostUrl(subreddit: string, postId?: string): string {
    const baseUrl = this.getSubredditUrl(subreddit)
    return postId ? `${baseUrl}/${postId}` : baseUrl
  }

  async renderPreview(options: {
    content: Record<string, any>
    schema: any
    mode?: string
    client?: string
  }): Promise<{ html: string; css?: string; dimensions?: { width: number; height: number } }> {
    return renderRedditPreview(options)
  }

  /**
   * Extract human-readable target from Reddit content
   * Returns subreddits with r/ prefix
   */
  async extractTarget(content: RedditContent): Promise<string> {
    if (content.subreddits) {
      const subreddits = await this.extractSubredditsFromTargets(content.subreddits)
      if (subreddits.length > 0) {
        const formatted = subreddits.map(s => s.startsWith('r/') ? s : `r/${s}`).join(', ')
        return subreddits.length === 1 ? formatted : `${subreddits.length} subreddits: ${formatted}`
      }
    }
    if (content.users) {
      const users = await this.extractUsersFromTargets(content.users)
      if (users.length > 0) {
        const formatted = users.map(u => `u/${u}`).join(', ')
        return users.length === 1 ? formatted : `${users.length} users: ${formatted}`
      }
    }
    return 'No targets'
  }

  /**
   * Extract response data from n8n/API/Playwright response
   * Reddit API returns: { json: { id, name, url, permalink } }
   */
  extractResponseData(response: any): { postId?: string, url?: string, success: boolean, error?: string } {
    // Handle n8n response format: { json: { id, name, url, permalink } }
    if (response.json) {
      const data = response.json
      const postId = data.id || data.name?.replace('t3_', '')
      const url = data.url || data.permalink || (postId ? `https://reddit.com${data.permalink || ''}` : undefined)
      
      return {
        success: true,
        postId,
        url: url?.startsWith('http') ? url : url ? `https://reddit.com${url}` : undefined
      }
    }

    // Handle direct API response format: { id, name, url, permalink }
    if (response.id || response.name) {
      const postId = response.id || response.name?.replace('t3_', '')
      const url = response.url || response.permalink || (response.name ? `https://reddit.com/r/${response.subreddit}/comments/${postId}/` : undefined)
      
      return {
        success: true,
        postId,
        url: url?.startsWith('http') ? url : url ? `https://reddit.com${url}` : undefined
      }
    }

    // Handle error response
    if (response.error || response.success === false) {
      return {
        success: false,
        error: response.error || response.message || 'Unknown error'
      }
    }

    // If response has success field, use it
    if (typeof response.success === 'boolean') {
      return {
        success: response.success,
        postId: response.postId,
        url: response.url,
        error: response.error
      }
    }

    // Default: assume success if we have any data
    return {
      success: true,
      postId: response.postId,
      url: response.url
    }
  }
}
