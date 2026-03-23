/**
 * Extract Template Image File IDs
 *
 * Extracts image URLs from rendered HTML and matches them to uploaded files,
 * so images used in the template can be automatically added as email attachments.
 *
 * @module platforms/email/publishers/api/utils/extractTemplateImageFileIds
 */

import { UploadedFile } from '../../../../../types/index.js'

const IMG_SRC_REGEX = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi

function isImageUrl(url: string): boolean {
  return !!url && !url.startsWith('cid:') && !url.startsWith('data:')
}

function filenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url, 'http://dummy').pathname
    return pathname.split('/').pop()?.split('?')[0] || ''
  } catch {
    return url.split('/').pop()?.split('?')[0] || ''
  }
}

/**
 * Extract image URLs from HTML (same logic as processEmbeddedImages).
 */
export function extractImageUrlsFromHtml(html: string): Array<{ url: string; filename: string }> {
  const result: Array<{ url: string; filename: string }> = []
  let match: RegExpExecArray | null
  IMG_SRC_REGEX.lastIndex = 0
  while ((match = IMG_SRC_REGEX.exec(html)) !== null) {
    const url = match[1]
    if (isImageUrl(url)) {
      result.push({ url, filename: filenameFromUrl(url) })
    }
  }
  return result
}

/**
 * Find uploaded file IDs that correspond to image URLs in the HTML.
 * Matches by: file.id in URL, or filename (file.name / file.filename) equals extracted filename.
 */
export function findFileIdsForImageUrls(
  imageInfos: Array<{ url: string; filename: string }>,
  files: UploadedFile[]
): string[] {
  const ids = new Set<string>()
  for (const { url, filename } of imageInfos) {
    if (!filename) continue
    const lower = filename.toLowerCase()
    const file = files.find(
      (f) =>
        (f.name && f.name.toLowerCase() === lower) ||
        (f.filename && f.filename.toLowerCase() === lower) ||
        (f.path && f.path.replace(/\\/g, '/').toLowerCase().endsWith(lower)) ||
        (f.id && url.includes(f.id))
    )
    if (file) {
      ids.add(file.id)
    }
  }
  return Array.from(ids)
}
