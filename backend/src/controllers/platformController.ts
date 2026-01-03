// Platform Controller - Handles platform metadata and configuration
import { Request, Response } from 'express'
import { getPlatformPlugin, getAllPlatformNames, getPlatformsWithCapability } from '../platforms/index.js'

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
}
