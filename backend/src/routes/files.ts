import express from 'express'
import { FileController } from '../controllers/fileController.js'
import { uploadSingle, uploadMultiple } from '../middleware/upload.js'

const router = express.Router()

// Upload routes
router.post('/upload', uploadSingle, FileController.uploadFile)
router.post('/upload-multiple', uploadMultiple, FileController.uploadFiles)

// File serving route (THIS IS THE MAIN ONE)
router.get('/:eventId/:filename', FileController.getFile)

// Metadata & Listing
router.get('/list/:eventId', FileController.listFiles)
router.get('/:eventId/:filename/content', FileController.getFileContent)
router.patch('/:eventId/:filename', FileController.updateFileMetadata)
router.delete('/:eventId/:filename', FileController.deleteFile)

export default router
