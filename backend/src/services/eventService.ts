// Event service for managing current event data

import { EventWorkspace, Event } from '../types/index.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'

const EVENT_FILE = 'event.json'

export class EventService {
  static async getEventWorkspace(): Promise<EventWorkspace> {
    const data = await readConfig(EVENT_FILE)
    if (!data) {
      // Return default event workspace
      return {
        currentEvent: {
          id: `event-${Date.now()}`,
          name: 'New Event',
          created: new Date().toISOString(),
          uploadedFileRefs: [], // References to uploaded files
          selectedHashtags: [],
          selectedPlatforms: [],
          platformContent: {},
          emailRecipients: [],
          contentTemplates: []
        }
      }
    }
    return data
  }

  static async saveEventWorkspace(eventWorkspace: EventWorkspace): Promise<boolean> {
    return await writeConfig(EVENT_FILE, eventWorkspace)
  }

  static async getCurrentEvent(): Promise<Event> {
    const eventWorkspace = await this.getEventWorkspace()
    return eventWorkspace.currentEvent
  }

  static async updateCurrentEvent(event: Partial<Event>): Promise<boolean> {
    const eventWorkspace = await this.getEventWorkspace()
    eventWorkspace.currentEvent = { ...eventWorkspace.currentEvent, ...event }
    return await this.saveEventWorkspace(eventWorkspace)
  }

  static async resetEventWorkspace(): Promise<boolean> {
    const defaultEventWorkspace: EventWorkspace = {
      currentEvent: {
        id: `event-${Date.now()}`,
        name: 'New Event',
        created: new Date().toISOString(),
        uploadedFileRefs: [],
        selectedHashtags: [],
        selectedPlatforms: [],
        platformContent: {},
        emailRecipients: [],
        contentTemplates: []
      }
    }
    return await this.saveEventWorkspace(defaultEventWorkspace)
  }
}