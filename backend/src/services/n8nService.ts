// N8N service for API integration and forwarding
// ✅ GENERIC: No platform-specific knowledge - delegates to platform services

import axios from 'axios'
import { PlatformManager } from './platformManager.js'

export class N8nService {
  static async submitToN8n(webhookUrl: string, payload: any): Promise<any> {
    try {
      console.log('Submitting to N8N:', webhookUrl)

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      })

      console.log('N8N response status:', response.status)
      return {
        success: true,
        status: response.status,
        data: response.data
      }
    } catch (error: any) {
      console.error('N8N submission error:', error)

      if (error.response) {
        // N8N returned an error
        throw {
          type: 'N8N_ERROR',
          status: error.response.status,
          message: error.response.data && error.response.data.message ? error.response.data.message : error.message,
          details: error.response.data
        }
      } else if (error.code === 'ECONNREFUSED') {
        throw {
          type: 'CONNECTION_ERROR',
          message: 'Cannot connect to N8N server'
        }
      } else if (error.code === 'ENOTFOUND') {
        throw {
          type: 'NOT_FOUND_ERROR',
          message: 'N8N server not found'
        }
      } else {
        throw {
          type: 'UNKNOWN_ERROR',
          message: error.message ? error.message : 'Unknown error occurred'
        }
      }
    }
  }

  static async transformPayloadForN8n(
    files: any[],
    platforms: Record<string, boolean>,
    content: any,
    hashtags: string[],
    eventData: any,
    baseUrl?: string,
    options?: { sessionId?: string; publishRunId?: string; callbackUrl?: string }
  ): Promise<any> {
    // Transform platformContent for N8N API format
    const n8nPayload: any = {
      files: files,
      hashtags: hashtags,
      publishTo: Object.keys(platforms).filter(p => platforms[p]),
      platformSettings: {},
      platformContent: content,
      metadata: {
        submittedAt: new Date().toISOString(),
        validationPassed: true,
        eventData: eventData,
        sessionId: options?.sessionId,
        publishRunId: options?.publishRunId,
        callbackUrl: options?.callbackUrl
      }
    }

    if (options?.sessionId) {
      n8nPayload.sessionId = options.sessionId
    }
    if (options?.publishRunId) {
      n8nPayload.publishRunId = options.publishRunId
    }
    if (options?.callbackUrl) {
      n8nPayload.callbackUrl = options.callbackUrl
    }

    // ✅ GENERIC: Transform platformContent for N8N - delegate to platform services
    if (n8nPayload.platformContent) {
      const platformList = Object.keys(n8nPayload.platformContent)
      
      for (const platformId of platformList) {
        const platformContent = n8nPayload.platformContent[platformId]
        
        if (platformContent && typeof platformContent === 'object') {
          try {
            // Get platform service
            const platformService = await PlatformManager.getPlatformService(platformId)
            
            // Check if platform has transformForN8n method
            // If not, use content as-is
            if (platformService && typeof (platformService as any).transformForN8n === 'function') {
              // Platform-specific transformation (now supports async)
              // Pass files array for attachment URL mapping (email platform needs this)
              // Pass baseUrl for file URL transformation (email platform needs this)
              const transformed = await (platformService as any).transformForN8n(platformContent, files, baseUrl)
              n8nPayload[platformId] = transformed
            } else {
              // No platform-specific transformation - use content as-is
              n8nPayload[platformId] = platformContent
            }
          } catch (error: any) {
            throw new Error(`Failed to transform content for platform ${platformId}: ${error.message}`)
          }
        }
      }
    }

    // Transform files to include full URLs for n8n
    if (n8nPayload.files && Array.isArray(n8nPayload.files)) {
      n8nPayload.files = n8nPayload.files.map((file: any) => {
        // If file has relative URL, convert to absolute URL
        if (file.url?.startsWith('/')) {
          if (!baseUrl) {
            throw new Error('BASE_URL required - must come from request')
          }
          // Use URL API for robust URL construction (handles /files/, /api/files/, etc.)
          file.url = new URL(file.url, baseUrl).toString()
        }
        
        // Remove sensitive server path before sending to n8n
        const { path, ...safeFile } = file
        return safeFile
      })
    }

    return n8nPayload
  }
}
