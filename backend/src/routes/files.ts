import express from 'express'
import { FileController } from '../controllers/fileController.js'
import { uploadSingle, uploadMultiple } from '../middleware/upload.js'
import { fileOperationsRateLimit } from '../middleware/rateLimit.js'

const router = express.Router()

// Upload routes
router.post('/upload', fileOperationsRateLimit, uploadSingle, FileController.uploadFile)
router.post('/upload-multiple', fileOperationsRateLimit, uploadMultiple, FileController.uploadFiles)

// File serving route (THIS IS THE MAIN ONE)
router.get('/:eventId/:filename', fileOperationsRateLimit, FileController.getFile)

// Metadata & Listing
router.get('/list/:eventId', fileOperationsRateLimit, FileController.listFiles)
router.get('/:eventId/:filename/content', fileOperationsRateLimit, FileController.getFileContent)
router.patch('/:eventId/:filename', fileOperationsRateLimit, FileController.updateFileMetadata)
router.delete('/:eventId/:filename', fileOperationsRateLimit, FileController.deleteFile)

export default router
