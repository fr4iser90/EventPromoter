// N8N service for API integration and forwarding

import axios from 'axios'

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
          message: error.response.data?.message || error.message,
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
          message: error.message || 'Unknown error occurred'
        }
      }
    }
  }

  static transformPayloadForN8n(
    files: any[],
    platforms: Record<string, boolean>,
    content: any,
    hashtags: string[],
    eventData: any
  ): any {
    // Transform platformContent for N8N API format
    const n8nPayload: any = {
      files: files || [],
      hashtags: hashtags || [],
      publishTo: Object.keys(platforms).filter(p => platforms[p]),
      platformSettings: {},
      platformContent: content || {},
      metadata: {
        submittedAt: new Date().toISOString(),
        validationPassed: true,
        eventData: eventData || {}
      }
    }

    // ✅ GENERIC: Transform platformContent for N8N (all platforms, not hardcoded)
    if (n8nPayload.platformContent) {
      // Move all platform content to root level for N8N compatibility
      Object.entries(n8nPayload.platformContent).forEach(([platformId, content]: [string, any]) => {
        if (content && typeof content === 'object') {
          let text = content.body || content.text || content.html || ''
          
          // Platform-specific formatting
          if (platformId === 'reddit') {
            // Reddit requires Markdown format - ensure text is in Markdown
            // If content contains HTML tags, we should convert to Markdown
            // For now, we assume the content is already in Markdown format (from templates or editor)
            // Just ensure it's a string and not HTML
            if (typeof text === 'string') {
              // Remove any HTML tags that might have been accidentally included
              // This is a safety measure - Reddit expects Markdown, not HTML
              text = text.replace(/<[^>]*>/g, '')
            }
          }
          
          n8nPayload[platformId] = {
            ...content,
            // Normalize text field (some platforms use 'body', others use 'text')
            text: text
          }
        }
      })
    }

    // Transform files to include full URLs for n8n
    if (n8nPayload.files && Array.isArray(n8nPayload.files)) {
      n8nPayload.files = n8nPayload.files.map((file: any) => {
        // If file has URL, ensure it's a full URL
        if (file.url && file.url.startsWith('/api/files/')) {
          // Convert relative URL to absolute URL
          const baseUrl = process.env.BASE_URL || 'http://localhost:4000'
          file.url = `${baseUrl}${file.url}`
        }
        return file
      })
    }

    return n8nPayload
  }
}
