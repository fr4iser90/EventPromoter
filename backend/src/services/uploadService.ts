// Upload Service - Handles file upload operations

import fs from 'fs'
import path from 'path'
import { UploadedFile } from '../types/index.js'

export class UploadService {

  // Clean up temp files
  static cleanupTempFiles(files: Express.Multer.File[]): void {
    files.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      } catch (error) {
        console.warn(`Failed to cleanup temp file: ${file.path}`, error)
      }
    })
  }

  // Move files from temp to final location
  static moveFilesToEvent(files: Express.Multer.File[], eventId: string): UploadedFile[] {
    const eventDir = path.join(process.cwd(), 'events', eventId)
    const filesDir = path.join(eventDir, 'files')

    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true })
    }

    return files.map(file => {
      const finalPath = path.join(filesDir, file.filename)
      fs.renameSync(file.path, finalPath)

      return {
        id: path.parse(file.filename).name,
        name: file.originalname,
        filename: file.filename,
        url: `/api/files/${eventId}/${file.filename}`,
        path: finalPath,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date().toISOString(),
        isImage: file.mimetype.startsWith('image/')
      }
    })
  }

  // Move files to event location and enrich with content for text files
  static moveFilesToEventAndEnrich(files: Express.Multer.File[], eventId: string): UploadedFile[] {
    const movedFiles = this.moveFilesToEvent(files, eventId)

    // Enrich with content for text files
    return movedFiles.map(file => {
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        try {
          const content = fs.readFileSync(file.path, 'utf8')
          return { ...file, content }
        } catch (error) {
          console.warn(`Failed to read content for ${file.name}:`, error)
          return file
        }
      }
      return file
    })
  }

  // Convert multer files to UploadedFile format
  static convertMulterFiles(files: Express.Multer.File[]): UploadedFile[] {
    return files.map(file => ({
      id: path.parse(file.filename).name,
      name: file.originalname,
      filename: file.filename,
      url: `/api/files/temp/${file.filename}`, // Temp URL
      path: file.path,
      size: file.size,
      type: file.mimetype,
      uploadedAt: new Date().toISOString(),
      isImage: file.mimetype.startsWith('image/')
    }))
  }
}
