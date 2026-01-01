import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { getFilePath } from '../middleware/upload.js'

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

  // Upload multiple files
  static async uploadFiles(req: Request, res: Response) {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: 'No files uploaded' })
      }

      const eventId = req.body.eventId || 'default'
      const files = req.files as Express.Multer.File[]

      // Return file info for all uploaded files
      const fileInfos = files.map(file => ({
        id: path.parse(file.filename).name,
        name: file.originalname,
        filename: file.filename,
        url: `/api/files/${eventId}/${file.filename}`,
        path: file.path,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date().toISOString()
      }))

      console.log('Files uploaded:', fileInfos.length)

      res.json({
        success: true,
        files: fileInfos
      })

    } catch (error: any) {
      console.error('Files upload error:', error)
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
}
