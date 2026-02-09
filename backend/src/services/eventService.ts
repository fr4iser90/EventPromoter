// Event service for managing event data per event

import { EventWorkspace, Event, UploadedFile } from '../types/index.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// Current event ID is stored in app.json

// Event ID generation patterns
export const EVENT_ID_PATTERNS = {
  TITLE_FIRST: 'title-first',
  DATE_FIRST: 'date-first',
  GENRE_LOCATION: 'genre-location',
  VENUE_TITLE: 'venue-title',
  COMPACT: 'compact'
}

export const EVENT_PATTERN = 'title-first' // ← DIESE ZEILE ÄNDERN!

export class EventService {
  // ✅ Generate stable Event ID (UUID v4)
  static generateEventId(): string {
    return randomUUID()
  }

  // Get current event ID from app config
  static async getCurrentEventId(): Promise<string | null> {
    const appConfig = await readConfig('app.json')
    return appConfig?.currentEventId || null
  }

  // Set current event ID in app config
  static async setCurrentEventId(eventId: string): Promise<boolean> {
    const appConfig = await readConfig('app.json') || {}
    appConfig.currentEventId = eventId
    appConfig.lastUpdated = new Date().toISOString()
    return await writeConfig('app.json', appConfig)
  }

  // Get current event ID pattern from app config
  static async getCurrentPattern(): Promise<string> {
    const appConfig = await readConfig('app.json')
    return appConfig?.eventIdPattern || EVENT_ID_PATTERNS.TITLE_FIRST
  }

  // Set current event ID pattern in app config
  static async setCurrentPattern(pattern: string): Promise<boolean> {
    if (!Object.values(EVENT_ID_PATTERNS).includes(pattern)) {
      throw new Error(`Invalid pattern: ${pattern}`)
    }

    const appConfig = await readConfig('app.json') || {}
    appConfig.eventIdPattern = pattern
    appConfig.lastUpdated = new Date().toISOString()

    return await writeConfig('app.json', appConfig)
  }

  // Get event data from specific event directory
  static async getEventData(eventId: string): Promise<Event | null> {
    const eventFilePath = path.join(process.cwd(), 'events', eventId, 'event.json')
    try {
      const data = fs.readFileSync(eventFilePath, 'utf8')
      const event = JSON.parse(data) as any
      
      // ✅ Migration: name → title, created → createdAt
      if (event && !event.title && (event as any).name) {
        event.title = (event as any).name
        delete (event as any).name  // Altes Feld entfernen
      }
      if (event && !event.createdAt && (event as any).created) {
        event.createdAt = (event as any).created
        delete (event as any).created  // Altes Feld entfernen
      }
      if (event && !event.updatedAt) {
        event.updatedAt = event.createdAt || new Date().toISOString()
      }
      if (event && !event.status) {
        event.status = 'draft'
      }
      
      return event as Event
    } catch (error) {
      if (process.env.DEBUG_EVENT_ACCESS === 'true') {
        console.warn(`⚠️ Event data not found for ${eventId}`)
      }
      return null
    }
  }

  // ✅ Update event title (Single Source of Truth)
  static async updateEventTitle(eventId: string, newTitle: string): Promise<boolean> {
    const event = await this.getEventData(eventId)
    if (!event) {
      return false
    }
    
    event.title = newTitle
    event.updatedAt = new Date().toISOString()
    
    return await this.saveEventData(eventId, event)
  }

  // Save event data to specific event directory
  static async saveEventData(eventId: string, eventData: Event): Promise<boolean> {
    const eventDir = path.join(process.cwd(), 'events', eventId)
    const eventFilePath = path.join(eventDir, 'event.json')

    if (!fs.existsSync(eventDir)) {
      fs.mkdirSync(eventDir, { recursive: true })
    }

    try {
      fs.writeFileSync(eventFilePath, JSON.stringify(eventData, null, 2), 'utf8')
      return true
    } catch (error) {
      console.error(`Failed to save event data for ${eventId}:`, error)
      return false
    }
  }

  // Get complete event workspace (current event + its data)
  static async getEventWorkspace(): Promise<EventWorkspace> {
    const currentEventId = await this.getCurrentEventId()

    if (!currentEventId) {
      // No current event, return empty workspace (don't create a new event)
      return { currentEvent: null }
    }

    // Load event data from event directory
    const eventData = await this.getEventData(currentEventId)
    if (!eventData) {
      // Event exists but data is missing, create default
      const now = new Date().toISOString()
      const defaultEvent: Event = {
        id: currentEventId,
        title: 'New Event',
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        uploadedFileRefs: [],
        selectedHashtags: [],
        selectedPlatforms: []
      }
      return { currentEvent: defaultEvent }
    }

    // Return only event metadata - parsedData and platformContent are loaded separately
    return { currentEvent: eventData }
  }

  // Save event workspace (save event data and update current session)
  static async saveEventWorkspace(eventWorkspace: EventWorkspace): Promise<boolean> {
    if (!eventWorkspace.currentEvent) {
      throw new Error('No current event to save')
    }

    const eventData = eventWorkspace.currentEvent
    const eventId = eventData.id

    // Save current event ID to global session
    const sessionSaved = await this.setCurrentEventId(eventId)
    if (!sessionSaved) {
      console.error('Failed to save current session')
      return false
    }

    // Save event data to event directory
    return await this.saveEventData(eventId, eventData)
  }


  static async getCurrentEvent(): Promise<Event> {
    const eventWorkspace = await this.getEventWorkspace()
    if (!eventWorkspace.currentEvent) {
      throw new Error('No current event available')
    }
    return eventWorkspace.currentEvent
  }

  // Parsed Data Management
  static async saveParsedData(eventId: string, parsedData: any): Promise<boolean> {
    const eventDir = path.join(process.cwd(), 'events', eventId)
    const parsedDataFilePath = path.join(eventDir, 'parsed-data.json')

    // Ensure event directory exists
    if (!fs.existsSync(eventDir)) {
      fs.mkdirSync(eventDir, { recursive: true })
    }

    try {
      fs.writeFileSync(parsedDataFilePath, JSON.stringify(parsedData, null, 2), 'utf8')
      return true
    } catch (error) {
      console.error(`Failed to save parsed data for ${eventId}:`, error)
      return false
    }
  }

  static async getParsedData(eventId: string): Promise<any | null> {
    const parsedDataFilePath = path.join(process.cwd(), 'events', eventId, 'parsed-data.json')
    try {
      const data = fs.readFileSync(parsedDataFilePath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      // Parsed data doesn't exist yet
      return null
    }
  }

  // Platform Content Management
  static async savePlatformContent(eventId: string, platform: string, content: any): Promise<boolean> {
    const platformsDir = path.join(process.cwd(), 'events', eventId, 'platforms')
    const platformFilePath = path.join(platformsDir, `${platform}.json`)

    // Ensure platforms directory exists
    if (!fs.existsSync(platformsDir)) {
      fs.mkdirSync(platformsDir, { recursive: true })
    }

    try {
      fs.writeFileSync(platformFilePath, JSON.stringify(content, null, 2), 'utf8')
      return true
    } catch (error) {
      console.error(`Failed to save platform content for ${eventId}/${platform}:`, error)
      return false
    }
  }

  static async getPlatformContent(eventId: string, platform: string): Promise<any | null> {
    const platformFilePath = path.join(process.cwd(), 'events', eventId, 'platforms', `${platform}.json`)
    
    try {
      const data = fs.readFileSync(platformFilePath, 'utf8')
      const content = JSON.parse(data)
      
      // ✅ Resolve target names for _templates array (if present)
      return await this.resolveTargetNamesInContent(platform, content)
    } catch (error) {
      // Platform content doesn't exist yet
      return null
    }
  }

  static async getAllPlatformContent(eventId: string): Promise<Record<string, any>> {
    const platformsDir = path.join(process.cwd(), 'events', eventId, 'platforms')
    const platformContent: Record<string, any> = {}

    try {
      if (fs.existsSync(platformsDir)) {
        const files = fs.readdirSync(platformsDir)
        for (const file of files) {
          if (file.endsWith('.json')) {
            const platform = file.replace('.json', '')
            const content = await this.getPlatformContent(eventId, platform)
            if (content) {
              platformContent[platform] = content
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to load platform content for ${eventId}:`, error)
    }

    return platformContent
  }



  static async saveEventPlatformContent(eventId: string, platformContent: Record<string, any>): Promise<boolean> {
    let allSuccess = true
    for (const [platform, content] of Object.entries(platformContent)) {
      const success = await this.savePlatformContent(eventId, platform, content)
      if (!success) {
        allSuccess = false
      }
    }
    return allSuccess
  }

  static async updateCurrentEvent(event: Partial<Event>): Promise<boolean> {
    const eventWorkspace = await this.getEventWorkspace()
    if (!eventWorkspace.currentEvent) {
      throw new Error('No current event to update')
    }
    eventWorkspace.currentEvent = { ...eventWorkspace.currentEvent, ...event }
    return await this.saveEventWorkspace(eventWorkspace)
  }

  static async resetEventWorkspace(): Promise<boolean> {
    // Clear current event ID from app config
    const appConfig = await readConfig('app.json') || {}
    delete appConfig.currentEventId
    appConfig.lastUpdated = new Date().toISOString()
    return await writeConfig('app.json', appConfig)
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
          isImage: this.getMimeType(fileName).startsWith('image/'),
          visibility: 'internal'
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
          isImage: this.getMimeType(fileName).startsWith('image/'),
          visibility: 'internal'
        })
      }
    }

    return files
  }

  // Extract title from fileInfos (preferred method)
  static extractTitleFromFileInfos(fileInfos: any[]): string | null {
    try {
      // Find first text file with content
      const txtFile = fileInfos.find(file =>
        file.type === 'text/plain' && file.content
      )

      if (txtFile && txtFile.content) {
        // Look for TITLE: in first few lines
        const lines = txtFile.content.split('\n').slice(0, 5)
        for (const line of lines) {
          const titleMatch = line.match(/^TITLE:\s*(.+)$/i)
          if (titleMatch) {
            return titleMatch[1].trim()
          }
        }
      }
    } catch (error) {
      console.warn('Failed to extract title from fileInfos:', error)
    }
    return null
  }

  // Extract title from TXT files in event directory (legacy)
  static extractTitleFromTxtFiles(eventDir: string): string | null {
    try {
      const filesDir = path.join(eventDir, 'files')
      if (!fs.existsSync(filesDir)) return null

      const files = fs.readdirSync(filesDir)
      const txtFiles = files.filter(file => file.toLowerCase().endsWith('.txt'))

      for (const txtFile of txtFiles) {
        const filePath = path.join(filesDir, txtFile)
        const content = fs.readFileSync(filePath, 'utf8')

        // Look for TITLE: in first few lines
        const lines = content.split('\n').slice(0, 5)
        for (const line of lines) {
          const titleMatch = line.match(/^TITLE:\s*(.+)$/i)
          if (titleMatch) {
            return titleMatch[1].trim()
          }
        }
      }
    } catch (error) {
      console.warn('Failed to extract title from TXT files:', error)
    }

    return null
  }

  // Generate readable event ID from title and date with different patterns
  static generateReadableEventId(title: string, date: Date = new Date(), pattern?: string, parsedData?: any): string {
    const currentPattern = pattern || EVENT_PATTERN
    const timestamp = Date.now()
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD

    // Helper function to create safe title
    const createSafeTitle = (input: string, maxLength: number = 30) => {
      return (input || 'untitled-event')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
        .substring(0, maxLength)
    }

    // Helper function to extract first N words
    const getFirstWords = (input: string, count: number) => {
      return input.split(' ').slice(0, count).join(' ')
    }

    // Helper function to create abbreviation
    const createAbbreviation = (input: string) => {
      return input.split(' ')
        .map(word => word.length > 2 ? word.substring(0, 3) : word)
        .join('')
        .toLowerCase()
        .substring(0, 10)
    }

    // Check if we need timestamp for uniqueness (multiple events same day)
    const needsTimestamp = false // For now, assume date is unique enough

    const addTimestamp = (baseId: string) => {
      return needsTimestamp ? `${baseId}-${timestamp}` : baseId
    }

    switch (currentPattern) {
      case EVENT_ID_PATTERNS.TITLE_FIRST:
        // "depeche-mode-party-2026-01-05"
        const titleWords = getFirstWords(title, 4)
        const safeTitle = createSafeTitle(titleWords, 25)
        return addTimestamp(`${safeTitle}-${dateStr}`)

      case EVENT_ID_PATTERNS.DATE_FIRST:
        // "2026-01-05-depeche-mode-party"
        const shortTitle = createSafeTitle(getFirstWords(title, 3), 20)
        return addTimestamp(`${dateStr}-${shortTitle}`)

      case EVENT_ID_PATTERNS.GENRE_LOCATION:
        // Try to use genre and city from parsed data
        if (parsedData?.genre && parsedData?.city) {
          const genrePart = createSafeTitle(parsedData.genre.split(',')[0], 8) // First genre
          const cityPart = createSafeTitle(parsedData.city, 8)
          return addTimestamp(`${genrePart}-${cityPart}-${dateStr}`)
        }
        // Fallback to abbreviated title
        const abbrTitle = createAbbreviation(title)
        return addTimestamp(`${abbrTitle}-${dateStr}`)

      case EVENT_ID_PATTERNS.VENUE_TITLE:
        // Try to use venue from parsed data
        if (parsedData?.venue) {
          const venuePart = createSafeTitle(parsedData.venue, 8)
          const titleAbbr = createAbbreviation(title)
          return addTimestamp(`${venuePart}-${titleAbbr}-${dateStr}`)
        }
        // Fallback to abbreviated title
        const venueTitle = createSafeTitle(getFirstWords(title, 3), 20)
        return addTimestamp(`${venueTitle}-${dateStr}`)

      case EVENT_ID_PATTERNS.COMPACT:
        // "dmp-2026-01-05" (very abbreviated)
        const compact = createAbbreviation(title)
        return addTimestamp(`${compact}-${dateStr}`)

      default:
        // Fallback to title-first
        const fallbackTitle = createSafeTitle(getFirstWords(title, 4), 25)
        return addTimestamp(`${fallbackTitle}-${dateStr}`)
    }
  }

  // Migrate event folder from temp to final location
  static async migrateEventFolder(oldEventId: string, newEventId: string): Promise<void> {
    const oldEventDir = path.join(process.cwd(), 'events', oldEventId)
    const newEventDir = path.join(process.cwd(), 'events', newEventId)

    if (!fs.existsSync(oldEventDir)) {
      throw new Error(`Source event directory does not exist: ${oldEventDir}`)
    }

    if (fs.existsSync(newEventDir)) {
      throw new Error(`Target event directory already exists: ${newEventDir}`)
    }

    // Create target directory
    fs.mkdirSync(newEventDir, { recursive: true })

    // Move all contents
    const items = fs.readdirSync(oldEventDir)
    for (const item of items) {
      const oldPath = path.join(oldEventDir, item)
      const newPath = path.join(newEventDir, item)
      fs.renameSync(oldPath, newPath)
    }

    // Remove old directory
    fs.rmdirSync(oldEventDir)

    console.log(`Migrated event folder: ${oldEventId} → ${newEventId}`)
  }

  // Create event from uploaded files with extracted title
  static async createEventFromFiles(eventId: string, title: string, files: UploadedFile[]): Promise<any> {
    const now = new Date().toISOString()
    const eventData: Event = {
      id: eventId,
      title: title,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      uploadedFileRefs: files,
      selectedHashtags: [],
      selectedPlatforms: [],
      platformContent: {}
    }

    // Save event data to event directory
    await this.saveEventData(eventId, eventData)

    // Set as current event
    await this.setCurrentEventId(eventId)

    return eventData
  }

  static async loadEventData(eventId: string): Promise<any> {
    // First load event data from event.json
    const eventData = await this.getEventData(eventId)
    if (!eventData) {
      console.warn(`Event data not found for ${eventId}`)
      return null
    }

    console.debug(`Loading event data for ${eventId}:`, {
      hasSelectedPlatforms: !!eventData.selectedPlatforms,
      platformsCount: eventData.selectedPlatforms?.length || 0,
      platforms: eventData.selectedPlatforms || []
    })

    const eventDir = path.join(process.cwd(), 'events', eventId)

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
    const platformContentDir = path.join(eventDir, 'platforms')
    let platformContent: Record<string, any> = {}
    if (fs.existsSync(platformContentDir)) {
      const platformFiles = fs.readdirSync(platformContentDir)
      for (const platformFile of platformFiles) {
        if (platformFile.endsWith('.json')) {
          const platform = platformFile.replace('.json', '')
          try {
            const contentPath = path.join(platformContentDir, platformFile)
            let content = JSON.parse(fs.readFileSync(contentPath, 'utf8'))
            
            // ✅ GENERIC: Process content through platform service if available (for preview/display)
            try {
              const { PlatformManager } = await import('../services/platformManager.js')
              const platformService = await PlatformManager.getPlatformService(platform)
              
              // If platform service has processContentForSave method, use it to build HTML from structured fields
              if (platformService && typeof platformService.processContentForSave === 'function') {
                content = platformService.processContentForSave(content)
              }
            } catch (error: any) {
              // Platform service not available - use content as-is
              console.debug(`No content processing for platform ${platform} on load:`, error?.message || 'Unknown error')
            }
            
            // ✅ Resolve target names for _templates array (if present)
            content = await this.resolveTargetNamesInContent(platform, content)
            
            platformContent[platform] = content
          } catch (error) {
            console.warn(`Failed to load platform content for ${platform}:`, error)
          }
        }
      }
    }

    // Use file references from event data
    const uploadedFileRefs = eventData.uploadedFileRefs || []

    // Use hashtags from eventData if available, otherwise fall back to parsedData
    const selectedHashtags = eventData.selectedHashtags && eventData.selectedHashtags.length > 0
      ? eventData.selectedHashtags
      : (parsedData?.hashtags && Array.isArray(parsedData.hashtags) ? parsedData.hashtags : [])

    return {
      id: eventId,
      title: eventData.title,
      createdAt: eventData.createdAt,
      parsedData,
      platformContent,
      uploadedFileRefs,
      selectedPlatforms: eventData.selectedPlatforms || [],
      selectedHashtags,
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

  /**
   * Resolve target names for _templates array in content
   * Adds groupNames and targetNames to targets objects for display
   */
  private static async resolveTargetNamesInContent(platform: string, content: any): Promise<any> {
    if (!content || !content._templates || !Array.isArray(content._templates)) {
      return content
    }

    try {
      console.debug('[DEBUG] Resolving target names for platform:', platform)
      // Get target service for this platform
      const { TargetController } = await import('../controllers/targetController.js')

      // Get target service instance
      const service = await TargetController.getTargetService(platform)
      if (!service) {
        console.debug('[DEBUG] No target service found for platform:', platform)
        return content // No target service - return content as-is
      }

      // Load targets and groups
      const targets = await service.getTargets()
      const groups = await service.getGroups()
      console.debug('[DEBUG] Loaded targets:', targets.length, 'groups:', Object.keys(groups).length)

      // Create mapping: ID -> display name (use baseField, e.g. email)
      // Handle multi-target support: each target may have different baseField based on targetType
      const targetNameMap: Record<string, string> = {}
      targets.forEach((target: any) => {
        if (!target.targetType) {
          console.error(`Target ${target.id} missing targetType - this should not happen`)
          targetNameMap[target.id] = target.id
          return
        }
        const baseField = service.getBaseField(target.targetType)
        // ✅ Always use baseField (e.g., email) for display, not target.name
        targetNameMap[target.id] = target[baseField] || target.id
      })

      const groupNameMap: Record<string, string> = {}
      Object.values(groups).forEach((group: any) => {
        groupNameMap[group.id] = group.name || group.id
      })

      // Resolve names for each template entry
      const resolvedTemplates = content._templates.map((templateEntry: any) => {
        if (!templateEntry.targets) {
          return templateEntry
        }

        const targetsWithNames = { ...templateEntry.targets }
        
        // Resolve group names
        if (templateEntry.targets.groups && Array.isArray(templateEntry.targets.groups)) {
          targetsWithNames.groupNames = templateEntry.targets.groups.map((id: string) => groupNameMap[id] || id)
        }
        
        // Resolve target names
        if (templateEntry.targets.mode === 'all') {
          // For 'all' mode, include ALL available targets
          // targetType is REQUIRED - no fallbacks
          targetsWithNames.targetNames = targets.map((target: any) => {
            if (!target.targetType) {
              console.error(`Target ${target.id} missing targetType - this should not happen`)
              return target.id
            }
            const baseField = service.getBaseField(target.targetType)
            // ✅ Always use baseField (e.g., email) for display
            return target[baseField] || target.id
          })
        } else if (templateEntry.targets.individual && Array.isArray(templateEntry.targets.individual)) {
          targetsWithNames.targetNames = templateEntry.targets.individual.map((id: string) => targetNameMap[id] || id)
        }

        return {
          ...templateEntry,
          targets: targetsWithNames
        }
      })

      return {
        ...content,
        _templates: resolvedTemplates
      }
    } catch (error) {
      console.warn(`Failed to resolve target names for platform ${platform}:`, error)
      return content // Return content as-is if resolution fails
    }
  }
}