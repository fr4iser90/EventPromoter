import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { getFilePath } from '../middleware/upload.js'
import { EventService } from '../services/eventService.js'
import { ContentExtractionService } from '../services/parsing/contentParsingService.js'
import { UploadService } from '../services/uploadService.js'
import { EventCreationService } from '../services/eventCreationService.js'
import { UploadedFile, ParsedEventData } from '../types/index.js'

export class FileController {
  // Upload single file
  static async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      const eventId = req.body.eventId || 'default'
      const file = req.file

      // Return file info
      const fileInfo = {
        id: path.parse(file.filename).name,
        name: file.originalname,
        filename: file.filename,
        url: `/api/files/${eventId}/${file.filename}`,
        path: file.path,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date().toISOString()
      }

      console.log('File uploaded:', fileInfo)

      res.json({
        success: true,
        file: fileInfo
      })

    } catch (error: any) {
      console.error('File upload error:', error)
      res.status(500).json({
        error: 'File upload failed',
        message: error.message
      })
    }
  }

  // Upload multiple files (orchestrator pattern)
  static async uploadFiles(req: Request, res: Response) {
    const files = req.files as Express.Multer.File[]

    try {
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' })
      }

      // 1. Parse uploaded files (service)
      const parsedData = await ContentExtractionService.parseUploadedFiles(files)

      if (!parsedData || !parsedData.title) {
        // Cleanup temp files and return error
        UploadService.cleanupTempFiles(files)
        return res.status(400).json({ error: 'No event title found in uploaded files' })
      }

      // 2. Convert files and enrich with content
      const uploadedFileInfos: UploadedFile[] = files.map(file => {
        const baseFile: UploadedFile = {
          id: path.parse(file.filename).name,
          name: file.originalname,
          filename: file.filename,
          url: `/api/files/temp/${file.filename}`,
          path: file.path,
          size: file.size,
          type: file.mimetype,
          uploadedAt: new Date().toISOString(),
          isImage: file.mimetype.startsWith('image/')
        }

        // Add content for text files
        if (file.mimetype.startsWith('text/')) {
          try {
            baseFile.content = fs.readFileSync(file.path, 'utf8')
          } catch (error) {
            console.warn(`Failed to read content for ${file.originalname}:`, error)
          }
        }

        return baseFile
      })

      // 3. Create event from parsed data (service)
      const event = await EventCreationService.createEventFromParsedData(parsedData, uploadedFileInfos)

      // 4. Move files to final event location (service)
      const finalFiles = UploadService.moveFilesToEvent(files, event.id)

      // Update event with final file references (keep content)
      event.uploadedFileRefs = finalFiles.map((finalFile, index) => ({
        ...finalFile,
        content: uploadedFileInfos[index].content // Preserve content
      }))

      await EventService.saveEventData(event.id, event)

      console.log(`Upload: Event created ${event.id} (${event.name})`)

      res.json({
        success: true,
        files: finalFiles,
        createdEvent: event,
        parsedData
      })

    } catch (error: any) {
      console.error('Files upload error:', error)

      // Cleanup temp files on error (service)
      UploadService.cleanupTempFiles(files)

      res.status(500).json({
        error: 'Files upload failed',
        message: error.message
      })
    }
  }

  // Serve file by Event ID and filename
  static async getFile(req: Request, res: Response) {
    try {
      const { eventId, filename } = req.params

      if (!eventId || !filename) {
        return res.status(400).json({ error: 'Event ID and filename required' })
      }

      const filePath = getFilePath(eventId, filename)

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' })
      }

      // Set appropriate headers
      const ext = path.extname(filename).toLowerCase()
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.md': 'text/markdown'
      }

      const contentType = mimeTypes[ext] || 'application/octet-stream'
      res.setHeader('Content-Type', contentType)

      // Set CORP header for images to allow cross-origin access
      if (contentType.startsWith('image/')) {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      }

      // Stream the file
      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)

      fileStream.on('error', (error) => {
        console.error('File stream error:', error)
        res.status(500).json({ error: 'Error reading file' })
      })

    } catch (error: any) {
      console.error('Get file error:', error)
      res.status(500).json({
        error: 'Failed to serve file',
        message: error.message
      })
    }
  }

  // Delete file
  static async deleteFile(req: Request, res: Response) {
    try {
      const { eventId, filename } = req.params

      if (!eventId || !filename) {
        return res.status(400).json({ error: 'Event ID and filename required' })
      }

      const filePath = getFilePath(eventId, filename)

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' })
      }

      // Delete file
      fs.unlinkSync(filePath)

      console.log('File deleted:', filePath)

      res.json({
        success: true,
        message: 'File deleted successfully'
      })

    } catch (error: any) {
      console.error('Delete file error:', error)
      res.status(500).json({
        error: 'Failed to delete file',
        message: error.message
      })
    }
  }

  // List files for Event
  static async listFiles(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID required' })
      }

      const EventDir = path.join(process.cwd(), 'events', eventId, 'files')

      if (!fs.existsSync(EventDir)) {
        return res.json({ files: [] })
      }

      const files = fs.readdirSync(EventDir).map(filename => {
        const filePath = path.join(EventDir, filename)
        const stats = fs.statSync(filePath)

        return {
          id: path.parse(filename).name,
          name: filename,
          url: `/api/files/${eventId}/${filename}`,
          path: filePath,
          size: stats.size,
          type: 'unknown', // Could be determined from extension
          uploadedAt: stats.birthtime.toISOString()
        }
      })

      res.json({ files })

    } catch (error: any) {
      console.error('List files error:', error)
      res.status(500).json({
        error: 'Failed to list files',
        message: error.message
      })
    }
  }

  // Get file content (for text files)
  static async getFileContent(req: Request, res: Response) {
    try {
      const { eventId, filename } = req.params

      if (!eventId || !filename) {
        return res.status(400).json({ error: 'Event ID and filename required' })
      }

      const filePath = getFilePath(eventId, filename)

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' })
      }

      const ext = path.extname(filename).toLowerCase()
      const textExtensions = ['.txt', '.md', '.csv', '.json']

      // Only allow text files for content reading
      if (!textExtensions.includes(ext)) {
        return res.status(400).json({ error: 'File type not supported for content preview' })
      }

      // Read file content
      const content = fs.readFileSync(filePath, 'utf8')

      res.json({
        success: true,
        content: content,
        filename: filename,
        size: fs.statSync(filePath).size,
        type: ext === '.md' ? 'text/markdown' : ext === '.txt' ? 'text/plain' : 'text/plain'
      })

    } catch (error: any) {
      console.error('Get file content error:', error)
      res.status(500).json({
        error: 'Failed to read file content',
        message: error.message
      })
    }
  }
}
