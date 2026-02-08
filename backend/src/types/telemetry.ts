/**
 * Telemetry Types
 * 
 * Types for platform telemetry/statistics data
 * 
 * @module types/telemetry
 */

/**
 * Platform Telemetry Data
 */
export interface PlatformTelemetry {
  platform: string
  postId?: string
  url?: string
  metrics: PlatformMetrics
  lastUpdated: string
  available: boolean // Whether telemetry is available for this platform
  error?: string // Error message if fetching failed
}

/**
 * Platform Metrics (union of all possible metrics)
 */
export interface PlatformMetrics {
  // Reddit
  views?: number
  upvotes?: number
  downvotes?: number
  comments?: number
  score?: number
  upvoteRatio?: number
  
  // Twitter/X
  tweetViews?: number
  likes?: number
  retweets?: number
  replies?: number
  quoteTweets?: number
  
  // Facebook
  postViews?: number
  reactions?: number
  shares?: number
  
  // Instagram
  instagramLikes?: number
  instagramComments?: number
  instagramViews?: number // For videos
  
  // LinkedIn
  linkedInViews?: number
  linkedInReactions?: number
  linkedInComments?: number
  linkedInShares?: number
  
  // Email
  emailsSent?: number
  emailsDelivered?: number
  emailsOpened?: number
  emailsClicked?: number
  openRate?: number // Percentage
  clickRate?: number // Percentage
  bounces?: number
  unsubscribes?: number
}

/**
 * Telemetry Request
 */
export interface TelemetryRequest {
  eventId: string
  platform?: string // Optional: specific platform, otherwise all platforms
}

/**
 * Telemetry Response
 */
export interface TelemetryResponse {
  eventId: string
  telemetry: Record<string, PlatformTelemetry> // Key: platform ID
  lastUpdated: string
}
