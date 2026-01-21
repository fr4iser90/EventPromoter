import { createWorker } from 'tesseract.js'
// Dynamic import for CommonJS module in ES module environment
let pdfParse: any = null
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import yaml from 'js-yaml'
import { UploadedFile, ParsedEventData } from '../../types/index.js'

export interface DuplicateCheckResult {
  isDuplicate: boolean
  existingEventId?: string
  existingEvent?: ParsedEventData
  similarity: number
}

export class ContentExtractionService {
  private static ocrWorker: Tesseract.Worker | null = null

  // Parse uploaded files and extract event data
  static async parseUploadedFiles(files: Express.Multer.File[]): Promise<ParsedEventData | null> {
    // Sort files: .txt first, then .md
    const sortedFiles = [...files].sort((a, b) => {
      const aIsTxt = a.mimetype === 'text/plain'
      const bIsTxt = b.mimetype === 'text/plain'
      if (aIsTxt && !bIsTxt) return -1 // .txt comes first
      if (!aIsTxt && bIsTxt) return 1
      return 0 // Keep original order for same type
    })

    let mergedData: ParsedEventData | null = null

    // Parse all text files and merge data
    for (const file of sortedFiles) {
      if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown') {
        try {
          const content = fs.readFileSync(file.path, 'utf8')
          const structuredData = this.parseStructuredData(content)

          if (structuredData && structuredData.title) {
            // Merge with existing data (txt data takes priority, then md fills gaps)
            if (!mergedData) {
              mergedData = structuredData
            } else {
              // Merge: txt data (first) takes priority, md data fills missing fields
              // TypeScript: mergedData is guaranteed to be non-null here
              const existingData: ParsedEventData = mergedData
              mergedData = {
                ...structuredData, // md data (second)
                ...existingData,   // txt data (first) - overwrites md
                // Special handling for arrays - merge them
                lineup: existingData.lineup || structuredData.lineup,
                hashtags: existingData.hashtags && existingData.hashtags.length > 0 
                  ? existingData.hashtags 
                  : (structuredData.hashtags || [])
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to parse ${file.originalname}:`, error)
        }
      }
    }

    return mergedData
  }

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

  // Extract text from file (PDF, Image, TXT, MD)
  static async extractText(filePath: string, mimeType: string): Promise<{ text: string; confidence: number; isStructured?: boolean }> {
    try {
      // Handle structured text files first (TXT, MD)
      if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
        const text = fs.readFileSync(filePath, 'utf8')

        // Check if it's structured data
        const structuredData = this.parseStructuredData(text)
        if (structuredData) {
          return {
            text,
            confidence: 1.0,
            isStructured: true
          }
        }

        // Plain text, treat as unstructured
        return {
          text,
          confidence: 1.0,
          isStructured: false
        }
      }

      // Handle PDF and images with OCR
      await this.initOCR()

      if (mimeType === 'application/pdf') {
        // PDF parsing - dynamic import for CommonJS module
        if (!pdfParse) {
          const pdfModule = await import('pdf-parse')
          pdfParse = pdfModule.default || pdfModule
        }

        const dataBuffer = fs.readFileSync(filePath)
        const data = await pdfParse(dataBuffer)
        return {
          text: data.text,
          confidence: 0.9, // PDFs usually have good text extraction
          isStructured: false
        }
      } else if (mimeType.startsWith('image/')) {
        // OCR for images
        if (!this.ocrWorker) throw new Error('OCR worker not initialized')

        const { data: { text, confidence } } = await this.ocrWorker.recognize(filePath)
        return {
          text,
          confidence: confidence / 100, // Convert to 0-1 scale
          isStructured: false
        }
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`)
      }
    } catch (error) {
      console.error('Text extraction error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to extract text: ${errorMessage}`)
    }
  }

  // Parse structured data from TXT/MD files
  static parseStructuredData(content: string): ParsedEventData | null {
    try {
      // Try YAML Frontmatter (Markdown)
      if (content.trim().startsWith('---')) {
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
        if (frontmatterMatch) {
          const yamlData = yaml.load(frontmatterMatch[1]) as any

          const dateResult = this.normalizeStructuredDate(yamlData.date)

          // Parse hashtags from YAML (supports both string and array formats)
          let hashtags: string[] | undefined = undefined
          if (yamlData.hashtags || yamlData.hashtag) {
            const hashtagValue = yamlData.hashtags || yamlData.hashtag
            if (Array.isArray(hashtagValue)) {
              hashtags = hashtagValue.map(tag => typeof tag === 'string' ? tag : String(tag))
                .map(tag => this.parseHashtags(tag))
                .flat()
            } else if (typeof hashtagValue === 'string') {
              hashtags = this.parseHashtags(hashtagValue)
            }
          }

          return {
            title: yamlData.title,
            date: dateResult?.normalized,
            originalDate: dateResult?.original,
            time: yamlData.time,
            venue: yamlData.venue,
            city: yamlData.city,
            description: yamlData.description,
            price: yamlData.price,
            organizer: yamlData.organizer,
            website: yamlData.website,
            lineup: Array.isArray(yamlData.lineup) ? yamlData.lineup : yamlData.lineup ? [yamlData.lineup] : undefined,
            genre: yamlData.genre,
            hashtags,
            rawText: content,
            confidence: 1.0,
            parsedAt: new Date().toISOString(),
            hash: '' // Will be set after parsing
          }
        }
      }

      // Try Key-Value format (TXT)
      const lines = content.split('\n').map(line => line.trim())
      const parsed: ParsedEventData = {
        title: '', // Will be filled below
        rawText: content,
        confidence: 1.0,
        parsedAt: new Date().toISOString(),
        hash: '',
        hashtags: [] // Initialize as empty array
      }

      let inDescription = false
      let descriptionLines: string[] = []

      for (const line of lines) {
        if (inDescription) {
          // Check if this line starts a new key-value pair (only uppercase letters + colon)
          // This ends the description block
          if (line.includes(':') && /^[A-Z\s]+:\s*/.test(line.trim())) {
            inDescription = false
            // Continue processing this line as a key-value pair below
          } else {
            // Everything else (empty lines, text, text with colons) is part of description
            descriptionLines.push(line)
            continue
          }
        }

        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':')
          const value = valueParts.join(':').trim()
          const trimmedKey = key.trim().toUpperCase()

          switch (trimmedKey) {
            case 'TITLE':
              parsed.title = value
              break
            case 'DATE':
              const dateResult = this.normalizeStructuredDate(value)
              parsed.date = dateResult?.normalized
              parsed.originalDate = dateResult?.original
              break
            case 'TIME':
              parsed.time = value
              break
            case 'VENUE':
              parsed.venue = value
              break
            case 'CITY':
              parsed.city = value
              break
            case 'PRICE':
              parsed.price = value
              break
            case 'ORGANIZER':
              parsed.organizer = value
              break
            case 'WEBSITE':
              parsed.website = value
              break
            case 'LINEUP':
              parsed.lineup = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
              break
            case 'GENRE':
              parsed.genre = value
              break
            case 'HASHTAG':
            case 'HASHTAGS':
              // Parse hashtags: support both with and without #, comma-separated
              parsed.hashtags = this.parseHashtags(value)
              break
            case 'DESCRIPTION':
              inDescription = true
              descriptionLines = []
              break
          }
        }
      }

      if (descriptionLines.length > 0) {
        parsed.description = descriptionLines.join('\n').trim()
      }

      // Only return if we have at least a title
      return parsed.title ? parsed : null

    } catch (error) {
      console.warn('Failed to parse structured data:', error)
      return null
    }
  }

  // Parse structured event data from raw text (OCR fallback)
  static parseEventData(rawText: string, confidence: number): ParsedEventData {
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    const parsed: ParsedEventData = {
      title: '', // Will be filled below
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
          const dateResult = this.normalizeDate(dateMatch[1])
          parsed.date = dateResult.normalized
          parsed.originalDate = dateResult.original
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

  // Generate hash for duplicate detection (Title + Date + Venue + Lineup)
  private static generateEventHash(parsedData: ParsedEventData): string {
    // Use structured data for consistent hashing
    const title = parsedData.title || ''
    const date = parsedData.date || ''
    const venue = parsedData.venue || ''
    const lineup = parsedData.lineup ? parsedData.lineup.join(',') : ''

    const hashInput = `${title}${date}${venue}${lineup}`.toLowerCase().trim()
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

  // Detect locale from text content
  private static detectLocale(text: string): string {
    const lowerText = text.toLowerCase()

    // German indicators
    if (lowerText.includes('januar') || lowerText.includes('februar') || lowerText.includes('märz') ||
        lowerText.includes('mai') || lowerText.includes('juni') || lowerText.includes('juli') ||
        lowerText.includes('oktober') || lowerText.includes('dezember') ||
        /\d{1,2}\.\d{1,2}\.\d{2,4}/.test(text)) {
      return 'de-DE'
    }

    // English indicators
    if (lowerText.includes('january') || lowerText.includes('february') || lowerText.includes('march') ||
        lowerText.includes('october') || lowerText.includes('december') ||
        /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(text)) {
      return 'en-US'
    }

    // Default to German for European context
    return 'de-DE'
  }

  // Normalize date to YYYY-MM-DD format (supports German and ISO formats)
  private static normalizeDate(dateStr: string): { normalized: string, original: string } {
    if (!dateStr) return { normalized: dateStr, original: dateStr }

    // Clean the string
    const cleanDate = dateStr.trim()

    // If already ISO format (YYYY-MM-DD), return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return { normalized: cleanDate, original: dateStr }
    }

    // Handle German formats: DD.MM.YYYY, DD.MM.YY, DD/MM/YYYY, DD-MM-YYYY
    const germanMatch = cleanDate.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/)
    if (germanMatch) {
      let [, day, month, year] = germanMatch

      // Convert 2-digit year to 4-digit
      if (year.length === 2) {
        const currentYear = new Date().getFullYear()
        const currentCentury = Math.floor(currentYear / 100) * 100
        const fullYear = currentCentury + parseInt(year)

        // If the calculated year is more than 1 year in the future, assume previous century
        if (fullYear > currentYear + 1) {
          year = (currentCentury - 100 + parseInt(year)).toString()
        } else {
          year = fullYear.toString()
        }
      }

      // Validate ranges
      const dayNum = parseInt(day)
      const monthNum = parseInt(month)
      const yearNum = parseInt(year)

      if (dayNum >= 1 && dayNum <= 31 &&
          monthNum >= 1 && monthNum <= 12 &&
          yearNum >= 1900 && yearNum <= 2100) {
        const normalized = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        return { normalized, original: dateStr }
      }
    }

    // Handle text formats like "16. Mai 2026" or "Samstag, 16.05.26"
    const textMatch = cleanDate.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/)
    if (textMatch) {
      return this.normalizeDate(textMatch[0])
    }

    // If no pattern matches, return original string
    console.warn(`Could not parse date: ${dateStr}`)
    return { normalized: dateStr, original: dateStr }
  }

  // Normalize date from structured data (YAML/TXT)
  private static normalizeStructuredDate(dateValue: any): { normalized: string, original: string } | undefined {
    if (!dateValue) return undefined

    if (typeof dateValue === 'string') {
      return this.normalizeDate(dateValue)
    }

    // Handle Date objects or other formats
    const str = dateValue.toString()
    return { normalized: str, original: str }
  }

  // Parse hashtags from string (supports both with and without #)
  private static parseHashtags(hashtagString: string): string[] {
    if (!hashtagString || !hashtagString.trim()) {
      return []
    }

    // Split by comma and clean up
    const hashtags = hashtagString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => {
        // Normalize: ensure hashtag starts with #, remove spaces
        const cleaned = tag.replace(/\s+/g, '')
        return cleaned.startsWith('#') ? cleaned : `#${cleaned}`
      })

    // Remove duplicates
    return [...new Set(hashtags)]
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

  // Save parsed data to event folder (without platformContent - stored separately)
  static async saveParsedData(eventId: string, parsedData: ParsedEventData): Promise<void> {
    const eventDir = path.join(process.cwd(), 'events', eventId)
    const parsedDataPath = path.join(eventDir, 'parsed-data.json')

    // Ensure event directory exists
    if (!fs.existsSync(eventDir)) {
      fs.mkdirSync(eventDir, { recursive: true })
    }

    // Save only event metadata (platformContent is stored separately)
    const { platformContent, ...eventMetadata } = parsedData

    fs.writeFileSync(parsedDataPath, JSON.stringify(eventMetadata, null, 2))
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
      const { text, confidence, isStructured } = await this.extractText(filePath, this.getMimeType(filename))

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from file')
      }

      let parsedData: ParsedEventData

      if (isStructured) {
        // Use structured data parsing for TXT/MD files
        const structuredData = this.parseStructuredData(text)
        if (structuredData) {
          parsedData = structuredData
          parsedData.confidence = confidence
        } else {
          throw new Error('Failed to parse structured data')
        }
      } else {
        // Use OCR-based parsing for PDFs/images
        parsedData = this.parseEventData(text, confidence)
      }

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
      case '.txt': return 'text/plain'
      case '.md': return 'text/markdown'
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
      const parsedData = JSON.parse(fs.readFileSync(parsedDataPath, 'utf8'))

      // Load platform content from separate files
      const platformContent = await this.loadPlatformContent(eventId)
      if (platformContent) {
        parsedData.platformContent = platformContent
      }

      return parsedData
    } catch (error) {
      console.error(`Failed to load parsed data for event ${eventId}:`, error)
      return null
    }
  }

  // Load platform content from separate files
  static async loadPlatformContent(eventId: string): Promise<Record<string, any> | null> {
    const platformContentDir = path.join(process.cwd(), 'events', eventId, 'platforms')

    if (!fs.existsSync(platformContentDir)) {
      return null
    }

    // ✅ GENERIC: Load all platform content files (scan directory, not hardcoded list)
    const platformContent: Record<string, any> = {}
    
    try {
      const files = fs.readdirSync(platformContentDir)
      const platformFiles = files.filter(file => file.endsWith('.json') && !file.startsWith('_'))
      
      for (const file of platformFiles) {
        const platform = file.replace('.json', '')
        const platformFile = path.join(platformContentDir, file)
        try {
          let content = JSON.parse(fs.readFileSync(platformFile, 'utf8'))
          
          // ✅ GENERIC: Process content through platform service if available (for preview/display)
          try {
            const { PlatformManager } = await import('../platformManager.js')
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
          content = await ContentExtractionService.resolveTargetNamesInContent(platform, content)
          
          platformContent[platform] = content
        } catch (error) {
          console.warn(`Failed to load platform content for ${platform}:`, error)
        }
      }
    } catch (error) {
      console.warn(`Failed to read platform content directory:`, error)
    }

    return Object.keys(platformContent).length > 0 ? platformContent : null
  }

  // Save platform content to separate file
  static async savePlatformContent(eventId: string, platform: string, content: any): Promise<void> {
    const platformContentDir = path.join(process.cwd(), 'events', eventId, 'platforms')
    const platformFile = path.join(platformContentDir, `${platform}.json`)

    // Ensure directory exists
    if (!fs.existsSync(platformContentDir)) {
      fs.mkdirSync(platformContentDir, { recursive: true })
    }

    // ✅ GENERIC: Process content through platform service if available
    let processedContent = content
    try {
      const { PlatformManager } = await import('../platformManager.js')
      const platformService = await PlatformManager.getPlatformService(platform)
      
      // If platform service has processContentForSave method, use it
      if (platformService && typeof platformService.processContentForSave === 'function') {
        processedContent = platformService.processContentForSave(content)
      }
    } catch (error: any) {
      // Platform service not available or doesn't have processContentForSave - use content as-is
      console.debug(`No content processing for platform ${platform}:`, error?.message || 'Unknown error')
    }

    // Add lastModified timestamp
    const contentWithTimestamp = {
      ...processedContent,
      lastModified: new Date().toISOString()
    }

    fs.writeFileSync(platformFile, JSON.stringify(contentWithTimestamp, null, 2))
    console.log(`Saved platform content for ${platform} in separate file`)
  }

  // Main parsing method
  static async parseFile(file: UploadedFile): Promise<{
    parsedData: ParsedEventData
    duplicateCheck: DuplicateCheckResult
  }> {
    console.log(`Starting smart parsing for file: ${file.name}`)

    try {
      // Extract text
      const { text, confidence, isStructured } = await this.extractText(file.path, file.type)

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from file')
      }

      let parsedData: ParsedEventData

      if (isStructured) {
        // Use structured data parsing for TXT/MD files
        const structuredData = this.parseStructuredData(text)
        if (structuredData) {
          parsedData = structuredData
          parsedData.confidence = confidence
        } else {
          throw new Error('Failed to parse structured data')
        }
      } else {
        // Use OCR-based parsing for PDFs/images
        parsedData = this.parseEventData(text, confidence)
      }

      // Add internationalization support
      parsedData.detectedLocale = this.detectLocale(text)

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

  /**
   * Resolve target names for _templates array in content
   * Adds groupNames and targetNames to targets objects for display
   */
  static async resolveTargetNamesInContent(platform: string, content: any): Promise<any> {
    if (!content || !content._templates || !Array.isArray(content._templates)) {
      return content
    }

    try {
      // Get target service for this platform
      const { TargetController } = await import('../../controllers/targetController.js')
      
      // Get target service instance
      const service = await TargetController.getTargetService(platform)
      if (!service) {
        return content // No target service - return content as-is
      }

      // Load targets and groups
      const targets = await service.getTargets()
      const groups = await service.getGroups()

      // Create mapping: ID -> name
      const targetNameMap: Record<string, string> = {}
      targets.forEach((target: any) => {
        const baseField = service.getBaseField()
        targetNameMap[target.id] = target.name || target[baseField] || target.id
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
        if (templateEntry.targets.individual && Array.isArray(templateEntry.targets.individual)) {
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
