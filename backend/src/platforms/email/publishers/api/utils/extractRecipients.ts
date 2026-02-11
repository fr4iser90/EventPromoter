/**
 * Extract Recipients
 * 
 * Extracts email addresses from targets object
 * Uses EmailTargetService to resolve target IDs to email addresses (same as n8n)
 * 
 * @module platforms/email/publishers/api/utils/extractRecipients
 */

import { EmailRecipient } from '../../../types.js'

export async function extractRecipients(targets: any, includeMetadata: boolean = false): Promise<EmailRecipient[] | string[]> {
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
    if (includeMetadata) {
      return {
        email: t[baseField],
        firstName: t.firstName,
        lastName: t.lastName,
        gender: t.gender,
        salutationTone: t.salutationTone
      } as EmailRecipient
    }
    return t[baseField]
  }).filter((res: any): res is any => res !== undefined)

  if (targets.mode === 'all') {
    return allRecipients
  } else if (targets.mode === 'groups' && targets.groups && Array.isArray(targets.groups)) {
    // Collect all emails from selected groups
    const recipients: any[] = []
    for (const groupIdentifier of targets.groups) {
      // Find group by ID or name (groups is an array)
      const group = groups.find((g: any) => g.id === groupIdentifier || g.name === groupIdentifier)
      if (!group) continue
      
      // Convert target IDs to emails (targetType is REQUIRED)
      const groupRecipients = group.targetIds
        .map((targetId: string) => {
          const target = allTargets.find((t: any) => t.id === targetId)
          if (!target) return undefined
          if (!target.targetType) {
            console.error(`Target ${target.id} missing targetType - this should not happen`)
            return undefined
          }
          const baseField = targetService.getBaseField(target.targetType)
          if (includeMetadata) {
            return {
              email: target[baseField],
              firstName: target.firstName,
              lastName: target.lastName,
              gender: target.gender,
              salutationTone: target.salutationTone
            } as EmailRecipient
          }
          return target[baseField]
        })
        .filter((res: any): res is any => res !== undefined)
      recipients.push(...groupRecipients)
    }
    // Remove duplicates based on email
    if (includeMetadata) {
      const seen = new Set()
      return recipients.filter(r => {
        const duplicate = seen.has(r.email)
        seen.add(r.email)
        return !duplicate
      })
    }
    return [...new Set(recipients)] 
  } else if (targets.mode === 'individual' && targets.individual && Array.isArray(targets.individual)) {
    // targetType is REQUIRED - no fallbacks
    const individualRecipients: any[] = targets.individual
      .map((targetId: string) => {
        const target = allTargets.find((t: any) => t.id === targetId)
        if (!target) return undefined
        const baseField = targetService.getBaseField(target.targetType)
        if (includeMetadata) {
          return {
            email: target[baseField],
            firstName: target.firstName,
            lastName: target.lastName,
            gender: target.gender,
            salutationTone: target.salutationTone
          } as EmailRecipient
        }
        return target[baseField]
      })
      .filter((res: any): res is any => res !== undefined)
    
    if (includeMetadata) {
      const seen = new Set()
      return individualRecipients.filter(r => {
        const duplicate = seen.has(r.email)
        seen.add(r.email)
        return !duplicate
      })
    }
    return [...new Set(individualRecipients)]
  }

  return []
}
