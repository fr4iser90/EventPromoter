/**
 * Process Attachments
 * 
 * Resolves specific attachments and processes embedded images
 * 
 * @module platforms/email/publishers/api/steps/processAttachments
 */

import { UploadedFile } from '../../../../../types/index.js'
import { resolveAttachments, ResolvedAttachment } from '../utils/resolveAttachments.js'
import { mergeAttachments } from '../utils/mergeAttachments.js'
import { processEmbeddedImages } from '../utils/processEmbeddedImages.js'

export function processAttachments(
  run: any,
  files: UploadedFile[],
  globalAttachments: ResolvedAttachment[],
  html: string
): { processedHtml: string; processedAttachments: ResolvedAttachment[] } {
  const specificFileIds = run.specificFiles || []
  const specificAttachments = resolveAttachments(specificFileIds, files, 'specific')
  const allAttachments = mergeAttachments(globalAttachments, specificAttachments)

  // Process HTML and attachments for CID embedding
  return processEmbeddedImages(html, allAttachments)
}
