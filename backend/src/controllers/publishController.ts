import { Request, Response } from 'express'
import crypto from 'crypto'
import { PublishTrackingService } from '../services/publishTrackingService.js'
import { PublisherEventService } from '../services/publisherEventService.js'

export class PublishController {
  private static isValidCallbackSecret(provided: string, expected: string): boolean {
    const providedBuffer = Buffer.from(provided, 'utf8')
    const expectedBuffer = Buffer.from(expected, 'utf8')
    if (providedBuffer.length !== expectedBuffer.length) return false
    return crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  }

  /**
   * Ingest external publisher step events (e.g. from n8n callbacks)
   * POST /api/publish/event
   */
  static async ingestEvent(req: Request, res: Response) {
    try {
      const callbackSecret = process.env.PUBLISH_CALLBACK_SECRET?.trim()
      if (!callbackSecret) {
        if (process.env.NODE_ENV === 'production') {
          return res.status(503).json({
            error: 'Callback security not configured',
            message: 'Set PUBLISH_CALLBACK_SECRET in production'
          })
        }
      } else {
        const providedSecretHeader = req.headers['x-eventpromoter-callback-secret']
        const providedSecret = Array.isArray(providedSecretHeader)
          ? providedSecretHeader[0]
          : providedSecretHeader

        if (!providedSecret || !this.isValidCallbackSecret(String(providedSecret), callbackSecret)) {
          return res.status(401).json({
            error: 'UNAUTHORIZED_CALLBACK',
            message: 'Invalid callback secret'
          })
        }
      }

      const body = req.body || {}
      const sessionId = body.sessionId
      const publishRunIdFallback = body.publishRunId

      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({
          error: 'Invalid payload',
          message: 'sessionId is required'
        })
      }

      const eventCandidates = Array.isArray(body.events)
        ? body.events
        : [body.event || body]

      const validTypes = new Set(['step_started', 'step_progress', 'step_completed', 'step_failed'])
      const eventService = PublisherEventService.getInstance(sessionId)
      let accepted = 0

      for (const raw of eventCandidates) {
        if (!raw || typeof raw !== 'object') continue

        const type = raw.type
        const platform = raw.platform
        const method = raw.method
        const step = raw.step
        const publishRunId = raw.publishRunId || publishRunIdFallback

        if (!validTypes.has(type)) continue
        if (!platform || !method || !step) continue
        if (!['api', 'playwright', 'n8n'].includes(method)) continue

        if (type === 'step_started') {
          eventService.stepStarted(platform, method, step, raw.message, publishRunId)
          accepted += 1
          continue
        }

        if (type === 'step_progress') {
          const message = typeof raw.message === 'string' ? raw.message : `Progress update for ${step}`
          const progress = typeof raw.progress === 'number' ? raw.progress : 0
          eventService.stepProgress(platform, method, step, message, progress, publishRunId)
          accepted += 1
          continue
        }

        if (type === 'step_completed') {
          const duration = typeof raw.duration === 'number' ? raw.duration : 0
          eventService.stepCompleted(platform, method, step, duration, publishRunId, raw.data)
          accepted += 1
          continue
        }

        if (type === 'step_failed') {
          eventService.stepFailed(
            platform,
            method,
            step,
            raw.error || 'Unknown error',
            raw.errorCode,
            !!raw.retryable,
            publishRunId
          )
          accepted += 1
        }
      }

      return res.json({
        success: true,
        accepted,
        total: eventCandidates.length
      })
    } catch (error: any) {
      console.error('Error ingesting publish callback event:', error)
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    }
  }

  /**
   * Get publish session results
   */
  static async getPublishResults(req: Request, res: Response) {
    try {
      const { eventId, sessionId } = req.params
      const session = PublishTrackingService.getPublishSession(sessionId)
      
      if (!session) {
        return res.status(404).json({
          error: 'Session not found',
          details: `Publish session ${sessionId} does not exist`
        })
      }

      if (session.eventId !== eventId) {
        return res.status(400).json({
          error: 'Event ID mismatch',
          details: 'Session does not belong to this event'
        })
      }

      res.json({
        success: true,
        session
      })
    } catch (error: any) {
      console.error('Error getting publish results:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    }
  }

  /**
   * Get publish history for event
   */
  static async getEventPublishHistory(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const history = PublishTrackingService.getSessionsForEvent(eventId)
      
      res.json({
        success: true,
        history
      })
    } catch (error: any) {
      console.error('Error getting publish history:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    }
  }

  /**
   * Get latest publish results for event
   */
  static async getLatestPublishResults(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const latest = PublishTrackingService.getLatestSessionForEvent(eventId)
      
      if (!latest) {
        return res.status(404).json({
          error: 'No publish sessions found',
          details: `No publish sessions found for event ${eventId}`
        })
      }

      res.json({
        success: true,
        session: latest
      })
    } catch (error: any) {
      console.error('Error getting latest publish results:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    }
  }

  /**
   * SSE endpoint for real-time publisher feedback
   * GET /api/publish/stream/:sessionId
   */
  static async streamEvents(req: Request, res: Response) {
    const { sessionId } = req.params

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no') // Disable nginx buffering

    // Get or create event service for this session
    const eventService = PublisherEventService.getInstance(sessionId)

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', sessionId, timestamp: Date.now() })}\n\n`)

    // ✅ SEND BUFFERED EVENTS: Send any events that happened before the client connected
    const bufferedEvents = eventService.getBufferedEvents()
    if (bufferedEvents.length > 0) {
      console.log('[SSE] Sending buffered events to session', { sessionId, count: bufferedEvents.length })
      for (const event of bufferedEvents) {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }
    }

    // Listen for publisher events
    const eventHandler = (event: any) => {
      try {
        console.log('[SSE Out]', {
          sessionId,
          type: event.type,
          platform: event.platform,
          step: event.step || 'N/A'
        })
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      } catch (error) {
        console.error('Error writing SSE event:', error)
      }
    }

    eventService.on('publisher_event', eventHandler)

    // Handle client disconnect
    req.on('close', () => {
      eventService.removeListener('publisher_event', eventHandler)
      // Don't remove instance immediately - might reconnect
      console.log('SSE connection closed for session', { sessionId })
    })

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`)
      } catch (error) {
        clearInterval(heartbeat)
      }
    }, 30000) // Every 30 seconds

    // Cleanup on close
    req.on('close', () => {
      clearInterval(heartbeat)
    })
  }
}
