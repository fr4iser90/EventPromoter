import { Request, Response } from 'express'
import { PublishTrackingService } from '../services/publishTrackingService.js'
import { PublisherEventService } from '../services/publisherEventService.js'

export class PublishController {
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
      console.log(`[SSE] Sending ${bufferedEvents.length} buffered events to session ${sessionId}`)
      for (const event of bufferedEvents) {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }
    }

    // Listen for publisher events
    const eventHandler = (event: any) => {
      try {
        console.log(`[SSE Out] Session: ${sessionId}, Type: ${event.type}, Platform: ${event.platform}, Step: ${event.step || 'N/A'}`)
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
      console.log(`SSE connection closed for session ${sessionId}`)
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
