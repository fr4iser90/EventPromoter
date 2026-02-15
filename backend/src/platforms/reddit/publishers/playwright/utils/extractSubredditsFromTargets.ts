import { RedditTargetService } from '../../../services/targetService.js'
import { RedditTargets } from '../../../types.js'

export async function extractSubredditsFromTargets(targetsConfig: RedditTargets): Promise<string[]> {
  if (!targetsConfig) return []

  const targetService = new RedditTargetService()
  const allTargets = await targetService.getTargets('subreddit')
  const groups = await targetService.getGroups()

  const allSubreddits = allTargets.map((t: any) => {
    if (!t.targetType) {
      console.error('Target missing targetType - this should not happen', { targetId: t.id })
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
    const groupsArray = Array.isArray(groups) ? groups : Object.values(groups)
    for (const groupIdentifier of targetsConfig.groups) {
      // Find group by ID or name
      const group = groupsArray.find((g: any) => g.id === groupIdentifier || g.name === groupIdentifier) as any
      if (!group || !group.targetIds || !Array.isArray(group.targetIds)) continue
      
      // Convert target IDs to subreddit names (only subreddit type targets)
      const groupSubreddits = group.targetIds
        .map((targetId: string) => {
          const target = allTargets.find((t: any) => t.id === targetId && t.targetType === 'subreddit')
          if (!target) return undefined
          if (!target.targetType) {
            console.error('Target missing targetType - this should not happen', { targetId: target.id })
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
        console.error('Target missing targetType - this should not happen', { targetId: t.id })
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
