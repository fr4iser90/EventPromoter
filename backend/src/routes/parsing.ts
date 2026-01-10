import { Router } from 'express'
import { ParsingController } from '../controllers/parsingController.js'

const router = Router()

// Parse single file
router.post('/file/:fileId', ParsingController.parseFile)

// Parse file for multiple platforms
router.post('/platforms', ParsingController.parseForPlatforms)

// Get parsed data for event
router.get('/data/:eventId', ParsingController.getParsedData)

// Update parsed data for event
router.put('/data/:eventId', ParsingController.updateParsedData)

// Check for duplicate events
router.post('/duplicate-check', ParsingController.checkDuplicate)

// Save platform content changes
router.put('/platform-content/:eventId', ParsingController.savePlatformContent)

export default router
