/**
 * Step 2: Resolve Global Attachments
 * 
 * Resolves global file IDs to actual file content
 * 
 * @module platforms/email/publishers/api/steps/step2_ResolveGlobalAttachments
 */

import { UploadedFile } from '../../../../../types/index.js'
import { resolveAttachments, ResolvedAttachment } from '../utils/resolveAttachments.js'

export function step2_ResolveGlobalAttachments(
  content: any,
  files: UploadedFile[]
): ResolvedAttachment[] {
  const globalFileIds = content.globalFiles || []
  return resolveAttachments(globalFileIds, files, 'global')
}
