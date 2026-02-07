// Event Creation Service - Handles event creation from parsed data

import { EventService } from './eventService.js'
import { UploadedFile, ParsedEventData } from '../types/index.js'

export class EventCreationService {

  // Create event from parsed data and files
  static async createEventFromParsedData(
    parsedData: ParsedEventData,
    uploadedFiles: UploadedFile[]
  ): Promise<any> {
    // ✅ Generate stable Event ID (UUID)
    const eventId = EventService.generateEventId()
    
    // ✅ Titel aus parsedData (als Vorschlag)
    const eventTitle = parsedData.title || 'Unbenanntes Event'
    const now = new Date().toISOString()

    // Create event data structure (without parsedData and platformContent)
    // Include hashtags from parsed data if available
    const eventData = {
      id: eventId,
      title: eventTitle,               // ✅ Titel (Single Source of Truth)
      status: 'draft' as const,
      createdAt: now,
      updatedAt: now,
      uploadedFileRefs: uploadedFiles,
      selectedHashtags: parsedData.hashtags && Array.isArray(parsedData.hashtags) ? parsedData.hashtags : [],
      selectedPlatforms: []
    }

    // Save event metadata
    await EventService.saveEventData(eventId, eventData)

    // Save parsed data separately
    await EventService.saveParsedData(eventId, parsedData)

    // Set as current event
    await EventService.setCurrentEventId(eventId)

    return eventData
  }
}
