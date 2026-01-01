import { Request, Response } from 'express'
import { PublishTrackingService } from '../services/publishTrackingService.js'

export class PublishController {
  // Get publish session results
  static async getPublishResults(req: Request, res: Response) {
    try {
      const { eventId, sessionId } = req.params

      if (!eventId || !sessionId) {
        return res.status(400).json({ error: 'Event ID and Session ID required' })
      }

      // Try to get from memory first
      let session = PublishTrackingService.getPublishSession(sessionId)

      // If not in memory, try to load from file
      if (!session) {
        session = PublishTrackingService.loadPublishSession(eventId, sessionId)
      }

      if (!session) {
        return res.status(404).json({ error: 'Publish session not found' })
      }

      res.json({
        success: true,
        session
      })

    } catch (error: any) {
      console.error('Get publish results error:', error)
      res.status(500).json({
        error: 'Failed to get publish results',
        message: error.message
      })
    }
  }

  // Get all publish sessions for an event
  static async getEventPublishHistory(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID required' })
      }

      const sessions = PublishTrackingService.getSessionsForEvent(eventId)
      const stats = PublishTrackingService.getPublishStats(eventId)

      res.json({
        success: true,
        sessions,
        stats
      })

    } catch (error: any) {
      console.error('Get event publish history error:', error)
      res.status(500).json({
        error: 'Failed to get publish history',
        message: error.message
      })
    }
  }

  // Get latest publish session for event
  static async getLatestPublishResults(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      if (!eventId) {
        return res.status(400).json({ error: 'Event ID required' })
      }

      const session = PublishTrackingService.getLatestSessionForEvent(eventId)

      if (!session) {
        return res.status(404).json({ error: 'No publish sessions found for this event' })
      }

      res.json({
        success: true,
        session
      })

    } catch (error: any) {
      console.error('Get latest publish results error:', error)
      res.status(500).json({
        error: 'Failed to get latest publish results',
        message: error.message
      })
    }
  }
}
