// Config controller for handling configuration API requests

import { Request, Response } from 'express'
import { ConfigService } from '../services/configService.js'
import { EventService, EVENT_ID_PATTERNS } from '../services/eventService.js'

const CONFIG_NAME_PATTERN = /^[a-z0-9][a-z0-9-_]{0,63}$/

function isSafeConfigName(name: string): boolean {
  return CONFIG_NAME_PATTERN.test(name)
}

export class ConfigController {
  static async getConfig(req: Request, res: Response) {
    try {
      const { name } = req.params
      if (!isSafeConfigName(name)) {
        return res.status(400).json({ error: 'Invalid configuration name' })
      }
      if (process.env.DEBUG_API_REQUESTS === 'true') {
        console.log('API Request: GET /api/config/:name', { name })
      }
      const config = await ConfigService.getConfig(name)

      if (config) {
        if (process.env.DEBUG_API_REQUESTS === 'true') {
          console.log('Sending config', { name })
        }
        res.json(config)
      } else {
        console.warn('Config not found', { name })
        res.status(404).json({ error: 'Configuration not found' })
      }
    } catch (error) {
      console.error('❌ Error getting config:', error)
      res.status(500).json({ error: 'Failed to load configuration' })
    }
  }

  static async saveConfig(req: Request, res: Response) {
    try {
      const { name } = req.params
      if (!isSafeConfigName(name)) {
        return res.status(400).json({ error: 'Invalid configuration name' })
      }
      const config = req.body
      if (process.env.DEBUG_API_REQUESTS === 'true') {
        console.log('API Request: POST /api/config/:name', { name })
      }
      const success = await ConfigService.saveConfig(name, config)

      if (success) {
        if (process.env.DEBUG_API_REQUESTS === 'true') {
          console.log('Config saved successfully', { name })
        }
        res.json({ success: true })
      } else {
        console.error('Failed to save config', { name })
        res.status(500).json({ error: 'Failed to save configuration' })
      }
    } catch (error) {
      console.error('❌ Error saving config:', error)
      res.status(500).json({ error: 'Failed to save configuration' })
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

  // Get available event ID patterns
  static async getEventIdPatterns(req: Request, res: Response) {
    try {
      if (process.env.DEBUG_API_REQUESTS === 'true') {
        console.log('🌐 API Request: GET /api/config/event-id-patterns')
      }

      const currentPattern = await EventService.getCurrentPattern()
      const patterns = Object.values(EVENT_ID_PATTERNS)

      // Generate descriptions from pattern names
      const descriptions: Record<string, { description: string; category: string }> = {}
      for (const pattern of patterns) {
        descriptions[pattern] = {
          description: pattern.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          category: pattern === 'title-first' || pattern === 'date-first' ? 'Standard' :
                   pattern === 'compact' ? 'Kompakt' : 'Erweitert'
        }
      }

      res.json({
        success: true,
        currentPattern,
        availablePatterns: patterns,
        descriptions
      })
    } catch (error) {
      console.error('❌ Error getting event ID patterns:', error)
      res.status(500).json({ error: 'Failed to get event ID patterns' })
    }
  }

  // Set current event ID pattern
  static async setEventIdPattern(req: Request, res: Response) {
    try {
      const { pattern } = req.body
      if (process.env.DEBUG_API_REQUESTS === 'true') {
        console.log(`💾 API Request: POST /api/config/event-id-pattern`, { pattern })
      }

      await EventService.setCurrentPattern(pattern)

      if (process.env.DEBUG_API_REQUESTS === 'true') {
        console.log('✅ Event ID pattern updated successfully')
      }
      res.json({ success: true, pattern })
    } catch (error: any) {
      console.error('❌ Error setting event ID pattern:', error)
      res.status(400).json({ error: error.message || 'Failed to set event ID pattern' })
    }
  }
}
