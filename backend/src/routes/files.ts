import express from 'express'
import { FileController } from '../controllers/fileController.js'
import { uploadSingle, uploadMultiple } from '../middleware/upload.js'

const router = express.Router()

// Upload single file
router.post('/upload', uploadSingle, FileController.uploadFile)

// Upload multiple files
router.post('/upload-multiple', uploadMultiple, FileController.uploadFiles)

// Get file by Event ID and filename
router.get('/:eventId/:filename', FileController.getFile)

// Delete file
router.delete('/:eventId/:filename', FileController.deleteFile)

// List files for Event
router.get('/list/:eventId', FileController.listFiles)

// Get file content (for text files)
router.get('/content/:eventId/:filename', FileController.getFileContent)

export default router
