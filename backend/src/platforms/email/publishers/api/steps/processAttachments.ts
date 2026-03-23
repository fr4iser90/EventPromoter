/**
 * Process Attachments
 *
 * Resolves specific attachments, auto-adds images that appear in the template HTML,
 * and processes embedded images (CID).
 *
 * @module platforms/email/publishers/api/steps/processAttachments
 */

import { UploadedFile } from '../../../../../types/index.js'
import { resolveAttachments, ResolvedAttachment } from '../utils/resolveAttachments.js'
import { mergeAttachments } from '../utils/mergeAttachments.js'
import { processEmbeddedImages } from '../utils/processEmbeddedImages.js'
import { extractImageUrlsFromHtml, findFileIdsForImageUrls } from '../utils/extractTemplateImageFileIds.js'

export function processAttachments(
  run: any,
  files: UploadedFile[],
  globalAttachments: ResolvedAttachment[],
  html: string
): { processedHtml: string; processedAttachments: ResolvedAttachment[] } {
  const specificFileIds = run.specificFiles || []
  const specificAttachments = resolveAttachments(specificFileIds, files, 'specific')
  let allAttachments = mergeAttachments(globalAttachments, specificAttachments)

  // Auto-add images that appear in the template HTML as attachments (so they are sent with the email)
  const imageInfos = extractImageUrlsFromHtml(html)
  if (imageInfos.length > 0 && files.length > 0) {
    const templateImageFileIds = findFileIdsForImageUrls(imageInfos, files)
    if (templateImageFileIds.length > 0) {
      const templateAttachments = resolveAttachments(templateImageFileIds, files, 'specific')
      allAttachments = mergeAttachments(allAttachments, templateAttachments)
    }
  }

  // Process HTML and attachments for CID embedding
  return processEmbeddedImages(html, allAttachments)
}
