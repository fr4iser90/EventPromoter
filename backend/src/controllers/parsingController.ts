import { Request, Response } from 'express'
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

      // Get file info from event workspace
      // This would come from the uploaded file refs in the current event
      const file: UploadedFile = {
        id: fileId,
        name: req.body.name || 'unknown',
        filename: req.body.filename || 'unknown',
        url: `/api/files/${req.body.eventId}/${req.body.filename}`,
        path: req.body.path,
        size: req.body.size || 0,
        type: req.body.type || 'unknown',
        uploadedAt: req.body.uploadedAt || new Date().toISOString(),
        isImage: req.body.isImage || false
      }

      // Parse the file
      const { parsedData, duplicateCheck } = await SmartParsingService.parseFile(file)

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
      const { fileId, platforms } = req.body

      if (!fileId) {
        return res.status(400).json({ error: 'File ID required' })
      }

      if (!platforms || !Array.isArray(platforms)) {
        return res.status(400).json({ error: 'Platforms array required' })
      }

      // Get file info
      const file: UploadedFile = {
        id: fileId,
        name: req.body.name || 'unknown',
        filename: req.body.filename || 'unknown',
        url: `/api/files/${req.body.eventId}/${req.body.filename}`,
        path: req.body.path,
        size: req.body.size || 0,
        type: req.body.type || 'unknown',
        uploadedAt: req.body.uploadedAt || new Date().toISOString(),
        isImage: req.body.isImage || false
      }

      // Parse the file
      const { parsedData, duplicateCheck } = await SmartParsingService.parseFile(file)

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
