/**
 * Process Embedded Images
 * 
 * Processes HTML and attachments for CID embedding
 * - Finds image URLs in HTML
 * - Replaces URLs with CID references
 * - Sets Content-ID for matching image attachments
 * 
 * @module platforms/email/publishers/api/utils/processEmbeddedImages
 */

import { ResolvedAttachment } from './resolveAttachments.js'

export function processEmbeddedImages(
  html: string,
  attachments: ResolvedAttachment[]
): { processedHtml: string; processedAttachments: ResolvedAttachment[] } {
  // Helper function to extract path from URL (normalizes localhost vs IP differences)
  const getUrlPath = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname + urlObj.search // path + query params
    } catch (e) {
      return url
    }
  }

  // Check if attachment is an image
  const isImage = (contentType: string): boolean => {
    return /^image\/(jpeg|jpg|png|gif|webp|bmp)$/i.test(contentType)
  }

  // Build attachment map by normalized path and filename
  const attachmentMap = new Map<string, ResolvedAttachment>()
  attachments.forEach(att => {
    // Store by filename (for CID matching)
    attachmentMap.set(att.filename, att)
  })

  // Extract all image URLs from HTML
  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  const imageUrlMatches: Array<{ url: string; normalizedPath: string; filename: string }> = []
  let match

  while ((match = imageRegex.exec(html)) !== null) {
    const imageUrl = match[1]
    // Only process if it's a URL (not already CID or data URI)
    if (imageUrl && !imageUrl.startsWith('cid:') && !imageUrl.startsWith('data:')) {
      const normalizedPath = getUrlPath(imageUrl)
      const urlFilename = imageUrl.split('/').pop()?.split('?')[0] || ''
      imageUrlMatches.push({
        url: imageUrl,
        normalizedPath: normalizedPath,
        filename: urlFilename
      })
    }
  }

  // Replace image URLs in HTML with CID references
  let processedHtml = html
  const matchedImageFilenames = new Set<string>()

  // Process each image URL match
  for (const imageMatch of imageUrlMatches) {
    // Try to find attachment by filename
    const attachment = attachmentMap.get(imageMatch.filename)
    
    if (attachment && isImage(attachment.contentType)) {
      // Replace URL with CID reference using regex (handles multiple occurrences)
      const escapedUrl = imageMatch.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(
        `(<img[^>]+src=["'])${escapedUrl}(["'][^>]*>)`,
        'gi'
      )
      processedHtml = processedHtml.replace(regex, `$1cid:${attachment.filename}$2`)
      matchedImageFilenames.add(attachment.filename)
    }
  }

  // Process attachments: set Content-ID for matched images
  const processedAttachments = attachments.map(att => {
    if (isImage(att.contentType) && matchedImageFilenames.has(att.filename)) {
      // Return attachment with Content-ID metadata
      return {
        ...att,
        cid: att.filename // Content-ID for embedded images
      }
    }
    return att
  })

  return { processedHtml, processedAttachments }
}
