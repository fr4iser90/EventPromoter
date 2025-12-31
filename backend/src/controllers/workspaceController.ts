// Workspace controller for handling workspace API requests

import { Request, Response } from 'express'
import { WorkspaceService } from '../services/workspaceService.js'

export class WorkspaceController {
  static async getWorkspace(req: Request, res: Response) {
    try {
      const workspace = await WorkspaceService.getWorkspace()
      res.json(workspace)
    } catch (error) {
      console.error('Error getting workspace:', error)
      res.status(500).json({ error: 'Failed to load workspace' })
    }
  }

  static async saveWorkspace(req: Request, res: Response) {
    try {
      const workspace = req.body
      const success = await WorkspaceService.saveWorkspace(workspace)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to save workspace' })
      }
    } catch (error) {
      console.error('Error saving workspace:', error)
      res.status(500).json({ error: 'Failed to save workspace' })
    }
  }

  static async getCurrentProject(req: Request, res: Response) {
    try {
      const project = await WorkspaceService.getCurrentProject()
      res.json(project)
    } catch (error) {
      console.error('Error getting current project:', error)
      res.status(500).json({ error: 'Failed to load current project' })
    }
  }

  static async updateCurrentProject(req: Request, res: Response) {
    try {
      const updates = req.body
      const success = await WorkspaceService.updateCurrentProject(updates)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to update project' })
      }
    } catch (error) {
      console.error('Error updating project:', error)
      res.status(500).json({ error: 'Failed to update project' })
    }
  }

  static async resetWorkspace(req: Request, res: Response) {
    try {
      const success = await WorkspaceService.resetWorkspace()

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to reset workspace' })
      }
    } catch (error) {
      console.error('Error resetting workspace:', error)
      res.status(500).json({ error: 'Failed to reset workspace' })
    }
  }
}
