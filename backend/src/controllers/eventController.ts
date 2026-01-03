// Event controller for handling event API requests

import { Request, Response } from 'express'
import { EventService } from '../services/eventService.js'

export class EventController {
  static async getEventWorkspace(req: Request, res: Response) {
    try {
      const eventWorkspace = await EventService.getEventWorkspace()
      res.json(eventWorkspace)
    } catch (error) {
      console.error('Error getting event workspace:', error)
      res.status(500).json({ error: 'Failed to load event workspace' })
    }
  }

  static async saveEventWorkspace(req: Request, res: Response) {
    try {
      const eventWorkspace = req.body
      const success = await EventService.saveEventWorkspace(eventWorkspace)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to save event workspace' })
      }
    } catch (error) {
      console.error('Error saving event workspace:', error)
      res.status(500).json({ error: 'Failed to save event workspace' })
    }
  }

  static async getCurrentEvent(req: Request, res: Response) {
    try {
      const event = await EventService.getCurrentEvent()
      res.json(event)
    } catch (error) {
      console.error('Error getting current event:', error)
      res.status(500).json({ error: 'Failed to load current event' })
    }
  }

  static async updateCurrentEvent(req: Request, res: Response) {
    try {
      const updates = req.body
      const success = await EventService.updateCurrentEvent(updates)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to update event' })
      }
    } catch (error) {
      console.error('Error updating event:', error)
      res.status(500).json({ error: 'Failed to update event' })
    }
  }

  static async resetEventWorkspace(req: Request, res: Response) {
    try {
      const success = await EventService.resetEventWorkspace()

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to reset event workspace' })
      }
    } catch (error) {
      console.error('Error resetting event workspace:', error)
      res.status(500).json({ error: 'Failed to reset event workspace' })
    }
  }

  static async loadEventFiles(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const { fileIds } = req.body

      if (!fileIds || !Array.isArray(fileIds)) {
        return res.status(400).json({ error: 'fileIds array is required' })
      }

      const files = await EventService.loadEventFiles(eventId, fileIds)
      res.json({ success: true, files })
    } catch (error) {
      console.error('Error loading event files:', error)
      res.status(500).json({ error: 'Failed to load event files' })
    }
  }

  static async loadEventData(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      const eventData = await EventService.loadEventData(eventId)

      if (!eventData) {
        return res.status(404).json({ error: 'Event not found' })
      }

      res.json(eventData)
    } catch (error) {
      console.error('Error loading event data:', error)
      res.status(500).json({ error: 'Failed to load event data' })
    }
  }
}