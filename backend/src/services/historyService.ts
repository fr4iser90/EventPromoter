// History service for managing Event history and analytics

import { History, HistoryEntry } from '../types/index.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'

const HISTORY_FILE = 'history.json'

export class HistoryService {
  static async getHistory(): Promise<History> {
    const data = await readConfig(HISTORY_FILE)
    if (!data) {
      return { Events: [] }
    }
    return data
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
