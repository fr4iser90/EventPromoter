// Config controller for handling configuration API requests

import { Request, Response } from 'express'
import { ConfigService } from '../services/configService.js'

export class ConfigController {
  static async getConfig(req: Request, res: Response) {
    try {
      const { name } = req.params
      const config = await ConfigService.getConfig(name)

      if (config) {
        res.json(config)
      } else {
        res.status(404).json({ error: 'Configuration not found' })
      }
    } catch (error) {
      console.error('Error getting config:', error)
      res.status(500).json({ error: 'Failed to load configuration' })
    }
  }

  static async saveConfig(req: Request, res: Response) {
    try {
      const { name } = req.params
      const config = req.body
      const success = await ConfigService.saveConfig(name, config)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to save configuration' })
      }
    } catch (error) {
      console.error('Error saving config:', error)
      res.status(500).json({ error: 'Failed to save configuration' })
    }
  }

  static async getEmailConfig(req: Request, res: Response) {
    try {
      const config = await ConfigService.getEmailConfig()

      if (config) {
        res.json(config)
      } else {
        res.status(404).json({ error: 'Email configuration not found' })
      }
    } catch (error) {
      console.error('Error getting email config:', error)
      res.status(500).json({ error: 'Failed to load email configuration' })
    }
  }

  static async saveEmailConfig(req: Request, res: Response) {
    try {
      const config = req.body
      const success = await ConfigService.saveEmailConfig(config)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to save email configuration' })
      }
    } catch (error) {
      console.error('Error saving email config:', error)
      res.status(500).json({ error: 'Failed to save email configuration' })
    }
  }

  static async getAppConfig(req: Request, res: Response) {
    try {
      const config = await ConfigService.getAppConfig()

      if (config) {
        res.json(config)
      } else {
        res.status(404).json({ error: 'App configuration not found' })
      }
    } catch (error) {
      console.error('Error getting app config:', error)
      res.status(500).json({ error: 'Failed to load app configuration' })
    }
  }

  static async saveAppConfig(req: Request, res: Response) {
    try {
      const config = req.body
      const success = await ConfigService.saveAppConfig(config)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to save app configuration' })
      }
    } catch (error) {
      console.error('Error saving app config:', error)
      res.status(500).json({ error: 'Failed to save app configuration' })
    }
  }

  static async updateAppConfig(req: Request, res: Response) {
    try {
      const updates = req.body
      const success = await ConfigService.updateAppConfig(updates)

      if (success) {
        res.json({ success: true })
      } else {
        res.status(500).json({ error: 'Failed to update app configuration' })
      }
    } catch (error) {
      console.error('Error updating app config:', error)
      res.status(500).json({ error: 'Failed to update app configuration' })
    }
  }
}
