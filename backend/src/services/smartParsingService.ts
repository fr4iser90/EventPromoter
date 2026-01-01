import { createWorker } from 'tesseract.js'
import * as pdfParse from 'pdf-parse'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { UploadedFile } from '../types/index.js'

export interface ParsedEventData {
  title?: string
  date?: string
  time?: string
  venue?: string
  city?: string
  description?: string
  price?: string
  organizer?: string
  website?: string
  rawText: string
  confidence: number
  parsedAt: string
  hash: string // For duplicate detection
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  existingEventId?: string
  existingEvent?: ParsedEventData
  similarity: number
}

export class SmartParsingService {
  private static ocrWorker: Tesseract.Worker | null = null

  // Initialize OCR worker
  static async initOCR(): Promise<void> {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker('deu+eng')
    }
  }

  // Cleanup OCR worker
  static async cleanupOCR(): Promise<void> {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate()
      this.ocrWorker = null
    }
  }

  // Extract text from file (PDF or Image)
  static async extractText(filePath: string, mimeType: string): Promise<{ text: string; confidence: number }> {
    try {
      await this.initOCR()

      if (mimeType === 'application/pdf') {
        // PDF parsing
        const dataBuffer = fs.readFileSync(filePath)
        const data = await pdfParse(dataBuffer)
        return {
          text: data.text,
          confidence: 0.9 // PDFs usually have good text extraction
        }
      } else if (mimeType.startsWith('image/')) {
        // OCR for images
        if (!this.ocrWorker) throw new Error('OCR worker not initialized')

        const { data: { text, confidence } } = await this.ocrWorker.recognize(filePath)
        return {
          text,
          confidence: confidence / 100 // Convert to 0-1 scale
        }
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`)
      }
    } catch (error) {
      console.error('Text extraction error:', error)
      throw new Error(`Failed to extract text: ${error.message}`)
    }
  }

  // Parse structured event data from raw text
  static parseEventData(rawText: string, confidence: number): ParsedEventData {
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    const parsed: ParsedEventData = {
      rawText,
      confidence,
      parsedAt: new Date().toISOString(),
      hash: '' // Will be set after parsing
    }

    // Extract event information using regex patterns
    for (const line of lines) {
      // Title (usually first non-empty line or line with EVENT/TITLE)
      if (!parsed.title && (line.toUpperCase().includes('EVENT') || line.toUpperCase().includes('NACHT') || line.length > 10)) {
        parsed.title = line
      }

      // Date patterns (DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD)
      if (!parsed.date) {
        const dateMatch = line.match(/(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/)
        if (dateMatch) {
          parsed.date = this.normalizeDate(dateMatch[1])
        }
      }

      // Time patterns (HH:MM, HH.MM)
      if (!parsed.time) {
        const timeMatch = line.match(/(\d{1,2}[:.]\d{2})/)
        if (timeMatch) {
          parsed.time = timeMatch[1].replace('.', ':')
        }
      }

      // Venue patterns (usually contains @ or location keywords)
      if (!parsed.venue && (line.includes('@') || line.toLowerCase().includes('club') || line.toLowerCase().includes('bar'))) {
        parsed.venue = line.replace('@', '').trim()
      }

      // City (German cities)
      if (!parsed.city) {
        const germanCities = ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig']
        for (const city of germanCities) {
          if (line.includes(city)) {
            parsed.city = city
            break
          }
        }
      }

      // Website (URL patterns)
      if (!parsed.website) {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/)
        if (urlMatch) {
          parsed.website = urlMatch[1]
        }
      }

      // Price (Euro patterns)
      if (!parsed.price) {
        const priceMatch = line.match(/(\d+[,.\d]*)\s*(?:€|EUR|euro)/i)
        if (priceMatch) {
          parsed.price = priceMatch[1] + '€'
        }
      }
    }

    // Description (remaining text after extracting structured data)
    const structuredLines = [parsed.title, parsed.date, parsed.time, parsed.venue, parsed.city, parsed.website, parsed.price]
      .filter(Boolean)
      .join(' ')

    parsed.description = rawText
      .replace(structuredLines, '')
      .split('\n')
      .filter(line => line.length > 10 && !line.match(/^\d/)) // Filter short lines and numbered lines
      .join(' ')
      .trim()

    // Generate hash from structured data
    parsed.hash = this.generateEventHash(parsed)

    return parsed
  }

  // Generate hash for duplicate detection (Title + Date + Venue)
  private static generateEventHash(parsedData: ParsedEventData): string {
    // Use structured data for consistent hashing
    const title = parsedData.title || ''
    const date = parsedData.date || ''
    const venue = parsedData.venue?.name || parsedData.venue || ''

    const hashInput = `${title}${date}${venue}`.toLowerCase().trim()
    return crypto.createHash('md5').update(hashInput).digest('hex')
  }

  // Helper to extract field from text for hashing
  private static extractField(text: string, field: string): string | null {
    const lines = text.split('\n')

    for (const line of lines) {
      switch (field) {
        case 'title':
          if (line.toUpperCase().includes('EVENT') || line.toUpperCase().includes('NACHT') || line.length > 10) {
            return line
          }
          break
        case 'date':
          const dateMatch = line.match(/(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/)
          if (dateMatch) return dateMatch[1]
          break
        case 'venue':
          if (line.includes('@') || line.toLowerCase().includes('club') || line.toLowerCase().includes('bar')) {
            return line.replace('@', '').trim()
          }
          break
      }
    }
    return null
  }

  // Normalize date to YYYY-MM-DD format
  private static normalizeDate(dateStr: string): string {
    // Handle DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
    const parts = dateStr.split(/[./-]/)
    if (parts.length === 3) {
      let [day, month, year] = parts

      // Convert 2-digit year to 4-digit
      if (year.length === 2) {
        year = year < '50' ? '20' + year : '19' + year
      }

      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    return dateStr
  }

  // Check for duplicates in existing events
  static async checkForDuplicates(eventHash: string, currentEventId?: string): Promise<DuplicateCheckResult> {
    const eventsDir = path.join(process.cwd(), 'events')

    if (!fs.existsSync(eventsDir)) {
      return { isDuplicate: false, similarity: 0 }
    }

    const eventFolders = fs.readdirSync(eventsDir).filter(folder =>
      folder.startsWith('event-') && (!currentEventId || folder !== currentEventId)
    )

    for (const eventFolder of eventFolders) {
      const parsedDataPath = path.join(eventsDir, eventFolder, 'parsed-data.json')

      if (fs.existsSync(parsedDataPath)) {
        try {
          const existingData: ParsedEventData = JSON.parse(fs.readFileSync(parsedDataPath, 'utf8'))

          if (existingData.hash === eventHash) {
            return {
              isDuplicate: true,
              existingEventId: eventFolder,
              existingEvent: existingData,
              similarity: 1.0
            }
          }
        } catch (error) {
          console.warn(`Failed to read parsed data for ${eventFolder}:`, error)
        }
      }
    }

    return { isDuplicate: false, similarity: 0 }
  }

  // Save parsed data to event folder
  static async saveParsedData(eventId: string, parsedData: ParsedEventData): Promise<void> {
    const eventDir = path.join(process.cwd(), 'events', eventId)
    const parsedDataPath = path.join(eventDir, 'parsed-data.json')

    // Ensure event directory exists
    if (!fs.existsSync(eventDir)) {
      fs.mkdirSync(eventDir, { recursive: true })
    }

    fs.writeFileSync(parsedDataPath, JSON.stringify(parsedData, null, 2))
    console.log(`Saved parsed data for event ${eventId}`)
  }

  // Parse file from path (for backend parsing)
  static async parseFileFromPath(filePath: string, filename: string, eventId: string): Promise<{
    parsedData: ParsedEventData
    duplicateCheck: DuplicateCheckResult
  }> {
    console.log(`Starting backend parsing for file: ${filename}`)

    try {
      // Extract text from file
      const { text, confidence } = await this.extractText(filePath, this.getMimeType(filename))

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from file')
      }

      // Parse structured data
      const parsedData = this.parseEventData(text, confidence)

      // Check for duplicates
      const duplicateCheck = await this.checkForDuplicates(parsedData.hash, eventId)

      // Save parsed data
      await this.saveParsedData(eventId, parsedData)

      console.log(`Successfully parsed file: ${filename}`)
      console.log(`Duplicate check: ${duplicateCheck.isDuplicate ? 'DUPLICATE FOUND' : 'NO DUPLICATE'}`)

      return {
        parsedData,
        duplicateCheck
      }

    } catch (error) {
      console.error(`Failed to parse file ${filename}:`, error)
      throw error
    }
  }

  // Get MIME type from filename
  private static getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase()
    switch (ext) {
      case '.pdf': return 'application/pdf'
      case '.jpg':
      case '.jpeg': return 'image/jpeg'
      case '.png': return 'image/png'
      case '.gif': return 'image/gif'
      case '.webp': return 'image/webp'
      default: return 'application/octet-stream'
    }
  }

  // Load parsed data from event folder
  static async loadParsedData(eventId: string): Promise<ParsedEventData | null> {
    const parsedDataPath = path.join(process.cwd(), 'events', eventId, 'parsed-data.json')

    if (!fs.existsSync(parsedDataPath)) {
      return null
    }

    try {
      return JSON.parse(fs.readFileSync(parsedDataPath, 'utf8'))
    } catch (error) {
      console.error(`Failed to load parsed data for event ${eventId}:`, error)
      return null
    }
  }

  // Main parsing method
  static async parseFile(file: UploadedFile): Promise<{
    parsedData: ParsedEventData
    duplicateCheck: DuplicateCheckResult
  }> {
    console.log(`Starting smart parsing for file: ${file.name}`)

    try {
      // Extract text
      const { text, confidence } = await this.extractText(file.path, file.type)

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from file')
      }

      // Parse structured data
      const parsedData = this.parseEventData(text, confidence)

      // Check for duplicates
      const duplicateCheck = await this.checkForDuplicates(parsedData.hash, file.id.split('-')[1])

      // Save parsed data
      await this.saveParsedData(file.id.split('-')[1], parsedData)

      console.log(`Successfully parsed file: ${file.name}`)
      console.log(`Duplicate check: ${duplicateCheck.isDuplicate ? 'DUPLICATE FOUND' : 'NO DUPLICATE'}`)

      return {
        parsedData,
        duplicateCheck
      }

    } catch (error) {
      console.error(`Failed to parse file ${file.name}:`, error)
      throw error
    }
  }
}
