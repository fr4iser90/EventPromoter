import { Router } from 'express'
import { ParsingController } from '../controllers/parsingController.js'
import { parsingRateLimit } from '../middleware/rateLimit.js'

const router = Router()

// Parse single file
router.post('/file/:fileId', parsingRateLimit, ParsingController.parseFile)

// Parse file for multiple platforms
router.post('/platforms', parsingRateLimit, ParsingController.parseForPlatforms)

// Get parsed data for event
router.get('/data/:eventId', parsingRateLimit, ParsingController.getParsedData)

// Update parsed data for event
router.put('/data/:eventId', parsingRateLimit, ParsingController.updateParsedData)

// Check for duplicate events
router.post('/duplicate-check', parsingRateLimit, ParsingController.checkDuplicate)

// Save platform content changes
router.put('/platform-content/:eventId', parsingRateLimit, ParsingController.savePlatformContent)

export default router
