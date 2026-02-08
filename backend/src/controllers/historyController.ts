/**
 * History Controller
 * 
 * Controller for history and telemetry endpoints
 * 
 * @module controllers/historyController
 */

import { Request, Response } from 'express'
import { HistoryService } from '../services/historyService.js'
import { TelemetryService } from '../services/telemetryService.js'

export class HistoryController {
  /**
   * Get all events (history)
   */
  static async getHistory(req: Request, res: Response) {
    try {
      const history = await HistoryService.getHistory()
      res.json({
        success: true,
        history
      })
    } catch (error: any) {
      console.error('Get history error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get history',
        message: error.message
      })
    }
  }

  /**
   * Get single event details
   */
  static async getEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const event = await HistoryService.getEvent(eventId)
      
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        })
      }

      res.json({
        success: true,
        event
      })
    } catch (error: any) {
      console.error('Get event error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get event',
        message: error.message
      })
    }
  }

  /**
   * Get telemetry for an event
   */
  static async getTelemetry(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const telemetry = await TelemetryService.getEventTelemetry(eventId)
      
      res.json({
        success: true,
        telemetry
      })
    } catch (error: any) {
      console.error('Get telemetry error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get telemetry',
        message: error.message
      })
    }
  }

  /**
   * Refresh telemetry for an event
   */
  static async refreshTelemetry(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const telemetry = await TelemetryService.refreshEventTelemetry(eventId)
      
      res.json({
        success: true,
        telemetry,
        message: 'Telemetry refreshed successfully'
      })
    } catch (error: any) {
      console.error('Refresh telemetry error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to refresh telemetry',
        message: error.message
      })
    }
  }

  /**
   * Get platform-specific telemetry
   */
  static async getPlatformTelemetry(req: Request, res: Response) {
    try {
      const { platform, postId } = req.params
      const { url } = req.query
      
      const telemetry = await TelemetryService.getPlatformTelemetry(
        platform,
        postId,
        url as string | undefined
      )
      
      res.json({
        success: true,
        telemetry
      })
    } catch (error: any) {
      console.error('Get platform telemetry error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get platform telemetry',
        message: error.message
      })
    }
  }

  /**
   * Add event to history
   */
  static async addEvent(req: Request, res: Response) {
    try {
      const historyEntry = req.body
      const added = await HistoryService.addEvent(historyEntry)
      
      if (!added) {
        return res.status(400).json({
          success: false,
          error: 'Failed to add event to history'
        })
      }

      res.json({
        success: true,
        message: 'Event added to history'
      })
    } catch (error: any) {
      console.error('Add event error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to add event',
        message: error.message
      })
    }
  }

  /**
   * Update event in history
   */
  static async updateEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const updates = req.body
      const updated = await HistoryService.updateEvent(eventId, updates)
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        })
      }

      res.json({
        success: true,
        message: 'Event updated successfully'
      })
    } catch (error: any) {
      console.error('Update event error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update event',
        message: error.message
      })
    }
  }

  /**
   * Get analytics
   */
  static async getAnalytics(req: Request, res: Response) {
    try {
      const analytics = await HistoryService.getAnalytics()
      res.json({
        success: true,
        analytics
      })
    } catch (error: any) {
      console.error('Get analytics error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get analytics',
        message: error.message
      })
    }
  }

  /**
   * Delete an event
   */
  static async deleteEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const deleted = await HistoryService.deleteEvent(eventId)
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        })
      }

      res.json({
        success: true,
        message: 'Event deleted successfully'
      })
    } catch (error: any) {
      console.error('Delete event error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete event',
        message: error.message
      })
    }
  }
}
