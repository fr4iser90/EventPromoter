// Publishing service with fallback support (n8n, API, Playwright)

import { N8nService } from './n8nService.js'
import { ConfigService } from './configService.js'
import { getPlatformRegistry, initializePlatformRegistry } from './platformRegistry.js'
import { PostResult } from '../types/index.js'

export type PublishingMode = 'n8n' | 'api' | 'playwright' | 'auto'

export interface PublishRequest {
  files: any[]
  platforms: Record<string, boolean>
  content: Record<string, any>
  hashtags: string[]
  eventData?: any
}

export interface PublishResult {
  success: boolean
  results: Record<string, {
    success: boolean
    postId?: string
    url?: string
    error?: string
    method?: 'n8n' | 'api' | 'playwright'
  }>
  message: string
}

export class PublishingService {
  /**
   * Main publish method - routes to appropriate publisher based on config
   */
  static async publish(request: PublishRequest): Promise<PublishResult> {
    const appConfig = await ConfigService.getAppConfig()
    const publishingMode = appConfig?.publishingMode || 'auto'
    const n8nEnabled = appConfig?.n8nEnabled !== false // Default to true if not set
    const n8nUrl = appConfig?.n8nWebhookUrl

    // Determine which publishing method to use
    let mode: 'n8n' | 'api' | 'playwright' = 'api'

    if (publishingMode === 'auto') {
      // Try n8n first if enabled and URL is configured
      if (n8nEnabled && n8nUrl) {
        try {
          return await this.publishViaN8n(request, n8nUrl)
        } catch (error: any) {
          console.warn('N8N publishing failed, falling back to API:', error.message)
          mode = 'api'
        }
      } else {
        mode = 'api'
      }
    } else {
      mode = publishingMode
    }

    // Route to specific publisher
    switch (mode) {
      case 'n8n':
        if (!n8nUrl) {
          throw new Error('N8N webhook URL not configured')
        }
        return await this.publishViaN8n(request, n8nUrl)

      case 'api':
        return await this.publishViaAPI(request)

      case 'playwright':
        return await this.publishViaPlaywright(request)

      default:
        throw new Error(`Unknown publishing mode: ${mode}`)
    }
  }

  /**
   * Publish via N8N webhook (existing implementation)
   */
  private static async publishViaN8n(request: PublishRequest, webhookUrl: string): Promise<PublishResult> {
    const n8nPayload = N8nService.transformPayloadForN8n(
      request.files,
      request.platforms,
      request.content,
      request.hashtags,
      request.eventData
    )

    const n8nResult = await N8nService.submitToN8n(webhookUrl, n8nPayload)

    // Transform N8N response to our format
    const results: Record<string, any> = {}
    const platformList = Object.keys(request.platforms).filter(p => request.platforms[p])

    platformList.forEach(platform => {
      results[platform] = {
        success: n8nResult.success,
        method: 'n8n',
        ...(n8nResult.data?.[platform] || {})
      }
    })

    return {
      success: n8nResult.success,
      results,
      message: 'Successfully published via N8N'
    }
  }

  /**
   * Publish via direct API calls using platform services
   */
  private static async publishViaAPI(request: PublishRequest): Promise<PublishResult> {
    const registry = getPlatformRegistry()
    if (!registry.isInitialized()) {
      await initializePlatformRegistry()
    }

    const platformList = Object.keys(request.platforms).filter(p => request.platforms[p])
    const results: Record<string, any> = {}

    // Publish to each platform using its service
    for (const platformId of platformList) {
      try {
        const platformModule = registry.getPlatform(platformId.toLowerCase())
        if (!platformModule) {
          results[platformId] = {
            success: false,
            error: `Platform ${platformId} not found`,
            method: 'api'
          }
          continue
        }

        const service = platformModule.service
        if (!service || typeof service.post !== 'function') {
          // Try to use platform publisher if available
          const publisher = await this.getPlatformPublisher(platformId, 'api')
          if (publisher) {
            const content = request.content[platformId] || request.content
            const result = await publisher.publish(content, request.files, request.hashtags)
            results[platformId] = {
              ...result,
              method: 'api'
            }
          } else {
            results[platformId] = {
              success: false,
              error: `Platform ${platformId} does not support direct API publishing`,
              method: 'api'
            }
          }
          continue
        }

        // Get platform settings/credentials
        const settings = await ConfigService.getConfig(platformId) || {}
        const platformContent = request.content[platformId] || request.content

        // Use platform service post method
        const postResult: PostResult = await service.post(platformContent, settings)

        results[platformId] = {
          success: postResult.success,
          postId: postResult.postId,
          url: postResult.url,
          error: postResult.error,
          method: 'api'
        }
      } catch (error: any) {
        results[platformId] = {
          success: false,
          error: error.message || 'Unknown error',
          method: 'api'
        }
      }
    }

    const allSuccess = Object.values(results).every(r => r.success)
    return {
      success: allSuccess,
      results,
      message: allSuccess
        ? 'Successfully published via API'
        : 'Some platforms failed to publish via API'
    }
  }

  /**
   * Publish via Playwright (browser automation)
   */
  private static async publishViaPlaywright(request: PublishRequest): Promise<PublishResult> {
    const registry = getPlatformRegistry()
    if (!registry.isInitialized()) {
      await initializePlatformRegistry()
    }

    const platformList = Object.keys(request.platforms).filter(p => request.platforms[p])
    const results: Record<string, any> = {}

    // Publish to each platform using Playwright
    for (const platformId of platformList) {
      try {
        const publisher = await this.getPlatformPublisher(platformId, 'playwright')
        if (!publisher) {
          results[platformId] = {
            success: false,
            error: `Platform ${platformId} does not support Playwright publishing`,
            method: 'playwright'
          }
          continue
        }

        const content = request.content[platformId] || request.content
        const result = await publisher.publish(content, request.files, request.hashtags)
        results[platformId] = {
          ...result,
          method: 'playwright'
        }
      } catch (error: any) {
        results[platformId] = {
          success: false,
          error: error.message || 'Unknown error',
          method: 'playwright'
        }
      }
    }

    const allSuccess = Object.values(results).every(r => r.success)
    return {
      success: allSuccess,
      results,
      message: allSuccess
        ? 'Successfully published via Playwright'
        : 'Some platforms failed to publish via Playwright'
    }
  }

  /**
   * Get platform-specific publisher (API or Playwright)
   */
  private static async getPlatformPublisher(
    platformId: string,
    type: 'api' | 'playwright'
  ): Promise<{ publish: (content: any, files: any[], hashtags: string[]) => Promise<PostResult> } | null> {
    try {
      // Try to load publisher from platform directory
      // Use dynamic import with proper path resolution
      const basePath = process.cwd()
      const publisherPath = `${basePath}/backend/src/platforms/${platformId}/publishers/${type}.ts`
      
      // Try relative import first (works in compiled JS)
      try {
        const publisher = await import(`../platforms/${platformId}/publishers/${type}.js`)
        return publisher.default || publisher[`${platformId.charAt(0).toUpperCase() + platformId.slice(1)}${type.charAt(0).toUpperCase() + type.slice(1)}Publisher`] || null
      } catch (relativeError) {
        // If relative import fails, try absolute path
        const fs = await import('fs')
        if (fs.existsSync(publisherPath)) {
          const publisher = await import(publisherPath)
          return publisher.default || publisher
        }
        return null
      }
    } catch (error) {
      // Publisher not found for this platform
      console.debug(`Publisher ${type} not found for platform ${platformId}:`, error)
      return null
    }
  }

  /**
   * Check if N8N is available and enabled
   */
  static async isN8nAvailable(): Promise<boolean> {
    const appConfig = await ConfigService.getAppConfig()
    return appConfig?.n8nEnabled !== false && !!appConfig?.n8nWebhookUrl
  }

  /**
   * Get available publishing modes for a platform
   */
  static async getAvailableModes(platformId: string): Promise<('n8n' | 'api' | 'playwright')[]> {
    const modes: ('n8n' | 'api' | 'playwright')[] = []

    // Check N8N
    if (await this.isN8nAvailable()) {
      modes.push('n8n')
    }

    // Check API support
    const apiPublisher = await this.getPlatformPublisher(platformId, 'api')
    if (apiPublisher) {
      modes.push('api')
    }

    // Check Playwright support
    const playwrightPublisher = await this.getPlatformPublisher(platformId, 'playwright')
    if (playwrightPublisher) {
      modes.push('playwright')
    }

    return modes
  }
}
