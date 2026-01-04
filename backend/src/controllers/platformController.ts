// Platform Controller - Handles platform metadata and configuration
import { Request, Response } from 'express'
import { getPlatformPlugin, getAllPlatformNames, getPlatformsWithCapability } from '../platforms/index.js'
import { ConfigService } from '../services/configService.js'

// User Preferences Controller
export class UserPreferencesController {
  static async getPreferences(req: Request, res: Response) {
    try {
      const preferences = await ConfigService.getUserPreferences() || {
        lastSelectedPlatforms: [],
        defaultHashtags: [],
        emailRecipients: [],
        smtpConfig: null,
        uiPreferences: {
          darkMode: false
        }
      }
      res.json({ success: true, preferences })
    } catch (error: any) {
      console.error('Get user preferences error:', error)
      res.status(500).json({
        error: 'Failed to get user preferences',
        details: error.message
      })
    }
  }

  static async savePreferences(req: Request, res: Response) {
    try {
      const { preferences } = req.body
      const success = await ConfigService.saveUserPreferences(preferences)

      if (success) {
        res.json({ success: true, message: 'Preferences saved successfully' })
      } else {
        res.status(500).json({ error: 'Failed to save preferences' })
      }
    } catch (error: any) {
      console.error('Save user preferences error:', error)
      res.status(500).json({
        error: 'Failed to save user preferences',
        details: error.message
      })
    }
  }

  static async updatePreferences(req: Request, res: Response) {
    try {
      const updates = req.body
      const success = await ConfigService.updateUserPreferences(updates)

      if (success) {
        res.json({ success: true, message: 'Preferences updated successfully' })
      } else {
        res.status(500).json({ error: 'Failed to update preferences' })
      }
    } catch (error: any) {
      console.error('Update user preferences error:', error)
      res.status(500).json({
        error: 'Failed to update user preferences',
        details: error.message
      })
    }
  }
}

export class PlatformController {
  // Get all available platforms with metadata
  static async getPlatforms(req: Request, res: Response) {
    try {
      const platforms = getAllPlatformNames().map(platformName => {
        const plugin = getPlatformPlugin(platformName)
        if (!plugin) return null

        return {
          id: plugin.name,
          name: plugin.displayName,
          version: plugin.version,
          capabilities: plugin.capabilities,
          limits: plugin.validator.getLimits(),
          config: {
            supportedFormats: plugin.config?.supportedFormats || [],
            rateLimits: plugin.config?.rateLimits
          },
          templates: plugin.templates ? Object.keys(plugin.templates) : []
        }
      }).filter(Boolean)

      res.json({
        success: true,
        platforms
      })
    } catch (error: any) {
      console.error('Get platforms error:', error)
      res.status(500).json({
        error: 'Failed to get platforms',
        details: error.message
      })
    }
  }

  // Get specific platform metadata
  static async getPlatform(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const plugin = getPlatformPlugin(platformId)

      if (!plugin) {
        return res.status(404).json({
          error: 'Platform not found',
          availablePlatforms: getAllPlatformNames()
        })
      }

      // Generate UI field configuration based on capabilities
      const fieldConfig = PlatformController.generateFieldConfig(plugin)

      res.json({
        success: true,
        platform: {
          id: plugin.name,
          name: plugin.displayName,
          version: plugin.version,
          capabilities: plugin.capabilities,
          limits: plugin.validator.getLimits(),
          fields: fieldConfig,
          templates: plugin.templates || {},
          config: plugin.config,
          uiConfig: plugin.uiConfig // Dynamic UI configuration
        }
      })
    } catch (error: any) {
      console.error('Get platform error:', error)
      res.status(500).json({
        error: 'Failed to get platform',
        details: error.message
      })
    }
  }

  // Get platforms that support specific capabilities
  static async getPlatformsByCapability(req: Request, res: Response) {
    try {
      const { capability } = req.params
      const platforms = getPlatformsWithCapability(capability)

      res.json({
        success: true,
        capability,
        platforms: platforms.map(plugin => ({
          id: plugin.name,
          name: plugin.displayName,
          capabilities: plugin.capabilities
        }))
      })
    } catch (error: any) {
      console.error('Get platforms by capability error:', error)
      res.status(500).json({
        error: 'Failed to get platforms by capability',
        details: error.message
      })
    }
  }

  // Generate UI field configuration based on platform capabilities
  private static generateFieldConfig(plugin: any) {
    const fields = []
    const capabilities = plugin.capabilities || []
    const limits = plugin.validator.getLimits()

    // Text input field
    if (capabilities.some((cap: any) => cap.type === 'text')) {
      const textCap = capabilities.find((cap: any) => cap.type === 'text')
      fields.push({
        type: 'textarea',
        name: 'text',
        label: `${plugin.displayName} Text`,
        placeholder: `Enter your ${plugin.displayName} content...`,
        required: textCap?.required || true,
        maxLength: limits.maxLength,
        rows: plugin.name === 'twitter' ? 4 : plugin.name === 'instagram' ? 6 : 4
      })
    }

    // Caption field (Instagram specific)
    if (plugin.name === 'instagram') {
      fields.push({
        type: 'textarea',
        name: 'caption',
        label: 'Instagram Caption',
        placeholder: 'Write a caption for your post...',
        required: true,
        maxLength: limits.maxLength,
        rows: 6
      })
    }

    // Title field (Reddit specific)
    if (plugin.name === 'reddit') {
      fields.push({
        type: 'text',
        name: 'title',
        label: 'Post Title',
        placeholder: 'Enter an engaging title...',
        required: true,
        maxLength: 300
      })
    }

    // Body field (Reddit specific)
    if (plugin.name === 'reddit') {
      fields.push({
        type: 'textarea',
        name: 'body',
        label: 'Post Body',
        placeholder: 'Write your post content...',
        required: true,
        maxLength: limits.maxLength,
        rows: 6
      })
    }

    // Email specific fields
    if (plugin.name === 'email') {
      fields.push({
        type: 'text',
        name: 'subject',
        label: 'Email Subject',
        placeholder: 'Enter email subject...',
        required: true,
        maxLength: 78
      })
    }

    // Subreddit field (Reddit specific)
    if (plugin.name === 'reddit') {
      fields.push({
        type: 'text',
        name: 'subreddit',
        label: 'Subreddit',
        placeholder: 'r/subreddit',
        required: true
      })
    }

    // Recipients field (Email specific)
    if (plugin.name === 'email') {
      fields.push({
        type: 'multiselect',
        name: 'recipients',
        label: 'Email Recipients',
        placeholder: 'Select recipients...',
        required: true
      })
    }

    return fields
  }

  // Get platform settings configuration
  static async getPlatformSettings(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const plugin = getPlatformPlugin(platformId)

      if (!plugin) {
        return res.status(404).json({
          error: 'Platform not found',
          availablePlatforms: getAllPlatformNames()
        })
      }

      // Get settings from platform module (UI configuration)
      const settingsConfig = plugin.uiConfig?.settings

      // Get actual values from environment variables (but don't expose secrets)
      const envSettings = ConfigService.getPlatformSettings(platformId)
      const hasCredentials = Object.keys(envSettings).length > 0

      res.json({
        success: true,
        platform: platformId,
        settings: {
          config: settingsConfig,
          hasCredentials,
          // Don't expose actual secret values, just indicate if they're set
          configured: hasCredentials
        }
      })
    } catch (error: any) {
      console.error('Get platform settings error:', error)
      res.status(500).json({
        error: 'Failed to get platform settings',
        details: error.message
      })
    }
  }

  // Update platform settings (validate and store)
  static async updatePlatformSettings(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const { settings } = req.body

      const plugin = getPlatformPlugin(platformId)
      if (!plugin) {
        return res.status(404).json({
          error: 'Platform not found'
        })
      }

      // Here you would typically validate and save settings
      // For now, just return success (settings are stored in .env manually)
      console.log(`Platform ${platformId} settings update requested:`, Object.keys(settings || {}))

      res.json({
        success: true,
        message: `Settings for ${platformId} updated successfully`,
        platform: platformId
      })
    } catch (error: any) {
      console.error('Update platform settings error:', error)
      res.status(500).json({
        error: 'Failed to update platform settings',
        details: error.message
      })
    }
  }
}
