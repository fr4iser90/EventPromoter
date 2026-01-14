// Submit controller for handling Event submissions

import { Request, Response } from 'express'
import { ValidationService } from '../services/validationService.js'
import { N8nService } from '../services/n8nService.js'
import { PublishingService } from '../services/publishingService.js'
import { HistoryService } from '../services/historyService.js'
import { ConfigService } from '../services/configService.js'
import { EventService } from '../services/eventService.js'
import { PublishTrackingService, PublishResult } from '../services/publishTrackingService.js'

export class SubmitController {
  static async submit(req: Request, res: Response) {
    let publishSessionId: string | null = null
    const {
      files,
      platforms,
      content,
      hashtags,
      n8nUrl,
      eventData
    } = req.body

    try {

      console.log('Received submit request:', { files: files?.length, platforms, n8nUrl })
      console.log('Content structure:', JSON.stringify(content, null, 2))

      // Start publish tracking session
      const eventId = eventData?.id || `event-${Date.now()}`
      const platformList = Object.keys(platforms || {})
      publishSessionId = PublishTrackingService.startPublishSession(eventId, platformList)

      // Validate event data
      if (eventData) {
        const eventValidation = ValidationService.validateEventData(eventData)
        if (!eventValidation.isValid) {
          return res.status(400).json({
            error: 'Event data validation failed',
            details: eventValidation.errors
          })
        }
      }

      // Validate platforms
      if (platforms && content) {
        const platformValidation = await ValidationService.validatePlatforms(content, Object.keys(platforms))
        if (!platformValidation.isValid) {
          return res.status(400).json({
            error: 'Platform validation failed',
            details: platformValidation.results
          })
        }
      }

      // Validate files
      if (files) {
        const fileValidation = ValidationService.validateFiles(files)
        if (!fileValidation.isValid) {
          return res.status(400).json({
            error: 'File validation failed',
            details: fileValidation.errors
          })
        }
      }

      // Use PublishingService which handles n8n/API/Playwright routing
      const publishRequest = {
        files,
        platforms,
        content,
        hashtags,
        eventData
      }

      const publishResult = await PublishingService.publish(publishRequest)

      // Save to history
      try {
        const historyEntry = {
          id: `published-${Date.now()}`,
          name: eventData?.title || content?.eventTitle || 'Event Promotion',
          status: 'published' as const,
          platforms: Object.keys(platforms || {}),
          publishedAt: new Date().toISOString(),
          eventData: {
            title: eventData?.title || content?.eventTitle,
            date: eventData?.date || content?.eventDate,
            time: eventData?.time || content?.eventTime,
            venue: eventData?.venue || content?.venue,
            city: eventData?.city || content?.city
          },
          stats: {} // Will be updated later with actual metrics
        }

        await HistoryService.addEvent(historyEntry)
        console.log('Event saved to history')
      } catch (historyError) {
        console.warn('Failed to save to history:', historyError)
        // Don't fail the whole submission if history save fails
      }

      // Add tracking for all platforms
      if (publishSessionId) {
        for (const platform of platformList) {
          const platformResult = publishResult.results[platform]
          const result: PublishResult = {
            platform,
            success: platformResult?.success || false,
            data: {
              status: platformResult?.success ? 'published' : 'failed',
              method: platformResult?.method || 'unknown',
              submittedAt: new Date().toISOString(),
              postId: platformResult?.postId,
              url: platformResult?.url,
              error: platformResult?.error
            }
          }
          PublishTrackingService.addPublishResult(publishSessionId, result)
        }
      }

      res.json({
        success: publishResult.success,
        results: publishResult.results,
        message: publishResult.message,
        historySaved: true,
        publishSessionId
      })

    } catch (error: any) {
      console.error('Submit error:', error)

      // Track the error in publish session
      if (publishSessionId) {
        for (const platform of Object.keys(platforms || {})) {
          const result: PublishResult = {
            platform,
            success: false,
            error: error.message || 'Unknown error',
            data: {
              status: 'failed',
              failedAt: new Date().toISOString()
            }
          }
          PublishTrackingService.addPublishResult(publishSessionId, result)
        }
      }

      if (error.type) {
        // Custom error from services
        const statusCode = error.type === 'N8N_ERROR' ? error.status || 502 :
                          error.type === 'CONNECTION_ERROR' ? 503 :
                          error.type === 'NOT_FOUND_ERROR' ? 503 : 500

        return res.status(statusCode).json({
          error: error.message,
          type: error.type,
          details: error.details
        })
      }

      // Generic error
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}
