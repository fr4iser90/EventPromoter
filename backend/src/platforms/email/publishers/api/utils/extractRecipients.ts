/**
 * Extract Recipients
 * 
 * Extracts email addresses from targets object
 * Uses EmailTargetService to resolve target IDs to email addresses (same as n8n)
 * 
 * @module platforms/email/publishers/api/utils/extractRecipients
 */

export async function extractRecipients(targets: any): Promise<string[]> {
  if (!targets) return []

  const { EmailTargetService } = await import('../../../services/targetService.js')
  const targetService = new EmailTargetService()
  const allTargets = await targetService.getTargets()
  const groups = await targetService.getGroups()
  
  // targetType is REQUIRED - no fallbacks
  const allRecipients = allTargets.map((t: any) => {
    if (!t.targetType) {
      console.error(`Target ${t.id} missing targetType - this should not happen`)
      return undefined
    }
    const baseField = targetService.getBaseField(t.targetType)
    return t[baseField]
  }).filter((email: string | undefined): email is string => email !== undefined)

  if (targets.mode === 'all') {
    return allRecipients
  } else if (targets.mode === 'groups' && targets.groups && Array.isArray(targets.groups)) {
    // Collect all emails from selected groups
    const emails: string[] = []
    for (const groupIdentifier of targets.groups) {
      // Find group by ID or name (groups is an array)
      const group = groups.find((g: any) => g.id === groupIdentifier || g.name === groupIdentifier)
      if (!group) continue
      
      // Convert target IDs to emails (targetType is REQUIRED)
      const groupEmails = group.targetIds
        .map((targetId: string) => {
          const target = allTargets.find((t: any) => t.id === targetId)
          if (!target) return undefined
          if (!target.targetType) {
            console.error(`Target ${target.id} missing targetType - this should not happen`)
            return undefined
          }
          const baseField = targetService.getBaseField(target.targetType)
          return target[baseField]
        })
        .filter((email: string | undefined): email is string => email !== undefined)
      emails.push(...groupEmails)
    }
    return [...new Set(emails)] // Remove duplicates
  } else if (targets.mode === 'individual' && targets.individual && Array.isArray(targets.individual)) {
    // targetType is REQUIRED - no fallbacks
    const targetMap = new Map(allTargets.map((t: any) => {
      if (!t.targetType) {
        console.error(`Target ${t.id} missing targetType - this should not happen`)
        return [t.id, undefined]
      }
      const baseField = targetService.getBaseField(t.targetType)
      return [t.id, t[baseField]]
    }))
    const individualEmails: string[] = targets.individual
      .map((targetId: string) => targetMap.get(targetId))
      .filter((email: string | undefined): email is string => email !== undefined)
    return [...new Set(individualEmails)]
  }

  return []
}
