// History controller for handling history API requests

import { Request, Response } from 'express'
import { HistoryService } from '../services/historyService.js'

export class HistoryController {
  static async getHistory(req: Request, res: Response) {
    try {
      const history = await HistoryService.getHistory()
      res.json(history)
    } catch (error) {
      console.error('Error getting history:', error)
      res.json({ Events: [] })
    }
  }

  static async addEvent(req: Request, res: Response) {
    try {
      const Event = req.body
      const success = await HistoryService.addEvent(Event)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to add Event to history' })
      }
    } catch (error) {
      console.error('Error adding Event to history:', error)
      res.status(500).json({ error: 'Failed to add Event to history' })
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const updates = req.body
      const success = await HistoryService.updateEvent(eventId, updates)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(404).json({ error: 'Event not found' })
      }
    } catch (error) {
      console.error('Error updating Event:', error)
      res.status(500).json({ error: 'Failed to update Event' })
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const success = await HistoryService.deleteEvent(eventId)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(404).json({ error: 'Event not found' })
      }
    } catch (error) {
      console.error('Error deleting Event:', error)
      res.status(500).json({ error: 'Failed to delete Event' })
    }
  }

  static async getAnalytics(req: Request, res: Response) {
    try {
      const analytics = await HistoryService.getAnalytics()
      res.json(analytics)
    } catch (error) {
      console.error('Error getting analytics:', error)
      res.status(500).json({ error: 'Failed to get analytics' })
    }
  }
}
