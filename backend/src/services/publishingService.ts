// Publishing service with fallback support (n8n, API, Playwright)

import { N8nService } from './n8nService.js'
import { ConfigService } from './configService.js'
import { getPlatformRegistry, initializePlatformRegistry } from './platformRegistry.js'
import { PostResult } from '../types/index.js'
import { PublishingFeedbackService, PublishingFeedback } from './publishingFeedbackService.js'
import { PublisherEventService, EventAwarePublisher } from './publisherEventService.js'

export type PublishingMode = 'n8n' | 'api' | 'playwright' | 'custom'

export interface PublishRequest {
  files: any[]
  platforms: Record<string, boolean>
  content: Record<string, any>
  hashtags: string[]
  eventData?: any
  globalMode?: PublishingMode
  overrides?: Record<string, 'n8n' | 'api' | 'playwright'>
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
  feedback?: PublishingFeedback[] // Structured feedback for each platform
}

export class PublishingService {
  private static readonly SERVICE_STEP_IDS = {
    API_SUBMIT: 'publish.submit',
    PLAYWRIGHT_SUBMIT: 'publish.submit',
    N8N_EXECUTE: 'n8n.execute_subworkflow'
  } as const
  /**
   * Main publish method - routes to appropriate publisher based on explicit routes from frontend
   * @param request - Publish request with files, platforms, content, and EXPLICIT routes
   * @param baseUrl - Base URL derived from request (for file URL transformation)
   * @param sessionId - Optional session ID for real-time event feedback
   */
  static async publish(request: PublishRequest, baseUrl?: string, sessionId?: string): Promise<PublishResult> {
    const appConfig = await ConfigService.getAppConfig()
    const n8nUrl = appConfig?.n8nWebhookUrl
    const explicitRoutes = request.overrides || {} // In this new model, overrides ARE the selected routes

    // Get event emitter if sessionId provided
    const eventEmitter = sessionId ? PublisherEventService.getInstance(sessionId) : undefined
    
    // Generate correlation ID for this publishing run
    const publishRunId = sessionId ? `${sessionId}-${Date.now()}` : `publish-${Date.now()}`
    
    console.log(`[${publishRunId}] 🚀 Starting publish process (WYSIWYG Mode)`)

    const platformList = Object.keys(request.platforms).filter(p => request.platforms[p])
    const results: Record<string, any> = {}

    // Initialize registry
    if (!getPlatformRegistry().isInitialized()) {
      await initializePlatformRegistry()
    }

    // Process each platform individually based on the route sent by the frontend
    for (const platformId of platformList) {
      // The frontend MUST send the route. If not, we default to 'api' but log a warning.
      const method = explicitRoutes[platformId] || 'api'

      console.log(`[${publishRunId}] Platform ${platformId} will use EXPLICIT method: ${method}`)

      try {
        let platformResult: any

        // Route to specific publisher for this platform
        switch (method) {
          case 'n8n':
            if (!n8nUrl) throw new Error('N8N webhook URL not configured')
            platformResult = await this.publishSingleViaN8n(platformId, request, n8nUrl, baseUrl, sessionId, eventEmitter, publishRunId)
            break
          case 'api':
            platformResult = await this.publishSingleViaAPI(platformId, request, eventEmitter, publishRunId)
            break
          case 'playwright':
            platformResult = await this.publishSingleViaPlaywright(platformId, request, eventEmitter, publishRunId)
            break
          default:
            throw new Error(`Unsupported publishing method: ${method}`)
        }

        results[platformId] = {
          ...platformResult,
          method
        }
      } catch (error: any) {
        results[platformId] = {
          success: false,
          method,
          error: error.message || 'Publishing failed'
        }
      }
    }

    const allSuccess = Object.values(results).every(r => r.success)
    const publishResult = {
      success: allSuccess,
      results,
      message: allSuccess ? 'Successfully published to all platforms' : 'Some platforms failed to publish'
    }

    // Generate feedback
    const feedback = await PublishingFeedbackService.generateFeedback(request, publishResult)

    return {
      ...publishResult,
      feedback
    }
  }

  /**
   * Internal helper to publish to a single platform via N8N
   */
  private static async publishSingleViaN8n(platformId: string, request: PublishRequest, n8nUrl: string, baseUrl?: string, sessionId?: string, eventEmitter?: PublisherEventService, publishRunId?: string): Promise<any> {
    const singlePlatformRequest = { ...request, platforms: { [platformId]: true } }
    const currentRunId = publishRunId || `${platformId}-n8n-${Date.now()}`
    const result = await this.executeWithEvents(
      platformId,
      'n8n',
      this.SERVICE_STEP_IDS.N8N_EXECUTE,
      currentRunId,
      eventEmitter,
      async () => await this.publishViaN8n(singlePlatformRequest, n8nUrl, baseUrl, sessionId, eventEmitter, currentRunId)
    )
    return result.results[platformId]
  }

  /**
   * Internal helper to publish to a single platform via API
   */
  private static async publishSingleViaAPI(platformId: string, request: PublishRequest, eventEmitter?: PublisherEventService, publishRunId?: string): Promise<any> {
    const singlePlatformRequest = { ...request, platforms: { [platformId]: true } }
    const result = await this.publishViaAPI(singlePlatformRequest, eventEmitter, publishRunId)
    return result.results[platformId]
  }

  /**
   * Internal helper to publish to a single platform via Playwright
   */
  private static async publishSingleViaPlaywright(platformId: string, request: PublishRequest, eventEmitter?: PublisherEventService, publishRunId?: string): Promise<any> {
    const singlePlatformRequest = { ...request, platforms: { [platformId]: true } }
    const result = await this.publishViaPlaywright(singlePlatformRequest, eventEmitter, publishRunId)
    return result.results[platformId]
  }

  /**
   * Publish via N8N webhook (existing implementation)
   * @param request - Publish request
   * @param webhookUrl - N8N webhook URL
   * @param baseUrl - Base URL for file URL transformation (from request)
   * @param eventEmitter - Optional event emitter for real-time feedback
   * @param publishRunId - Correlation ID for this publishing run
   */
  private static async publishViaN8n(request: PublishRequest, webhookUrl: string, baseUrl?: string, sessionId?: string, eventEmitter?: PublisherEventService, publishRunId?: string): Promise<PublishResult> {
    const callbackUrl = baseUrl ? new URL('/api/publish/event', baseUrl).toString() : undefined
    const n8nPayload = await N8nService.transformPayloadForN8n(
      request.files,
      request.platforms,
      request.content,
      request.hashtags,
      request.eventData,
      baseUrl,
      {
        sessionId,
        publishRunId,
        callbackUrl
      }
    )

    const n8nResult = await N8nService.submitToN8n(webhookUrl, n8nPayload)

    // Transform N8N response to our format using platform services
    const results: Record<string, any> = {}
    const platformList = Object.keys(request.platforms).filter(p => request.platforms[p])
    const registry = getPlatformRegistry()
    if (!registry.isInitialized()) {
      await initializePlatformRegistry()
    }

    for (const platformId of platformList) {
      try {
        const platformModule = registry.getPlatform(platformId.toLowerCase())
        if (!platformModule || !platformModule.service) {
          throw new Error(`Platform ${platformId} not found or has no service`)
        }

        const service = platformModule.service
        
        // Platform MUST implement extractResponseData - NO FALLBACKS
        if (!service.extractResponseData || typeof service.extractResponseData !== 'function') {
          throw new Error(`Platform ${platformId} must implement extractResponseData method`)
        }

        // Get platform-specific response data from n8n result
        const platformResponse = n8nResult.data?.[platformId] || n8nResult.data || {}
        const extractedData = service.extractResponseData(platformResponse)

        results[platformId] = {
          success: extractedData.success,
          method: 'n8n',
          postId: extractedData.postId,
          url: extractedData.url,
          error: extractedData.error
        }
      } catch (error: any) {
        results[platformId] = {
          success: false,
          method: 'n8n',
          error: error.message || 'Failed to extract response data'
        }
      }
    }

    const publishResult = {
      success: n8nResult.success,
      results,
      message: 'Successfully published via N8N'
    }

    // Generate feedback
    const feedback = await PublishingFeedbackService.generateFeedback(request, publishResult)

    return {
      ...publishResult,
      feedback
    }
  }

  /**
   * Execute a publisher function with automatic event wrapping
   * This provides observability for ALL publishers without requiring them to implement events
   * 
   * @param platformId - Platform identifier
   * @param method - Publishing method (api, playwright, n8n)
   * @param stepName - Human-readable step name
   * @param publishRunId - Correlation ID for this publishing run
   * @param eventEmitter - Optional event emitter
   * @param publisherFn - Publisher function to execute
   * @returns Result from publisher function
   */
  private static async executeWithEvents<T>(
    platformId: string,
    method: 'api' | 'playwright' | 'n8n',
    stepId: string,
    publishRunId: string,
    eventEmitter: PublisherEventService | undefined,
    publisherFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    
    // ✅ LOG: publishRunId für besseres Debugging
    console.log(`[${publishRunId}] Starting ${stepId} for ${platformId} via ${method}`)
    
    // Emit step_started (standardized base event)
    if (eventEmitter) {
      eventEmitter.stepStarted(platformId, method, stepId, `Starting ${stepId}`, publishRunId)
    }
    
    try {
      // Execute publisher function
      const result = await publisherFn()
      const duration = Date.now() - startTime
      
      // ✅ LOG: Success mit publishRunId
      console.log(`[${publishRunId}] ✅ ${stepId} completed for ${platformId} in ${duration}ms`)
      
      // Emit step_completed (standardized base event)
      if (eventEmitter) {
        eventEmitter.stepCompleted(platformId, method, stepId, duration, publishRunId)
      }
      
      return result
    } catch (error: any) {
      const duration = Date.now() - startTime
      
      // Determine error code and retryability
      const errorCode = this.getErrorCode(error)
      const retryable = this.isRetryableError(error)
      
      // ✅ LOG: Error mit publishRunId, errorCode und retryable
      console.error(`[${publishRunId}] ❌ ${stepId} failed for ${platformId}: ${error.message} (${errorCode}, retryable: ${retryable})`)
      
      // Emit step_failed (standardized base event)
      if (eventEmitter) {
        eventEmitter.stepFailed(
          platformId,
          method,
          stepId,
          error.message || 'Unknown error',
          errorCode,
          retryable,
          publishRunId
        )
      }
      
      throw error
    }
  }

  /**
   * Extract standardized error code from error
   */
  private static getErrorCode(error: any): string {
    if (error.code) return error.code
    if (error.status) return `HTTP_${error.status}`
    if (error.type) return error.type
    return 'UNKNOWN_ERROR'
  }

  /**
   * Determine if error is retryable
   */
  private static isRetryableError(error: any): boolean {
    // Network errors are usually retryable
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true
    }
    
    // HTTP 5xx errors are retryable
    if (error.status >= 500 && error.status < 600) {
      return true
    }
    
    // HTTP 429 (Rate Limit) is retryable
    if (error.status === 429) {
      return true
    }
    
    // HTTP 4xx errors (except 429) are usually not retryable
    if (error.status >= 400 && error.status < 500) {
      return false
    }
    
    // Default: not retryable
    return false
  }

  /**
   * Publish via direct API calls using platform services
   * @param request - Publish request
   * @param eventEmitter - Optional event emitter for real-time feedback
   * @param publishRunId - Correlation ID for this publishing run
   */
  private static async publishViaAPI(request: PublishRequest, eventEmitter?: PublisherEventService, publishRunId?: string): Promise<PublishResult> {
    const registry = getPlatformRegistry()
    if (!registry.isInitialized()) {
      await initializePlatformRegistry()
    }

    const platformList = Object.keys(request.platforms).filter(p => request.platforms[p])
    const results: Record<string, any> = {}

    // Publish to each platform using its service
    for (const platformId of platformList) {
      const stepId = this.SERVICE_STEP_IDS.API_SUBMIT
      const currentRunId = publishRunId || `${platformId}-api-${Date.now()}`
      
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
            // Set event emitter if publisher supports it
            if (eventEmitter && 'setEventEmitter' in publisher) {
              (publisher as EventAwarePublisher).setEventEmitter(eventEmitter)
              // ✅ FIX: publishRunId auch für API-Publisher übergeben
              if ('setPublishRunId' in publisher && publishRunId) {
                (publisher as any).setPublishRunId(publishRunId)
              }
            }
            
            const content = request.content[platformId] || request.content
            const result = await this.executeWithEvents(
              platformId,
              'api',
              stepId,
              currentRunId,
              eventEmitter,
              async () => await publisher.publish(content, request.files, request.hashtags, { sessionId: currentRunId })
            )
            
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
        const servicePost = (service as any).post.bind(service)
        const postResult: PostResult = await this.executeWithEvents(
          platformId,
          'api',
          stepId,
          currentRunId,
          eventEmitter,
          async () => await servicePost(platformContent, settings)
        )

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
    const publishResult = {
      success: allSuccess,
      results,
      message: allSuccess
        ? 'Successfully published via API'
        : 'Some platforms failed to publish via API'
    }

    // Generate feedback
    const feedback = await PublishingFeedbackService.generateFeedback(request, publishResult)

    return {
      ...publishResult,
      feedback
    }
  }

  /**
   * Publish via Playwright (browser automation)
   * @param request - Publish request
   * @param eventEmitter - Optional event emitter for real-time feedback
   * @param publishRunId - Correlation ID for this publishing run
   */
  private static async publishViaPlaywright(request: PublishRequest, eventEmitter?: PublisherEventService, publishRunId?: string): Promise<PublishResult> {
    const registry = getPlatformRegistry()
    if (!registry.isInitialized()) {
      await initializePlatformRegistry()
    }

    const platformList = Object.keys(request.platforms).filter(p => request.platforms[p])
    const results: Record<string, any> = {}

    // Publish to each platform using Playwright
    for (const platformId of platformList) {
      const stepId = this.SERVICE_STEP_IDS.PLAYWRIGHT_SUBMIT
      const platformRunId = publishRunId // ✅ FIX: Use base publishRunId for all platforms so SSE stream receives them
      
      try {
        const publisher = await this.getPlatformPublisher(platformId, 'playwright')
        if (!publisher) {
          results[platformId] = {
            success: false,
            error: `Platform ${platformId} does not support Playwright publishing`,
            method: 'playwright'
          }
          if (eventEmitter) {
            eventEmitter.stepFailed(platformId, 'playwright', stepId, `Platform ${platformId} does not support Playwright publishing`, 'PUBLISHER_NOT_AVAILABLE', false, platformRunId)
          }
          continue
        }

        // Set event emitter if publisher supports it (for detailed events like Step 1-6)
        if (eventEmitter && 'setEventEmitter' in publisher) {
          (publisher as EventAwarePublisher).setEventEmitter(eventEmitter)
          // ✅ FIX: publishRunId übergeben, damit Publisher die gleiche ID verwendet
          if ('setPublishRunId' in publisher && platformRunId) {
            (publisher as any).setPublishRunId(platformRunId)
          }
        }

        const content = request.content[platformId] || request.content
        
        // ✅ AUTOMATIC EVENT WRAPPING: Publisher wird automatisch mit Events gewrappt
        // Publisher kann zusätzlich detaillierte Events emitten (z.B. Playwright Steps 1-6)
        const result = await this.executeWithEvents(
          platformId,
          'playwright',
          stepId,
          platformRunId || `${platformId}-${Date.now()}`,
          eventEmitter,
          async () => {
            return await publisher.publish(content, request.files, request.hashtags, { 
              dryMode: true,  // ✅ DRY MODE wieder aktivieren
              sessionId: platformRunId || publishRunId  // ✅ FIX: sessionId übergeben
            })
          }
        )
        
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
        // Error is already handled by executeWithEvents, but we log it here too
        if (eventEmitter) {
          const errorCode = this.getErrorCode(error)
          const retryable = this.isRetryableError(error)
          eventEmitter.stepFailed(platformId, 'playwright', stepId, error.message || 'Unknown error', errorCode, retryable, platformRunId)
        }
      }
    }

    const allSuccess = Object.values(results).every(r => r.success)
    const publishResult = {
      success: allSuccess,
      results,
      message: allSuccess
        ? 'Successfully published via Playwright'
        : 'Some platforms failed to publish via Playwright'
    }

    // Generate feedback
    const feedback = await PublishingFeedbackService.generateFeedback(request, publishResult)

    return {
      ...publishResult,
      feedback
    }
  }

  /**
   * Get platform-specific publisher (API or Playwright)
   */
  private static async getPlatformPublisher(
    platformId: string,
    type: 'api' | 'playwright'
  ): Promise<{ publish: (content: any, files: any[], hashtags: string[], options?: { dryMode?: boolean; sessionId?: string }) => Promise<PostResult> } | null> {
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
