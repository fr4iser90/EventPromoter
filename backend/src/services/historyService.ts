// History service for managing Event history and analytics

import { History, HistoryEntry } from '../types/index.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'
import { EventService } from './eventService.js'
import fs from 'fs'
import path from 'path'

const HISTORY_FILE = 'history.json'

export class HistoryService {
  static async getHistory(): Promise<History> {
    try {
      const events = await this.scanEventsDirectory()
      return { Events: events }
    } catch (error) {
      console.warn('Failed to scan events directory:', error)
      return { Events: [] }
    }
  }

  private static async scanEventsDirectory(): Promise<HistoryEntry[]> {
    const eventsDir = path.join(process.cwd(), 'events')

    if (!fs.existsSync(eventsDir)) {
      return []
    }

    const eventFolders = fs.readdirSync(eventsDir)
      .filter(item => {
        const itemPath = path.join(eventsDir, item)
        return fs.statSync(itemPath).isDirectory() && item !== 'templates'
      })
      .sort((a, b) => {
        // Sort by creation time (newest first)
        const aPath = path.join(eventsDir, a)
        const bPath = path.join(eventsDir, b)
        return fs.statSync(bPath).mtime.getTime() - fs.statSync(aPath).mtime.getTime()
      })

    const events: HistoryEntry[] = []

    for (const eventId of eventFolders) {
      try {
        const eventEntry = await this.createHistoryEntryFromEvent(eventId)
        if (eventEntry) {
          events.push(eventEntry)
        }
      } catch (error) {
        console.warn(`Failed to process event ${eventId}:`, error)
      }
    }

    return events
  }

  private static async createHistoryEntryFromEvent(eventId: string): Promise<HistoryEntry | null> {
    const eventDir = path.join(process.cwd(), 'events', eventId)

    // Load parsed data
    const parsedDataPath = path.join(eventDir, 'parsed-data.json')
    let parsedData: any = {}
    if (fs.existsSync(parsedDataPath)) {
      try {
        parsedData = JSON.parse(fs.readFileSync(parsedDataPath, 'utf8'))
      } catch (error) {
        console.warn(`Failed to parse parsed-data.json for ${eventId}:`, error)
      }
    }

    // Load platform content to determine used platforms
    const platformContentDir = path.join(eventDir, 'platforms')
    let platforms: string[] = []
    if (fs.existsSync(platformContentDir)) {
      platforms = fs.readdirSync(platformContentDir)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''))
    }

    // Get files
    const filesDir = path.join(eventDir, 'files')
    let files: any[] = []
    if (fs.existsSync(filesDir)) {
      const fileNames = fs.readdirSync(filesDir)
      files = fileNames.map(fileName => {
        const filePath = path.join(filesDir, fileName)
        const stats = fs.statSync(filePath)

        return {
          id: fileName,
          name: fileName,
          size: stats.size,
          type: this.getMimeType(fileName),
          uploadedAt: stats.mtime.toISOString()
        }
      })
    }

    // Get event stats
    const eventStats = fs.statSync(eventDir)

    // ✅ event.title ist Single Source of Truth
    const eventData = await EventService.getEventData(eventId)
    const displayTitle = eventData?.title || parsedData.title || `Event ${eventId}`
    
    // Load publish results from latest session
    const publishResults = await this.getPublishResults(eventId)
    
    return {
      id: eventId,
      title: displayTitle,
      status: platforms.length > 0 ? 'published' : 'draft',
      platforms,
      publishedAt: platforms.length > 0 ? eventStats.mtime.toISOString() : undefined,
      eventData: {
        title: parsedData.title,
        date: parsedData.date,
        time: parsedData.time,
        venue: parsedData.venue,
        city: parsedData.city
      },
      files,
      stats: {
        fileCount: files.length,
        platformCount: platforms.length,
        createdAt: eventStats.birthtime.toISOString(),
        modifiedAt: eventStats.mtime.toISOString()
      },
      publishResults // Add publish results (postId, url per platform)
    }
  }

  private static getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop()
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'md': 'text/markdown'
    }
    return mimeTypes[ext || ''] || 'application/octet-stream'
  }

  /**
   * Get publish results from latest session
   */
  private static async getPublishResults(eventId: string): Promise<Record<string, { postId?: string; url?: string; publishedAt?: string }>> {
    try {
      const { PublishTrackingService } = await import('./publishTrackingService.js')
      const latestSession = PublishTrackingService.getLatestSessionForEvent(eventId)
      
      if (!latestSession) {
        // Try to load from file
        const eventDir = path.join(process.cwd(), 'events', eventId)
        if (fs.existsSync(eventDir)) {
          const sessionFiles = fs.readdirSync(eventDir)
            .filter(f => f.startsWith('publish-session-') && f.endsWith('.json'))
            .sort()
            .reverse() // Most recent first
          
          if (sessionFiles.length > 0) {
            const latestFile = sessionFiles[0]
            const sessionData = JSON.parse(fs.readFileSync(path.join(eventDir, latestFile), 'utf8'))
            
            const publishResults: Record<string, { postId?: string; url?: string; publishedAt?: string }> = {}
            for (const result of sessionData.results || []) {
              if (result.success && result.data) {
                publishResults[result.platform] = {
                  postId: result.data.postId,
                  url: result.data.url,
                  publishedAt: result.data.submittedAt || result.data.sentAt
                }
              }
            }
            return publishResults
          }
        }
        
        return {}
      }
      
      // Extract postId and url from latest session
      const publishResults: Record<string, { postId?: string; url?: string; publishedAt?: string }> = {}
      for (const result of latestSession.results) {
        if (result.success && result.data) {
          publishResults[result.platform] = {
            postId: result.data.postId,
            url: result.data.url,
            publishedAt: result.data.submittedAt || result.data.sentAt || latestSession.timestamp
          }
        }
      }
      
      return publishResults
    } catch (error) {
      console.warn(`Failed to load publish results for ${eventId}:`, error)
      return {}
    }
  }

  static async saveHistory(history: History): Promise<boolean> {
    return await writeConfig(HISTORY_FILE, history)
  }

  static async addEvent(Event: HistoryEntry): Promise<boolean> {
    const history = await this.getHistory()
    // Add new Event at the beginning (most recent first)
    history.Events = [Event, ...history.Events]
    return await this.saveHistory(history)
  }

  static async updateEvent(eventId: string, updates: Partial<HistoryEntry>): Promise<boolean> {
    const history = await this.getHistory()
    const EventIndex = history.Events.findIndex(p => p.id === eventId)

    if (EventIndex === -1) {
      return false
    }

    history.Events[EventIndex] = { ...history.Events[EventIndex], ...updates }
    return await this.saveHistory(history)
  }

  static async getEvent(eventId: string): Promise<HistoryEntry | null> {
    const history = await this.getHistory()
    return history.Events.find(p => p.id === eventId) || null
  }

  static async deleteEvent(eventId: string): Promise<boolean> {
    const history = await this.getHistory()
    const filteredEvents = history.Events.filter(p => p.id !== eventId)

    if (filteredEvents.length === history.Events.length) {
      return false // Event not found
    }

    // ✅ Delete event directory (includes event.json, parsed-data.json, files/, platforms/)
    const eventDir = path.join(process.cwd(), 'events', eventId)
    if (fs.existsSync(eventDir)) {
      try {
        fs.rmSync(eventDir, { recursive: true, force: true })
        console.log(`Deleted event directory: ${eventDir}`)
      } catch (error) {
        console.error(`Failed to delete event directory ${eventDir}:`, error)
        // Continue anyway - at least remove from history
      }
    }

    // Remove from history
    return await this.saveHistory({ Events: filteredEvents })
  }

  static async getEventsByStatus(status: 'draft' | 'published' | 'archived'): Promise<HistoryEntry[]> {
    const history = await this.getHistory()
    return history.Events.filter(p => p.status === status)
  }

  static async getAnalytics(): Promise<any> {
    const history = await this.getHistory()

    const analytics = {
      totalEvents: history.Events.length,
      publishedEvents: history.Events.filter(p => p.status === 'published').length,
      draftEvents: history.Events.filter(p => p.status === 'draft').length,
      platformStats: {} as Record<string, any>,
      recentActivity: history.Events.slice(0, 5) // Last 5 Events
    }

    // Calculate platform statistics
    history.Events.forEach(Event => {
      Event.platforms.forEach(platform => {
        if (!analytics.platformStats[platform]) {
          analytics.platformStats[platform] = { count: 0, Events: [] }
        }
        analytics.platformStats[platform].count++
        analytics.platformStats[platform].Events.push(Event.id)
      })
    })

    return analytics
  }
}
