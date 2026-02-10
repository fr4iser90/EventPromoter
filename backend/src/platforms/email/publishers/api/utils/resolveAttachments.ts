/**
 * Resolve Attachments
 * 
 * Resolves file IDs to actual file content and validates visibility
 * 
 * @module platforms/email/publishers/api/utils/resolveAttachments
 */

import { UploadedFile } from '../../../../../types/index.js'
import fs from 'fs'
import path from 'path'

export interface ResolvedAttachment {
  filename: string
  buffer: Buffer
  contentType: string
  cid?: string // Content-ID for embedded images
}

export function resolveAttachments(
  fileIds: string[] | any[],
  availableFiles: UploadedFile[],
  scope: 'global' | 'specific'
): ResolvedAttachment[] {
  const resolved: ResolvedAttachment[] = []

  for (const item of fileIds) {
    // Handle both string IDs and file objects
    let id: string
    if (typeof item === 'string') {
      id = item
    } else if (item && typeof item === 'object') {
      // Extract ID from object (could be id, filename, or name property)
      id = item.id || item.filename || item.name || String(item)
    } else {
      console.warn(`Invalid file ID format: ${item}`)
      continue
    }

    const file = availableFiles.find(f => f.id === id || f.filename === id || f.name === id)
    if (!file) {
      console.warn(`File not found for ID: ${id}`)
      continue
    }

    try {
      // Resolve path - handle both absolute and relative paths
      const absolutePath = path.isAbsolute(file.path) 
        ? file.path 
        : path.join(process.cwd(), file.path)

      if (fs.existsSync(absolutePath)) {
        resolved.push({
          filename: file.name,
          buffer: fs.readFileSync(absolutePath),
          contentType: file.type
        })
      } else {
        console.warn(`File path not found: ${absolutePath}`)
      }
    } catch (err) {
      console.error(`Failed to read file ${file.name}:`, err)
    }
  }

  return resolved
}
