/**
 * Telemetry Service
 * 
 * Service for fetching platform telemetry/statistics
 * 
 * @module services/telemetryService
 */

import { PlatformTelemetry, PlatformMetrics, TelemetryRequest, TelemetryResponse } from '../types/telemetry.js'
import { HistoryService } from './historyService.js'
import { EventService } from './eventService.js'
import { getPlatformRegistry, initializePlatformRegistry } from './platformRegistry.js'
import { ConfigService } from './configService.js'

export class TelemetryService {
  /**
   * Get telemetry for an event
   */
  static async getEventTelemetry(eventId: string): Promise<TelemetryResponse> {
    const historyEntry = await HistoryService.getEvent(eventId)
    if (!historyEntry) {
      throw new Error(`Event ${eventId} not found`)
    }

    // Get publish results from event
    const publishResults = await this.getPublishResults(eventId)
    
    // Fetch telemetry for each platform
    const telemetry: Record<string, PlatformTelemetry> = {}
    
    for (const platform of historyEntry.platforms) {
      const publishResult = publishResults[platform]
      if (publishResult?.postId) {
        try {
          telemetry[platform] = await this.getPlatformTelemetry(platform, publishResult.postId, publishResult.url)
        } catch (error: any) {
          telemetry[platform] = {
            platform,
            postId: publishResult.postId,
            url: publishResult.url,
            metrics: {},
            lastUpdated: new Date().toISOString(),
            available: false,
            error: error.message || 'Failed to fetch telemetry'
          }
        }
      } else {
        // No postId available
        telemetry[platform] = {
          platform,
          metrics: {},
          lastUpdated: new Date().toISOString(),
          available: false,
          error: 'No post ID available'
        }
      }
    }

    return {
      eventId,
      telemetry,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Refresh telemetry for an event
   */
  static async refreshEventTelemetry(eventId: string): Promise<TelemetryResponse> {
    return await this.getEventTelemetry(eventId)
  }

  /**
   * Get telemetry for a specific platform
   */
  static async getPlatformTelemetry(
    platform: string,
    postId: string,
    url?: string
  ): Promise<PlatformTelemetry> {
    const registry = getPlatformRegistry()
    if (!registry.isInitialized()) {
      await initializePlatformRegistry()
    }

    const platformModule = registry.getPlatform(platform.toLowerCase())
    if (!platformModule) {
      throw new Error(`Platform ${platform} not found`)
    }

    // Try to get telemetry from platform-specific service
    try {
      const metrics = await this.fetchPlatformMetrics(platform, postId, url)
      
      return {
        platform,
        postId,
        url,
        metrics,
        lastUpdated: new Date().toISOString(),
        available: true
      }
    } catch (error: any) {
      return {
        platform,
        postId,
        url,
        metrics: {},
        lastUpdated: new Date().toISOString(),
        available: false,
        error: error.message || 'Telemetry not available for this platform'
      }
    }
  }

  /**
   * Fetch platform-specific metrics
   */
  private static async fetchPlatformMetrics(
    platform: string,
    postId: string,
    url?: string
  ): Promise<PlatformMetrics> {
    const config = await ConfigService.getConfig(platform) || {}
    
    switch (platform.toLowerCase()) {
      case 'reddit':
        return await this.fetchRedditMetrics(postId, config)
      
      case 'twitter':
      case 'x':
        return await this.fetchTwitterMetrics(postId, config)
      
      case 'facebook':
        return await this.fetchFacebookMetrics(postId, config)
      
      case 'instagram':
        return await this.fetchInstagramMetrics(postId, config)
      
      case 'linkedin':
        return await this.fetchLinkedInMetrics(postId, config)
      
      case 'email':
        return await this.fetchEmailMetrics(postId, config)
      
      default:
        throw new Error(`Telemetry not implemented for platform: ${platform}`)
    }
  }

  /**
   * Fetch Reddit metrics
   */
  private static async fetchRedditMetrics(postId: string, config: any): Promise<PlatformMetrics> {
    try {
      const accessToken = await this.getRedditAccessToken(config)
      if (!accessToken) {
        throw new Error('Reddit access token not available')
      }

      const response = await fetch(`https://oauth.reddit.com/api/info.json?id=t3_${postId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'EventPromoter/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`)
      }

      const data = await response.json()
      const post = data.data?.children?.[0]?.data

      if (!post) {
        throw new Error('Post not found')
      }

      return {
        views: post.view_count || undefined,
        upvotes: post.ups || 0,
        downvotes: post.downs || 0,
        comments: post.num_comments || 0,
        score: post.score || 0,
        upvoteRatio: post.upvote_ratio || 0
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch Reddit metrics: ${error.message}`)
    }
  }

  /**
   * Fetch Twitter/X metrics
   */
  private static async fetchTwitterMetrics(postId: string, config: any): Promise<PlatformMetrics> {
    try {
      const bearerToken = config.bearerToken || config.accessToken
      if (!bearerToken) {
        throw new Error('Twitter bearer token not available')
      }

      const response = await fetch(`https://api.twitter.com/2/tweets/${postId}?tweet.fields=public_metrics`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`)
      }

      const data = await response.json()
      const metrics = data.data?.public_metrics

      if (!metrics) {
        throw new Error('Metrics not available')
      }

      return {
        tweetViews: metrics.impression_count || 0,
        likes: metrics.like_count || 0,
        retweets: metrics.retweet_count || 0,
        replies: metrics.reply_count || 0,
        quoteTweets: metrics.quote_count || 0
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch Twitter metrics: ${error.message}`)
    }
  }

  /**
   * Fetch Facebook metrics
   */
  private static async fetchFacebookMetrics(postId: string, config: any): Promise<PlatformMetrics> {
    try {
      const accessToken = config.accessToken
      if (!accessToken) {
        throw new Error('Facebook access token not available')
      }

      // Facebook Graph API
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?fields=insights.metric(post_impressions),reactions.summary(total_count),comments.summary(total_count),shares&access_token=${accessToken}`
      )

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`)
      }

      const data = await response.json()
      const insights = data.insights?.data?.[0]?.values?.[0]?.value

      return {
        postViews: insights || 0,
        reactions: data.reactions?.summary?.total_count || 0,
        comments: data.comments?.summary?.total_count || 0,
        shares: data.shares?.count || 0
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch Facebook metrics: ${error.message}`)
    }
  }

  /**
   * Fetch Instagram metrics
   */
  private static async fetchInstagramMetrics(postId: string, config: any): Promise<PlatformMetrics> {
    try {
      const accessToken = config.accessToken
      const instagramAccountId = config.instagramAccountId
      
      if (!accessToken || !instagramAccountId) {
        throw new Error('Instagram credentials not available')
      }

      // Instagram Graph API
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?fields=like_count,comments_count&access_token=${accessToken}`
      )

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        instagramLikes: data.like_count || 0,
        instagramComments: data.comments_count || 0
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch Instagram metrics: ${error.message}`)
    }
  }

  /**
   * Fetch LinkedIn metrics
   */
  private static async fetchLinkedInMetrics(postId: string, config: any): Promise<PlatformMetrics> {
    try {
      const accessToken = config.accessToken
      if (!accessToken) {
        throw new Error('LinkedIn access token not available')
      }

      // LinkedIn API v2
      const response = await fetch(
        `https://api.linkedin.com/v2/socialActions/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        linkedInViews: data.viewCount || 0,
        linkedInReactions: data.reactionCount || 0,
        linkedInComments: data.commentCount || 0,
        linkedInShares: data.shareCount || 0
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch LinkedIn metrics: ${error.message}`)
    }
  }

  /**
   * Fetch Email metrics
   */
  private static async fetchEmailMetrics(messageId: string, config: any): Promise<PlatformMetrics> {
    try {
      // Email metrics depend on the email service provider
      // This is a placeholder - actual implementation depends on provider (SendGrid, Mailgun, etc.)
      // For now, return empty metrics
      
      // TODO: Implement email provider-specific metrics fetching
      // Examples:
      // - SendGrid: https://api.sendgrid.com/v3/stats
      // - Mailgun: https://api.mailgun.net/v3/{domain}/events
      // - AWS SES: AWS SDK
      
      return {
        emailsSent: 0,
        emailsDelivered: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        openRate: 0,
        clickRate: 0,
        bounces: 0,
        unsubscribes: 0
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch Email metrics: ${error.message}`)
    }
  }

  /**
   * Get Reddit access token
   */
  private static async getRedditAccessToken(config: any): Promise<string | null> {
    if (!config.clientId || !config.clientSecret) {
      return null
    }

    try {
      const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
      
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'EventPromoter/1.0'
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.access_token || null
    } catch (error) {
      return null
    }
  }

  /**
   * Get publish results from event (from latest publish session)
   */
  private static async getPublishResults(eventId: string): Promise<Record<string, { postId?: string; url?: string }>> {
    try {
      const { PublishTrackingService } = await import('./publishTrackingService.js')
      const latestSession = PublishTrackingService.getLatestSessionForEvent(eventId)
      
      if (!latestSession) {
        // Try to load from file
        const eventDir = `${process.cwd()}/events/${eventId}`
        const fs = await import('fs')
        
        if (fs.existsSync(eventDir)) {
          const sessionFiles = fs.readdirSync(eventDir)
            .filter(f => f.startsWith('publish-session-') && f.endsWith('.json'))
            .sort()
            .reverse() // Most recent first
          
          if (sessionFiles.length > 0) {
            const latestFile = sessionFiles[0]
            const sessionData = JSON.parse(fs.readFileSync(`${eventDir}/${latestFile}`, 'utf8'))
            
            const publishResults: Record<string, { postId?: string; url?: string }> = {}
            for (const result of sessionData.results || []) {
              if (result.success && result.data) {
                publishResults[result.platform] = {
                  postId: result.data.postId,
                  url: result.data.url
                }
              }
            }
            return publishResults
          }
        }
        
        return {}
      }
      
      // Extract postId and url from latest session
      const publishResults: Record<string, { postId?: string; url?: string }> = {}
      for (const result of latestSession.results) {
        if (result.success && result.data) {
          publishResults[result.platform] = {
            postId: result.data.postId,
            url: result.data.url
          }
        }
      }
      
      return publishResults
    } catch (error) {
      console.warn('Failed to load publish results for event', { eventId, error })
      return {}
    }
  }
}
