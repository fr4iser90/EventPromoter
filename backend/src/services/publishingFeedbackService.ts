// Publishing Feedback Service
// Generates structured feedback for publishing operations
// ✅ GENERIC: No platform-specific logic - delegates to platform services

import { TemplateService } from './templateService.js'
import { PlatformManager } from './platformManager.js'
import { PublishRequest, PublishResult } from './publishingService.js'

export interface PublishingFeedback {
  platform: string
  target: string  // Human-readable target (email, subreddit, etc.)
  templateName: string // Template name (e.g. "event-announcement") or "custom" if no template
  additional: {
    method: 'n8n' | 'api' | 'playwright'
    status: 'success' | 'failed' | 'pending'
    [key: string]: any // Platform-specific additional data
  }
  result?: {
    success: boolean
    postId?: string
    url?: string
    error?: string
  }
}

export class PublishingFeedbackService {
  /**
   * Generate feedback array from publish request and result
   * ✅ GENERIC: Delegates target extraction to platform services
   */
  static async generateFeedback(
    request: PublishRequest,
    result: PublishResult
  ): Promise<PublishingFeedback[]> {
    const feedback: PublishingFeedback[] = []
    const platformList = Object.keys(request.platforms).filter(p => request.platforms[p])

    for (const platformId of platformList) {
      const platformContent = request.content[platformId] || request.content
      const platformResult = result.results[platformId]

      if (!platformResult) {
        // Platform was requested but no result available
        feedback.push({
          platform: platformId,
          target: await this.extractTarget(platformId, platformContent),
          templateName: await this.extractTemplateName(platformId, platformContent),
          additional: {
            method: 'api', // Default to api if unknown
            status: 'failed'
          },
          result: {
            success: false,
            error: 'No result available'
          }
        })
        continue
      }

      const target = await this.extractTarget(platformId, platformContent)
      const templateName = await this.extractTemplateName(platformId, platformContent)
      const additional = this.buildAdditionalInfo(platformResult, platformId)
      const resultInfo = this.buildResultInfo(platformResult)

      feedback.push({
        platform: platformId,
        target,
        templateName,
        additional,
        result: resultInfo
      })
    }

    return feedback
  }

  /**
   * Extract human-readable target from platform content
   * ✅ GENERIC: Delegates to platform service extractTarget method
   */
  private static async extractTarget(platformId: string, content: any): Promise<string> {
    try {
      const platformService = await PlatformManager.getPlatformService(platformId)
      
      if (platformService && typeof platformService.extractTarget === 'function') {
        return platformService.extractTarget(content)
      }
      
      // Fallback: try common fields
      if (content.target) return content.target
      if (content.recipient) return content.recipient
      if (content.destination) return content.destination
      
      return 'Unknown'
    } catch (error) {
      console.warn(`Failed to extract target for platform ${platformId}:`, error)
      return 'Unknown'
    }
  }

  /**
   * Extract template name from content._templateId
   * ✅ GENERIC: Uses TemplateService
   */
  private static async extractTemplateName(platformId: string, content: any): Promise<string> {
    // Check if content has _templateId
    if (content._templateId) {
      try {
        const template = await TemplateService.getTemplate(platformId, content._templateId)
        if (template && template.name) {
          return template.name
        }
        // Template ID exists but template not found - return ID
        return content._templateId
      } catch (error) {
        // Error loading template - return ID
        return content._templateId
      }
    }

    // No template ID - check for template name directly (fallback)
    if (content.templateName) {
      return content.templateName
    }

    // No template used
    return 'custom'
  }

  /**
   * Build additional info object
   * ✅ GENERIC: No platform-specific logic
   */
  private static buildAdditionalInfo(
    platformResult: PublishResult['results'][string],
    platformId: string
  ): PublishingFeedback['additional'] {
    // Default to 'api' if method is not specified
    const method = platformResult.method || 'api'
    const status: 'success' | 'failed' | 'pending' = platformResult.success
      ? 'success'
      : platformResult.error
        ? 'failed'
        : 'pending'

    const additional: PublishingFeedback['additional'] = {
      method: method as 'n8n' | 'api' | 'playwright',
      status
    }

    // Add platform-specific additional data
    if (platformResult.postId) {
      additional.postId = platformResult.postId
    }

    if (platformResult.url) {
      additional.url = platformResult.url
    }

    // For N8N: could add workflow/execution info if available
    if (method === 'n8n') {
      additional.executionMethod = 'n8n'
    }

    // For API: add status code if available
    if (method === 'api') {
      additional.executionMethod = 'direct-api'
    }

    // For Playwright: add browser info if available
    if (method === 'playwright') {
      additional.executionMethod = 'browser-automation'
    }

    return additional
  }

  /**
   * Build result info object
   * ✅ GENERIC: No platform-specific logic
   */
  private static buildResultInfo(
    platformResult: PublishResult['results'][string]
  ): PublishingFeedback['result'] {
    return {
      success: platformResult.success,
      postId: platformResult.postId,
      url: platformResult.url,
      error: platformResult.error
    }
  }
}
