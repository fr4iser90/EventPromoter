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

    // Transform platformContent for N8N
    if (n8nPayload.platformContent) {
      // Move email recipients to root level if present
      if (n8nPayload.platformContent.email && n8nPayload.platformContent.email.recipients) {
        n8nPayload.email = {
          ...n8nPayload.platformContent.email,
          recipients: n8nPayload.platformContent.email.recipients
        }
      }

      // Move reddit content to root level if present
      if (n8nPayload.platformContent.reddit) {
        n8nPayload.reddit = {
          ...n8nPayload.platformContent.reddit,
          text: n8nPayload.platformContent.reddit.body || n8nPayload.platformContent.reddit.text
        }
      }
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
