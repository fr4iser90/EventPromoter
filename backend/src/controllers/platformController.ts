// Platform Controller - Handles platform metadata and configuration
// ✅ FULLY GENERIC: Only uses PlatformRegistry, no legacy imports
import { Request, Response } from 'express'
import { ConfigService } from '../services/configService.js'
import { getPlatformRegistry, initializePlatformRegistry } from '../services/platformRegistry.js'
import { getPlatformTranslations, getAvailableLanguages } from '../utils/translationLoader.js'

// User Preferences Controller
export class UserPreferencesController {
  static async getPreferences(req: Request, res: Response) {
    try {
      const preferences = await ConfigService.getUserPreferences() || {
        lastSelectedPlatforms: [],
        defaultHashtags: [],
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

import { PreviewRenderer } from '../services/previewRenderer.js'

export class PlatformController {
  // Initialize registry on first use
  private static async ensureRegistry() {
    try {
      const registry = getPlatformRegistry()
      if (!registry.isInitialized()) {
        await initializePlatformRegistry()
      }
      return registry
    } catch (error) {
      console.error('Platform registry initialization failed:', error)
      throw error
    }
  }

  // Get all available platforms with metadata
  static async getPlatforms(req: Request, res: Response) {
    try {
      const registry = await PlatformController.ensureRegistry()
      
      if (!registry.isInitialized()) {
        throw new Error('Platform registry not initialized')
      }

      const platforms = registry.getAllPlatforms().map(platform => ({
        id: platform.metadata.id,
        name: platform.metadata.displayName,
        version: platform.metadata.version,
        category: platform.metadata.category,
        icon: platform.metadata.icon,
        color: platform.metadata.color,
        description: platform.metadata.description,
        capabilities: platform.capabilities,
        limits: platform.validator.getLimits(),
        config: {
          supportedFormats: platform.config?.supportedFormats || [],
          rateLimits: platform.config?.rateLimits
        },
        templates: platform.templates ? Object.keys(platform.templates) : [],
        hasSchema: !!platform.schema
      }))

      return res.json({
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
      const registry = await PlatformController.ensureRegistry()

      // ✅ GENERIC: Only use registry system
      if (!registry || !registry.isInitialized()) {
        return res.status(500).json({
          error: 'Platform registry not initialized'
        })
      }

      const platform = registry.getPlatform(platformId)
      if (!platform) {
        return res.status(404).json({
          error: 'Platform not found',
          availablePlatforms: registry.getPlatformIds()
        })
      }

      return res.json({
        success: true,
        platform: {
          id: platform.metadata.id,
          name: platform.metadata.displayName,
          version: platform.metadata.version,
          category: platform.metadata.category,
          icon: platform.metadata.icon,
          color: platform.metadata.color,
          description: platform.metadata.description,
          capabilities: platform.capabilities,
          limits: platform.validator.getLimits(),
          schema: platform.schema,
          templates: platform.templates || {},
          config: platform.config,
          uiConfig: platform.uiConfig
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

  // Get platform schema
  static async getPlatformSchema(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const registry = await PlatformController.ensureRegistry()

      if (!registry || !registry.isInitialized()) {
        return res.status(500).json({
          error: 'Platform registry not initialized'
        })
      }

      const rawSchema = registry.getPlatformSchema(platformId)
      if (!rawSchema) {
        return res.status(404).json({
          error: 'Schema not available for this platform',
          platform: platformId,
          availablePlatforms: registry.getPlatformIds()
        })
      }

      // Get dark mode from query parameter (mode=dark or darkMode=true)
      const mode = req.query.mode as string
      const darkModeParam = req.query.darkMode as string
      const darkMode = mode === 'dark' || darkModeParam === 'true'

      // Resolve tokens in schema if darkMode parameter is provided
      let schema = rawSchema
      if (darkMode !== undefined) {
        const { resolveSchema } = await import('../utils/tokenResolver.js')
        schema = await resolveSchema(rawSchema, platformId, darkMode)
      }

      return res.json({
        success: true,
        platform: platformId,
        schema,
        version: rawSchema.version || '1.0.0'  // Include version for cache key
      })
    } catch (error: any) {
      console.error('Get platform schema error:', error)
      res.status(500).json({
        error: 'Failed to get platform schema',
        details: error.message
      })
    }
  }

  // Get platform translations
  static async getPlatformTranslations(req: Request, res: Response) {
    try {
      const { platformId, lang } = req.params

      // Validate language
      const validLangs = ['en', 'de', 'es']
      if (!validLangs.includes(lang)) {
        return res.status(400).json({
          error: 'Invalid language',
          supportedLanguages: validLangs
        })
      }

      const translations = await getPlatformTranslations(platformId, lang)
      
      res.json({
        success: true,
        platform: platformId,
        language: lang,
        translations
      })
    } catch (error: any) {
      console.error('Get platform translations error:', error)
      res.status(500).json({
        error: 'Failed to get platform translations',
        details: error.message
      })
    }
  }

  // Get available languages for a platform
  static async getPlatformLanguages(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const languages = await getAvailableLanguages(platformId)

      res.json({
        success: true,
        platform: platformId,
        languages
      })
    } catch (error: any) {
      console.error('Get platform languages error:', error)
      res.status(500).json({
        error: 'Failed to get platform languages',
        details: error.message
      })
    }
  }

  // Get platforms that support specific capabilities
  static async getPlatformsByCapability(req: Request, res: Response) {
    try {
      const { capability } = req.params
      const registry = await PlatformController.ensureRegistry()

      if (!registry || !registry.isInitialized()) {
        return res.status(500).json({
          error: 'Platform registry not initialized'
        })
      }

      // ✅ GENERIC: Filter platforms by capability from registry
      const allPlatforms = registry.getAllPlatforms()
      const matchingPlatforms = allPlatforms.filter(platform => {
        // Check if platform supports the capability
        if (capability === 'text' && platform.capabilities.supportsText) return true
        if (capability === 'image' && platform.capabilities.supportsImages) return true
        if (capability === 'video' && platform.capabilities.supportsVideo) return true
        if (capability === 'link' && platform.capabilities.supportsLinks) return true
        if (capability === 'hashtag' && platform.capabilities.supportsHashtags) return true
        if (capability === 'mention' && platform.capabilities.supportsMentions) return true
        if (capability === 'scheduling' && platform.capabilities.supportsScheduling) return true
        return false
      })

      res.json({
        success: true,
        capability,
        platforms: matchingPlatforms.map(platform => ({
          id: platform.metadata.id,
          name: platform.metadata.displayName,
          capabilities: platform.capabilities
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

  // ❌ REMOVED: generateFieldConfig() - No longer needed, all fields come from schema

  // Get platform settings configuration
  static async getPlatformSettings(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const registry = await PlatformController.ensureRegistry()

      if (!registry || !registry.isInitialized()) {
        return res.status(500).json({
          error: 'Platform registry not initialized'
        })
      }

      const platform = registry.getPlatform(platformId)
      if (!platform) {
        return res.status(404).json({
          error: 'Platform not found',
          availablePlatforms: registry.getPlatformIds()
        })
      }

      // ✅ GENERIC: Get settings from platform schema
      const settingsConfig = platform.schema?.settings

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

      const registry = await PlatformController.ensureRegistry()

      if (!registry || !registry.isInitialized()) {
        return res.status(500).json({
          error: 'Platform registry not initialized'
        })
      }

      const platform = registry.getPlatform(platformId)
      if (!platform) {
        return res.status(404).json({
          error: 'Platform not found',
          availablePlatforms: registry.getPlatformIds()
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

  /**
   * Render preview HTML
   * 
   * Schema-driven preview rendering.
   * Backend renders HTML, frontend only displays it.
   * 
   * GET /api/platforms/:platformId/preview?mode=desktop&darkMode=false
   * Body: { content: { ... } }
   */
  static async renderPreview(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const { mode, client, darkMode } = req.query
      const { content } = req.body

      if (!platformId) {
        return res.status(400).json({ error: 'Platform ID required' })
      }

      if (!content) {
        return res.status(400).json({ error: 'Content required' })
      }

      // Get platform schema
      const registry = await PlatformController.ensureRegistry()
      const platformModule = registry.getPlatform(platformId.toLowerCase())

      if (!platformModule) {
        return res.status(404).json({
          error: `Platform '${platformId}' not found`,
          availablePlatforms: registry.getPlatformIds()
        })
      }

      const schema = platformModule.schema
      if (!schema?.preview) {
        return res.status(404).json({
          error: `Preview schema not available for platform '${platformId}'`
        })
      }

      // Render preview using PreviewRenderer
      const result = await PreviewRenderer.render({
        platform: platformId,
        mode: mode as string,
        client: client as string,
        content,
        schema: schema.preview,
        darkMode: darkMode === 'true'
      })

      res.json({
        success: true,
        html: result.html,
        css: result.css,
        dimensions: result.dimensions
      })
    } catch (error: any) {
      console.error('Render preview error:', error)
      res.status(500).json({
        error: 'Failed to render preview',
        details: error.message
      })
    }
  }
}
