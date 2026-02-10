/**
 * Merge Attachments
 * 
 * Merges global and specific attachments, deduplicating by filename
 * 
 * @module platforms/email/publishers/api/utils/mergeAttachments
 */

import { ResolvedAttachment } from './resolveAttachments.js'

export function mergeAttachments(
  global: ResolvedAttachment[],
  specific: ResolvedAttachment[]
): ResolvedAttachment[] {
  const map = new Map<string, ResolvedAttachment>()
  
  global.forEach(a => map.set(a.filename, a))
  specific.forEach(a => map.set(a.filename, a)) // Specific overrides global if filename is same

  return Array.from(map.values())
}
