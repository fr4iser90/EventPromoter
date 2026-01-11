import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { ContentExtractionService, DuplicateCheckResult } from '../services/parsing/contentParsingService.js'
import { ParsedEventData } from '../types/index.js'
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
      const { parsedData, duplicateCheck } = await ContentExtractionService.parseFileFromPath(filePath, filename, eventId)

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
      await ContentExtractionService.saveParsedData(eventId, parsedData)

      // Check for duplicates
      const duplicateCheck = await ContentExtractionService.checkForDuplicates(parsedData.hash, eventId)

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

      const parsedData = await ContentExtractionService.loadParsedData(eventId)

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

  // Update parsed data for an event
  static async updateParsedData(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const { parsedData } = req.body

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID required' })
      }

      if (!parsedData) {
        return res.status(400).json({ error: 'Parsed data required' })
      }

      // Save updated parsed data
      await ContentExtractionService.saveParsedData(eventId, parsedData)

      res.json({
        success: true,
        message: 'Parsed data updated successfully',
        parsedData
      })

    } catch (error: any) {
      console.error('Update parsed data error:', error)
      res.status(500).json({
        error: 'Failed to update parsed data',
        message: error.message
      })
    }
  }

  // Save platform content changes
  static async savePlatformContent(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const { platform, content } = req.body

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID required' })
      }

      if (!platform || !content) {
        return res.status(400).json({ error: 'Platform and content required' })
      }

      // Load existing parsed data
      const existingData = await ContentExtractionService.loadParsedData(eventId)
      if (!existingData) {
        return res.status(404).json({ error: 'Event data not found' })
      }

      // Save platform content to separate file
      await ContentExtractionService.savePlatformContent(eventId, platform, content)

      res.json({
        success: true,
        message: `Platform content for ${platform} saved successfully`
      })

    } catch (error: any) {
      console.error('Save platform content error:', error)
      res.status(500).json({
        error: 'Failed to save platform content',
        details: error.message
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

      const duplicateCheck = await ContentExtractionService.checkForDuplicates(hash, excludeEventId)

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
