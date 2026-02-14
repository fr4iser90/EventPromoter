// Submit controller for handling Event submissions

import { Request, Response } from 'express'
import { ValidationService } from '../services/validationService.js'
import { N8nService } from '../services/n8nService.js'
import { PublishingService } from '../services/publishingService.js'
import { HistoryService } from '../services/historyService.js'
import { ConfigService } from '../services/configService.js'
import { EventService } from '../services/eventService.js'
import { PublishTrackingService, PublishResult } from '../services/publishTrackingService.js'
import { getBaseUrlFromRequest } from '../utils/requestUtils.js'
import { AuthService } from '../services/authService.js'

export class SubmitController {
  static async submit(req: Request, res: Response) {
    let publishSessionId: string | null = null
    let eventId: string | null = null

    try {
      // ✅ Frontend sends ONLY eventId (or nothing, then use currentEventId)
      const { eventId: requestEventId } = req.body
      
      // Get eventId: from request, or use currentEventId from backend
      eventId = requestEventId || await EventService.getCurrentEventId()
      
      if (!eventId) {
        return res.status(400).json({
          error: 'Event ID required',
          details: 'No event ID provided and no current event found'
        })
      }

      console.log('Received submit request for event:', eventId)

      // ✅ Backend loads EVERYTHING from saved state
      // 1. Load event data
      const eventData = await EventService.getEventData(eventId)
      if (!eventData) {
        return res.status(404).json({
          error: 'Event not found',
          details: `Event ${eventId} does not exist`
        })
      }

      // 2. Load platform content
      const platformContent = await EventService.getAllPlatformContent(eventId)
      console.log('Loaded platform content for:', Object.keys(platformContent))

      // 3. Get selected platforms: from request body (for retry) or from event data
      let selectedPlatforms: string[] = []
      if (req.body.platforms && typeof req.body.platforms === 'object') {
        // ✅ Retry: Use platforms from request body (filter enabled platforms)
        selectedPlatforms = Object.keys(req.body.platforms).filter(p => req.body.platforms[p] === true)
        console.log(`[Retry] Publishing only to platforms: ${selectedPlatforms.join(', ')}`)
      } else if (eventData.selectedPlatforms && Array.isArray(eventData.selectedPlatforms) && eventData.selectedPlatforms.length > 0) {
        // Normal publish: Use platforms from event data
        selectedPlatforms = eventData.selectedPlatforms
      }
      
      if (selectedPlatforms.length === 0) {
        return res.status(400).json({
          error: 'No platforms selected',
          details: 'Please select at least one platform before publishing'
        })
      }

      // Enforce account-level platform restrictions (for review/user separation).
      const allowedPlatforms = ((req as any).authAllowedPlatforms || ['*']) as string[]
      const forbiddenPlatforms = selectedPlatforms.filter((platformId) => !AuthService.isPlatformAllowed(allowedPlatforms, platformId))
      if (forbiddenPlatforms.length > 0) {
        return res.status(403).json({
          error: 'Platform access denied',
          details: `Your account cannot publish to: ${forbiddenPlatforms.join(', ')}`,
          allowedPlatforms
        })
      }

      // 4. Get files from event data
      if (!eventData.uploadedFileRefs || !Array.isArray(eventData.uploadedFileRefs) || eventData.uploadedFileRefs.length === 0) {
        return res.status(400).json({
          error: 'No files found',
          details: 'Event has no uploaded files'
        })
      }
      const files = eventData.uploadedFileRefs

      // 5. Get hashtags from event data
      const hashtags = eventData.selectedHashtags && Array.isArray(eventData.selectedHashtags) ? eventData.selectedHashtags : []

      // 6. Get parsed data for eventData validation
      const parsedData = await EventService.getParsedData(eventId)

      // Build platforms object from selectedPlatforms array
      const platforms: Record<string, boolean> = {}
      selectedPlatforms.forEach((platform: string) => {
        platforms[platform] = true
      })

      publishSessionId = PublishTrackingService.startPublishSession(eventId, selectedPlatforms)

      // Validate event data from parsed data
      if (!parsedData) {
        return res.status(400).json({
          error: 'Parsed data not found',
          details: 'Event has no parsed data. Please upload files first.'
        })
      }
      const eventValidation = ValidationService.validateEventData(parsedData)
      if (!eventValidation.isValid) {
        console.error('❌ Event data validation failed:', eventValidation.errors)
        return res.status(400).json({
          error: 'Event data validation failed',
          details: eventValidation.errors
        })
      }

      // Validate platforms using saved content
      if (platforms && platformContent) {
        const platformValidation = await ValidationService.validatePlatforms(platformContent, selectedPlatforms)
        if (!platformValidation.isValid) {
          console.error('❌ Platform validation failed:', platformValidation.results)
          return res.status(400).json({
            error: 'Platform validation failed',
            details: platformValidation.results
          })
        }
      }

      // Validate files
      const fileValidation = ValidationService.validateFiles(files)
      if (!fileValidation.isValid) {
        console.error('❌ File validation failed:', fileValidation.errors)
        return res.status(400).json({
          error: 'File validation failed',
          details: fileValidation.errors
        })
      }

      // Get base URL from request (proxy-safe, handles all cases)
      const baseUrl = getBaseUrlFromRequest(req)

      // Use PublishingService which handles n8n/API/Playwright routing
      // All data comes from backend storage
      const publishRequest = {
        files,
        platforms,
        content: platformContent, // Use saved platform content
        hashtags,
        eventData: parsedData // Use parsed data for eventData
      }

      // ✅ FIX: Start publishing in background and return sessionId immediately
      // This allows the frontend to connect to the SSE stream BEFORE events are fired
      console.log(`[Submit] Starting background publishing for session: ${publishSessionId}`)
      
      // We don't await this!
      PublishingService.publish(publishRequest, baseUrl, publishSessionId).then(async (publishResult) => {
        console.log(`[Submit] Background publishing completed for session: ${publishSessionId}`)
        
        // Save to history
        try {
          const historyEntry = {
            id: `published-${Date.now()}`,
            title: parsedData.title,
            status: 'published' as const,
            platforms: selectedPlatforms,
            publishedAt: new Date().toISOString(),
            eventData: {
              title: parsedData.title,
              date: parsedData.date,
              time: parsedData.time,
              venue: parsedData.venue,
              city: parsedData.city
            },
            stats: {} // Will be updated later with actual metrics
          }

          await HistoryService.addEvent(historyEntry)
          console.log('Event saved to history')
        } catch (historyError) {
          console.warn('Failed to save to history:', historyError)
        }

        // Add tracking for all platforms
        if (publishSessionId) {
          for (const platform of selectedPlatforms) {
            const platformResult = publishResult.results[platform]
            if (platformResult) {
              const result: PublishResult = {
                platform,
                success: platformResult.success,
                data: {
                  status: platformResult.success ? 'published' : 'failed',
                  method: platformResult.method,
                  submittedAt: new Date().toISOString(),
                  postId: platformResult.postId,
                  url: platformResult.url,
                  error: platformResult.error
                }
              }
              PublishTrackingService.addPublishResult(publishSessionId, result)
            }
          }
        }
      }).catch(async (error: any) => {
        console.error(`[Submit] Background publishing failed for session: ${publishSessionId}`, error)
        
        // Track the error in publish session
        if (publishSessionId && eventId) {
          try {
            for (const platform of selectedPlatforms) {
              const result: PublishResult = {
                platform,
                success: false,
                error: error.message,
                data: {
                  status: 'failed',
                  failedAt: new Date().toISOString()
                }
              }
              PublishTrackingService.addPublishResult(publishSessionId, result)
            }
          } catch (trackError) {
            console.warn('Failed to track background error:', trackError)
          }
        }
      })

      // Return immediately with the sessionId
      return res.json({
        success: true,
        message: 'Publishing started in background',
        publishSessionId
      })

    } catch (error: any) {
      console.error('Submit error:', error)

      // Track the error in publish session
      if (publishSessionId && eventId) {
        try {
          const eventData = await EventService.getEventData(eventId)
          if (eventData && eventData.selectedPlatforms && Array.isArray(eventData.selectedPlatforms)) {
            for (const platform of eventData.selectedPlatforms) {
              const result: PublishResult = {
                platform,
                success: false,
                error: error.message,
                data: {
                  status: 'failed',
                  failedAt: new Date().toISOString()
                }
              }
              PublishTrackingService.addPublishResult(publishSessionId, result)
            }
          }
        } catch (trackError) {
          console.warn('Failed to track error in publish session:', trackError)
        }
      }

      if (error.type) {
        // Custom error from services
        let statusCode = 500
        if (error.type === 'N8N_ERROR') {
          statusCode = error.status ? error.status : 502
        } else if (error.type === 'CONNECTION_ERROR') {
          statusCode = 503
        } else if (error.type === 'NOT_FOUND_ERROR') {
          statusCode = 503
        }

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
