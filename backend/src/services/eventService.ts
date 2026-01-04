// Event service for managing current event data

import { EventWorkspace, Event, UploadedFile } from '../types/index.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'
import fs from 'fs'
import path from 'path'

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
        selectedEmails: [],        // Event-specific email selections
        platformContent: {},
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
        selectedEmails: [],        // Event-specific email selections
        platformContent: {},
        contentTemplates: []
      }
    }
    return await this.saveEventWorkspace(defaultEventWorkspace)
  }

  static async loadEventFiles(eventId: string, fileIds: string[]): Promise<UploadedFile[]> {
    const eventDir = path.join(process.cwd(), 'events', eventId, 'files')

    if (!fs.existsSync(eventDir)) {
      throw new Error(`Event directory not found: ${eventDir}`)
    }

    const loadedFiles: UploadedFile[] = []

    for (const fileId of fileIds) {
      const filePath = path.join(eventDir, fileId)

      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        const fileName = path.basename(fileId)

        loadedFiles.push({
          id: fileId,
          name: fileName,
          filename: fileName,
          url: `/api/files/${eventId}/${fileId}`,
          path: path.join('events', eventId, 'files', fileName),
          size: stats.size,
          type: this.getMimeType(fileName),
          uploadedAt: stats.mtime.toISOString(),
          isImage: this.getMimeType(fileName).startsWith('image/')
        })
      }
    }

    return loadedFiles
  }

  static async getEventFiles(eventId: string): Promise<UploadedFile[]> {
    const eventDir = path.join(process.cwd(), 'events', eventId, 'files')

    if (!fs.existsSync(eventDir)) {
      return [] // Return empty array if no files directory exists
    }

    const files: UploadedFile[] = []
    const fileNames = fs.readdirSync(eventDir)

    for (const fileName of fileNames) {
      const filePath = path.join(eventDir, fileName)

      if (fs.statSync(filePath).isFile()) {
        const stats = fs.statSync(filePath)
        const fileId = fileName

        files.push({
          id: fileId,
          name: fileName,
          filename: fileName,
          url: `/api/files/${eventId}/${fileId}`,
          path: path.join('events', eventId, 'files', fileName),
          size: stats.size,
          type: this.getMimeType(fileName),
          uploadedAt: stats.mtime.toISOString(),
          isImage: this.getMimeType(fileName).startsWith('image/')
        })
      }
    }

    return files
  }

  static async loadEventData(eventId: string): Promise<any> {
    const eventDir = path.join(process.cwd(), 'events', eventId)

    if (!fs.existsSync(eventDir)) {
      return null
    }

    // Load parsed data
    const parsedDataPath = path.join(eventDir, 'parsed-data.json')
    let parsedData = null
    if (fs.existsSync(parsedDataPath)) {
      try {
        parsedData = JSON.parse(fs.readFileSync(parsedDataPath, 'utf8'))
      } catch (error) {
        console.warn(`Failed to load parsed data for event ${eventId}:`, error)
      }
    }

    // Load platform content
    const platformContentDir = path.join(eventDir, 'platform-content')
    let platformContent: Record<string, any> = {}
    if (fs.existsSync(platformContentDir)) {
      const platformFiles = fs.readdirSync(platformContentDir)
      for (const platformFile of platformFiles) {
        if (platformFile.endsWith('.json')) {
          const platform = platformFile.replace('.json', '')
          try {
            const contentPath = path.join(platformContentDir, platformFile)
            platformContent[platform] = JSON.parse(fs.readFileSync(contentPath, 'utf8'))
          } catch (error) {
            console.warn(`Failed to load platform content for ${platform}:`, error)
          }
        }
      }
    }

    // Load file references
    const filesDir = path.join(eventDir, 'files')
    let uploadedFileRefs: UploadedFile[] = []
    if (fs.existsSync(filesDir)) {
      const fileNames = fs.readdirSync(filesDir)
      uploadedFileRefs = fileNames.map(fileName => {
        const filePath = path.join(filesDir, fileName)
        const stats = fs.statSync(filePath)

        return {
          id: fileName,
          name: fileName,
          filename: fileName,
          url: `/api/files/${eventId}/${fileName}`,
          path: path.join('events', eventId, 'files', fileName),
          size: stats.size,
          type: this.getMimeType(fileName),
          uploadedAt: stats.mtime.toISOString(),
          isImage: this.getMimeType(fileName).startsWith('image/')
        }
      })
    }

    return {
      id: eventId,
      parsedData,
      platformContent,
      uploadedFileRefs,
      loadedAt: new Date().toISOString()
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

  static async getEventPlatformContent(eventId: string): Promise<Record<string, any>> {
    const platformContentDir = path.join(process.cwd(), 'events', eventId, 'platform-content')

    if (!fs.existsSync(platformContentDir)) {
      return {}
    }

    const platformContent: Record<string, any> = {}
    const platformFiles = fs.readdirSync(platformContentDir)

    for (const platformFile of platformFiles) {
      if (platformFile.endsWith('.json')) {
        const platform = platformFile.replace('.json', '')
        const contentPath = path.join(platformContentDir, platformFile)

        try {
          const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'))
          platformContent[platform] = content
        } catch (error) {
          console.warn(`Failed to load platform content for ${platform}:`, error)
        }
      }
    }

    return platformContent
  }

  static async saveEventPlatformContent(eventId: string, platformContent: Record<string, any>): Promise<boolean> {
    const platformContentDir = path.join(process.cwd(), 'events', eventId, 'platform-content')

    try {
      // Ensure directory exists
      if (!fs.existsSync(platformContentDir)) {
        fs.mkdirSync(platformContentDir, { recursive: true })
      }

      // Save each platform's content
      for (const [platform, content] of Object.entries(platformContent)) {
        if (content) {
          const contentPath = path.join(platformContentDir, `${platform}.json`)
          fs.writeFileSync(contentPath, JSON.stringify(content, null, 2))
        }
      }

      return true
    } catch (error) {
      console.error('Error saving event platform content:', error)
      return false
    }
  }
}