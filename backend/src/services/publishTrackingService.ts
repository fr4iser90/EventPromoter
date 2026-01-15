import fs from 'fs'
import path from 'path'

export interface PublishResult {
  platform: string
  success: boolean
  error?: string
  data?: {
    postId?: string
    url?: string
    sentAt?: string
    status?: string
    submittedAt?: string
    failedAt?: string
    method?: 'n8n' | 'api' | 'playwright' | 'unknown'
    error?: string
    metrics?: Record<string, any>
  }
}

export interface PublishSession {
  id: string
  eventId: string
  timestamp: string
  platforms: string[]
  results: PublishResult[]
  overallSuccess: boolean
  totalDuration: number
}

export class PublishTrackingService {
  private static publishSessions: Map<string, PublishSession> = new Map()

  // Start a new publish session
  static startPublishSession(eventId: string, platforms: string[]): string {
    const sessionId = `publish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const session: PublishSession = {
      id: sessionId,
      eventId,
      timestamp: new Date().toISOString(),
      platforms: [...platforms],
      results: [],
      overallSuccess: false,
      totalDuration: 0
    }

    this.publishSessions.set(sessionId, session)

    // Save to file
    this.saveSessionToFile(session)

    console.log(`Started publish session: ${sessionId} for event: ${eventId}`)
    return sessionId
  }

  // Add result to session
  static addPublishResult(sessionId: string, result: PublishResult): void {
    const session = this.publishSessions.get(sessionId)
    if (!session) {
      console.warn(`Session ${sessionId} not found`)
      return
    }

    session.results.push(result)

    // Check if all platforms are done
    const completedPlatforms = session.results.length
    const totalPlatforms = session.platforms.length

    if (completedPlatforms === totalPlatforms) {
      this.completePublishSession(sessionId)
    } else {
      // Update session file
      this.saveSessionToFile(session)
    }

    console.log(`Added result for ${result.platform} in session ${sessionId}: ${result.success ? 'SUCCESS' : 'FAILED'}`)
  }

  // Complete session and calculate final metrics
  private static completePublishSession(sessionId: string): void {
    const session = this.publishSessions.get(sessionId)
    if (!session) return

    const endTime = new Date().getTime()
    const startTime = new Date(session.timestamp).getTime()
    session.totalDuration = endTime - startTime

    // Check overall success (all platforms successful)
    session.overallSuccess = session.results.every(result => result.success)

    // Save final session
    this.saveSessionToFile(session)

    console.log(`Completed publish session ${sessionId}: ${session.overallSuccess ? 'SUCCESS' : 'PARTIAL'}`)
  }

  // Get session by ID
  static getPublishSession(sessionId: string): PublishSession | null {
    return this.publishSessions.get(sessionId) || null
  }

  // Get all sessions for an event
  static getSessionsForEvent(eventId: string): PublishSession[] {
    return Array.from(this.publishSessions.values())
      .filter(session => session.eventId === eventId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  // Get latest session for event
  static getLatestSessionForEvent(eventId: string): PublishSession | null {
    const sessions = this.getSessionsForEvent(eventId)
    return sessions.length > 0 ? sessions[0] : null
  }

  // Save session to file
  private static saveSessionToFile(session: PublishSession): void {
    try {
      const eventDir = `events/${session.eventId}`
      const sessionFile = `${eventDir}/publish-session-${session.id}.json`

      // Ensure directory exists
      if (!fs.existsSync(eventDir)) {
        fs.mkdirSync(eventDir, { recursive: true })
      }

      fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2))
    } catch (error) {
      console.error(`Failed to save publish session ${session.id}:`, error)
    }
  }

  // Load session from file
  static loadPublishSession(eventId: string, sessionId: string): PublishSession | null {
    try {
      const sessionFile = `events/${eventId}/publish-session-${sessionId}.json`

      if (!fs.existsSync(sessionFile)) {
        return null
      }

      const data = JSON.parse(fs.readFileSync(sessionFile, 'utf8'))
      this.publishSessions.set(sessionId, data)
      return data
    } catch (error) {
      console.error(`Failed to load publish session ${sessionId}:`, error)
      return null
    }
  }

  // Clean up old sessions (keep last 10 per event)
  static cleanupOldSessions(eventId: string): void {
    const sessions = this.getSessionsForEvent(eventId)
    if (sessions.length <= 10) return

    const sessionsToDelete = sessions.slice(10) // Keep first 10 (most recent)

    try {
      for (const session of sessionsToDelete) {
        const sessionFile = `events/${eventId}/publish-session-${session.id}.json`
        if (fs.existsSync(sessionFile)) {
          fs.unlinkSync(sessionFile)
        }
        this.publishSessions.delete(session.id)
      }

      console.log(`Cleaned up ${sessionsToDelete.length} old sessions for event ${eventId}`)
    } catch (error) {
      console.error(`Failed to cleanup old sessions for event ${eventId}:`, error)
    }
  }

  // Get summary statistics
  static getPublishStats(eventId: string): {
    totalSessions: number
    successfulSessions: number
    totalPlatforms: number
    successfulPlatforms: number
    averageDuration: number
  } {
    const sessions = this.getSessionsForEvent(eventId)

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        successfulSessions: 0,
        totalPlatforms: 0,
        successfulPlatforms: 0,
        averageDuration: 0
      }
    }

    const successfulSessions = sessions.filter(s => s.overallSuccess).length
    const totalPlatforms = sessions.reduce((sum, s) => sum + s.platforms.length, 0)
    const successfulPlatforms = sessions.reduce((sum, s) =>
      sum + s.results.filter(r => r.success).length, 0
    )
    const averageDuration = sessions.reduce((sum, s) => sum + s.totalDuration, 0) / sessions.length

    return {
      totalSessions: sessions.length,
      successfulSessions,
      totalPlatforms,
      successfulPlatforms,
      averageDuration
    }
  }
}
