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
  const cwd = process.cwd()
  const allowedRoots = [
    path.resolve(cwd, 'events'),
    path.resolve(cwd, 'temp')
  ]

  const isPathInsideAllowedRoot = (targetPath: string): boolean => {
    const normalizedTarget = path.resolve(targetPath)
    return allowedRoots.some((root) => normalizedTarget === root || normalizedTarget.startsWith(`${root}${path.sep}`))
  }

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
      if (!file.path || file.path.includes('\0')) {
        console.warn(`Invalid file path for attachment: ${id}`)
        continue
      }

      // Resolve path - handle both absolute and relative paths
      const absolutePath = path.isAbsolute(file.path)
        ? path.resolve(file.path)
        : path.resolve(cwd, file.path)

      if (!isPathInsideAllowedRoot(absolutePath)) {
        console.warn(`Attachment path outside allowed roots: ${absolutePath}`)
        continue
      }

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
