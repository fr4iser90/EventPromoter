import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { SmartParsingService, ParsedEventData, DuplicateCheckResult } from '../services/smartParsingService.js'
import { PlatformParsingService } from '../services/platformParsingService.js'
import { UploadedFile } from '../types/index.js'

export class ParsingController {
  // Parse uploaded file and return structured data + duplicate check
  static async parseFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params

      if (!fileId) {
        return res.status(400).json({ error: 'File ID required' })
      }

      // Get file info from request body
      const eventId = req.body.eventId
      const filename = req.body.filename

      if (!eventId || !filename) {
        return res.status(400).json({ error: 'Event ID and filename required' })
      }

      // Construct file path
      const filePath = path.join(process.cwd(), 'events', eventId, 'files', filename)

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found on server' })
      }

      // Parse the file
      const { parsedData, duplicateCheck } = await SmartParsingService.parseFileFromPath(filePath, filename, eventId)

      res.json({
        success: true,
        parsedData,
        duplicateCheck
      })

    } catch (error: any) {
      console.error('Parse file error:', error)
      res.status(500).json({
        error: 'Failed to parse file',
        message: error.message
      })
    }
  }

  // Parse file and apply platform-specific optimizations
  static async parseForPlatforms(req: Request, res: Response) {
    try {
      const { parsedData, platforms, eventId } = req.body

      if (!parsedData) {
        return res.status(400).json({ error: 'Parsed data required' })
      }

      if (!platforms || !Array.isArray(platforms)) {
        return res.status(400).json({ error: 'Platforms array required' })
      }

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID required' })
      }

      // Save parsed data to event folder
      await SmartParsingService.saveParsedData(eventId, parsedData)

      // Check for duplicates
      const duplicateCheck = await SmartParsingService.checkForDuplicates(parsedData.hash, eventId)

      // Apply platform-specific parsing
      const platformContent: Record<string, any> = {}

      for (const platform of platforms) {
        try {
          const optimizedContent = await PlatformParsingService.parseForPlatform(platform, parsedData)
          platformContent[platform] = optimizedContent
        } catch (error) {
          console.warn(`Failed to parse for platform ${platform}:`, error)
          platformContent[platform] = null
        }
      }

      res.json({
        success: true,
        parsedData,
        duplicateCheck,
        platformContent
      })

    } catch (error: any) {
      console.error('Parse for platforms error:', error)
      res.status(500).json({
        error: 'Failed to parse for platforms',
        message: error.message
      })
    }
  }

  // Get parsed data for an event
  static async getParsedData(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID required' })
      }

      const parsedData = await SmartParsingService.loadParsedData(eventId)

      if (!parsedData) {
        return res.status(404).json({ error: 'No parsed data found for this event' })
      }

      res.json({
        success: true,
        parsedData
      })

    } catch (error: any) {
      console.error('Get parsed data error:', error)
      res.status(500).json({
        error: 'Failed to get parsed data',
        message: error.message
      })
    }
  }

  // Check for duplicate events
  static async checkDuplicate(req: Request, res: Response) {
    try {
      const { hash, excludeEventId } = req.body

      if (!hash) {
        return res.status(400).json({ error: 'Hash required' })
      }

      const duplicateCheck = await SmartParsingService.checkForDuplicates(hash, excludeEventId)

      res.json({
        success: true,
        duplicateCheck
      })

    } catch (error: any) {
      console.error('Check duplicate error:', error)
      res.status(500).json({
        error: 'Failed to check for duplicates',
        message: error.message
      })
    }
  }
}
