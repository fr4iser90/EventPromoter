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

  static async restoreEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      // Load complete event data
      const eventData = await EventService.loadEventData(eventId)

      if (!eventData) {
        return res.status(404).json({ error: 'Event not found' })
      }

      // Load platform content for this event
      const platformContent = await EventService.getEventPlatformContent(eventId) || {}

      // Get all files for this event
      const files = await EventService.getEventFiles(eventId) || []

      // Structure the complete restore data (only event-specific, no global overrides)
      const restoreData = {
        event: {
          id: eventData.id,
          name: eventData.name,
          created: eventData.created
        },
        files: files,
        platforms: eventData.selectedPlatforms || [],
        content: platformContent,
        hashtags: eventData.selectedHashtags || [],
        selectedEmails: eventData.selectedEmails || eventData.emailRecipients || [] // Handle both old and new format
      }

      console.log(`Event ${eventId} restore data prepared:`, {
        files: files.length,
        platforms: restoreData.platforms.length,
        contentKeys: Object.keys(restoreData.content).length
      })

      res.json({
        success: true,
        event: restoreData
      })
    } catch (error) {
      console.error('Error restoring event:', error)
      res.status(500).json({ error: 'Failed to restore event' })
    }
  }

  static async getEventPlatformContent(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const platformContent = await EventService.getEventPlatformContent(eventId)
      res.json({ platformContent })
    } catch (error) {
      console.error('Error getting event platform content:', error)
      res.status(500).json({ error: 'Failed to get platform content' })
    }
  }

  static async saveEventPlatformContent(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const platformContent = req.body

      const success = await EventService.saveEventPlatformContent(eventId, platformContent)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to save platform content' })
      }
    } catch (error) {
      console.error('Error saving event platform content:', error)
      res.status(500).json({ error: 'Failed to save platform content' })
    }
  }
}