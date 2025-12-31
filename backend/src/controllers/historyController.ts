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
      res.json({ projects: [] })
    }
  }

  static async addProject(req: Request, res: Response) {
    try {
      const project = req.body
      const success = await HistoryService.addProject(project)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to add project to history' })
      }
    } catch (error) {
      console.error('Error adding project to history:', error)
      res.status(500).json({ error: 'Failed to add project to history' })
    }
  }

  static async updateProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params
      const updates = req.body
      const success = await HistoryService.updateProject(projectId, updates)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(404).json({ error: 'Project not found' })
      }
    } catch (error) {
      console.error('Error updating project:', error)
      res.status(500).json({ error: 'Failed to update project' })
    }
  }

  static async deleteProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params
      const success = await HistoryService.deleteProject(projectId)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(404).json({ error: 'Project not found' })
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      res.status(500).json({ error: 'Failed to delete project' })
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
