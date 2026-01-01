import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'

// Create workspace directory structure
const createWorkspaceDir = (eventId: string): string => {
  const workspaceDir = path.join(process.cwd(), 'workspaces', eventId, 'files')
  if (!fs.existsSync(workspaceDir)) {
    fs.mkdirSync(workspaceDir, { recursive: true })
  }
  return workspaceDir
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const eventId = req.body.eventId || 'default'
    const uploadDir = createWorkspaceDir(eventId)
    cb(null, uploadDir)
  },
  filename: (req: Request, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const basename = path.basename(file.originalname, ext)
    cb(null, `${basename}-${uniqueSuffix}${ext}`)
  }
})

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images, PDFs, and text files
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/markdown'
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`))
  }
}

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files
  }
})

// Single file upload middleware
export const uploadSingle = upload.single('file')

// Multiple files upload middleware
export const uploadMultiple = upload.array('files', 10)

// Get file URL helper
export const getFileUrl = (eventId: string, filename: string): string => {
  return `/api/files/${eventId}/${filename}`
}

// Get file path helper
export const getFilePath = (eventId: string, filename: string): string => {
  return path.join(process.cwd(), 'workspaces', eventId, 'files', filename)
}
