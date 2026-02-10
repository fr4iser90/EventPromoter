// History service for managing Event history and analytics

import { History, HistoryEntry } from '../types/index.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'
import { PathConfig } from '../utils/pathConfig.js'
import { EventService } from './eventService.js'
import { SchemaResolver } from './schemaResolver.js'
import fs from 'fs'
import path from 'path'

const HISTORY_FILE = 'history.json'

export class HistoryService {
  static async getHistory(): Promise<History> {
    try {
      const events = await this.scanEventsDirectory()
      // Return flat structure as discussed
      return { Events: events }
    } catch (error) {
      console.warn('Failed to scan events directory:', error)
      return { Events: [] }
    }
  }

  private static async scanEventsDirectory(): Promise<HistoryEntry[]> {
    const eventsDir = PathConfig.getEventsRoot()
    console.log(`[HistoryService] Scanning directory: ${eventsDir}`)

    if (!fs.existsSync(eventsDir)) {
      console.error(`[HistoryService] Directory NOT FOUND: ${eventsDir}`)
      return []
    }

    const eventFolders = fs.readdirSync(eventsDir)
      .filter(item => {
        const itemPath = path.join(eventsDir, item)
        const isDir = fs.statSync(itemPath).isDirectory()
        const isValid = isDir && item !== 'templates' && item !== 'example' && !item.startsWith('.')
        return isValid
      })
      .sort((a, b) => {
        // Sort by creation time (newest first)
        const aPath = path.join(eventsDir, a)
        const bPath = path.join(eventsDir, b)
        return fs.statSync(bPath).mtime.getTime() - fs.statSync(aPath).mtime.getTime()
      })

    console.log(`[HistoryService] Found ${eventFolders.length} potential event folders:`, eventFolders)

    const events: HistoryEntry[] = []

    for (const eventId of eventFolders) {
      try {
        console.log(`[HistoryService] Processing event folder: ${eventId}`)
        const eventEntry = await this.createHistoryEntryFromEvent(eventId)
        if (eventEntry) {
          console.log(`[HistoryService] Successfully created entry for ${eventId}`)
          events.push(eventEntry)
        } else {
          console.warn(`[HistoryService] Event ${eventId} returned null (missing event.json?)`)
        }
      } catch (error) {
        console.error(`[HistoryService] Error processing event ${eventId}:`, error)
      }
    }

    console.log(`[HistoryService] Final event list count: ${events.length}`)
    return events
  }

  private static async createHistoryEntryFromEvent(eventId: string): Promise<HistoryEntry | null> {
    // 1. Load central event data (Schema-Driven!)
    const eventData = await EventService.getEventData(eventId)
    if (!eventData) {
      console.warn(`[HistoryService] Event data (event.json) missing for ${eventId}`)
      return null
    }

    // 2. Load parsed data for event details (date, venue, etc.)
    const parsedData = await EventService.getParsedData(eventId) || {}

    // 3. Load publish results from latest session
    const publishResults = await this.getPublishResults(eventId)
    
    // Ensure all files have correct URLs before resolver
    const filesWithUrls = (eventData.uploadedFileRefs || []).map(file => ({
      ...file,
      url: `/api/files/${eventId}/${file.filename || file.name}`
    }))

    console.log(`[HistoryService] BEFORE Resolver - Event: ${eventId}, Files:`, 
      filesWithUrls.map(f => ({ name: f.name, url: f.url }))
    )
    
    // 4. Map schema to history entry
    try {
      const entry = SchemaResolver.resolveAndEnrich({
        ...eventData,
        id: eventData.id,
        title: eventData.title,
        status: eventData.status || (eventData.selectedPlatforms?.length > 0 ? 'published' : 'draft'),
        platforms: eventData.selectedPlatforms || [],
        publishedAt: eventData.updatedAt,
        eventData: {
          ...parsedData,
          ...eventData,
          title: eventData.title || parsedData.title
        },
        files: filesWithUrls,
        stats: {
          fileCount: filesWithUrls.length || 0,
          platformCount: eventData.selectedPlatforms?.length || 0,
          createdAt: eventData.createdAt,
          modifiedAt: eventData.updatedAt
        },
        publishResults
      } as any, { id: eventId }) as unknown as HistoryEntry
      
      console.log(`[HistoryService] AFTER Resolver - Event: ${eventId}, Files:`, 
        entry.files?.map(f => ({ name: f.name, url: f.url }))
      )
      
      return entry
    } catch (resolverError) {
      console.error(`[HistoryService] SchemaResolver FAILED for ${eventId}:`, resolverError)
      throw resolverError // No fallback!
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
        const eventDir = PathConfig.getEventDir(eventId)
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
    
    // ✅ FIX: Ensure we have a flat array and no nested objects
    let currentEvents: HistoryEntry[] = []
    if (history && Array.isArray(history.Events)) {
      currentEvents = history.Events.filter(e => e && typeof e === 'object' && !('Events' in e))
    }
    
    // Add new Event at the beginning (most recent first)
    const updatedEvents = [Event, ...currentEvents]
    return await this.saveHistory({ Events: updatedEvents })
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
    const eventDir = PathConfig.getEventDir(eventId)
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
