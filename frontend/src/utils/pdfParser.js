import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'

// Configure PDF.js worker - use local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

/**
 * Event Data Schema - Clean and simple
 */
export const EVENT_SCHEMA = {
  title: '',
  date: '', // ISO format: 2026-05-16
  time: '', // 24h format: 22:00
  venue: {
    name: '',
    address: '',
    city: '',
    zip: '',
    hall: ''
  },
  performers: [],
  website: '',
  ticketUrl: '',
  description: '',
  source: 'PDF',
  parsedAt: '',
  confidence: 0 // 0-100% parsing confidence
}

/**
 * Regex patterns for German event data extraction
 */
const PATTERNS = {
  // Event title (first line or prominent text)
  title: /^([^\n]{10,100})$/m,

  // Date patterns (German format with weekday)
  date: /(?:Samstag|Sonntag|Montag|Dienstag|Mittwoch|Donnerstag|Freitag),\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})/i,

  // Alternative date formats
  dateAlt: /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/,

  // Time patterns
  time: /(\d{1,2})(?::(\d{2}))?\s*(?:Uhr|Uhr)/i,

  // Address pattern (German street format)
  address: /(\w+straße\s+\d+)\s*[|ı]\s*(\d{5})\s+(\w+)\s*[|ı]\s*(.*)/i,

  // Website/URL patterns
  website: /(?:www\.|https?:\/\/)?([^\s]+\.[^\s]+)/i,

  // Performers/DJs patterns
  performers: /(?:DJ['']s?|präsentieren|present|feat\.?|mit)\s*([^&\n]+)(?:\s*&\s*([^&\n]+))*/i,

  // Venue patterns
  venue: /(werk-\d+|[A-Za-z\s]+[Hh]alle|[Cc]lub|[Bb]ar)/i,

  // Ticket info
  ticketInfo: /(?:Infos?|Tickets?|Reservierung)[^u]*(?:unter|at|@)\s*([^\n]+)/i
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/\n\s*\n/g, '\n') // Multiple newlines to single
    .trim()
}

/**
 * Extract event data using regex patterns
 */
function extractEventData(text) {
  const data = { ...EVENT_SCHEMA }
  const cleanTextData = text.replace(/\s+/g, ' ').trim()

  // Title extraction (usually first or prominent line)
  const titleMatch = cleanTextData.match(PATTERNS.title)
  if (titleMatch) {
    data.title = titleMatch[1].trim()
  }

  // Date extraction
  let dateMatch = cleanTextData.match(PATTERNS.date)
  if (!dateMatch) {
    dateMatch = cleanTextData.match(PATTERNS.dateAlt)
  }
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0')
    const month = dateMatch[2].padStart(2, '0')
    const year = dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]
    data.date = `${year}-${month}-${day}`
  }

  // Time extraction
  const timeMatch = cleanTextData.match(PATTERNS.time)
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0')
    const minutes = timeMatch[2] || '00'
    data.time = `${hours}:${minutes}`
  }

  // Address extraction
  const addressMatch = cleanTextData.match(PATTERNS.address)
  if (addressMatch) {
    data.venue.address = addressMatch[1]
    data.venue.zip = addressMatch[2]
    data.venue.city = addressMatch[3]
    data.venue.hall = addressMatch[4] || ''
  }

  // Website extraction
  const websiteMatch = cleanTextData.match(PATTERNS.website)
  if (websiteMatch) {
    const url = websiteMatch[1]
    data.website = url.startsWith('http') ? url : `https://${url}`
    data.ticketUrl = data.website // Assume same for tickets
  }

  // Performers extraction
  const performersMatch = cleanTextData.match(PATTERNS.performers)
  if (performersMatch) {
    const performers = []
    if (performersMatch[1]) performers.push(performersMatch[1].trim())
    if (performersMatch[2]) performers.push(performersMatch[2].trim())
    data.performers = performers
  }

  // Venue name extraction
  const venueMatch = cleanTextData.match(PATTERNS.venue)
  if (venueMatch) {
    data.venue.name = venueMatch[1]
  }

  // Set parsing metadata
  data.parsedAt = new Date().toISOString()
  data.description = data.title || 'Event description'

  // Calculate confidence score
  data.confidence = calculateConfidence(data)

  return data
}

/**
 * Calculate parsing confidence (0-100)
 */
function calculateConfidence(data) {
  let score = 0
  const fields = ['title', 'date', 'time', 'venue.address', 'venue.city', 'website']

  fields.forEach(field => {
    const value = field.includes('.')
      ? data[field.split('.')[0]][field.split('.')[1]]
      : data[field]

    if (value && value.trim()) score += 100 / fields.length
  })

  return Math.round(score)
}

/**
 * Extract text from PDF using PDF.js
 */
async function extractTextFromPDF(pdfBuffer) {
  try {
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer })
    const pdf = await loadingTask.promise

    let fullText = ''
    const numPages = pdf.numPages

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      // Combine text items with proper spacing
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

      fullText += pageText + '\n'
    }

    return {
      text: fullText.trim(),
      pages: numPages
    }

  } catch (error) {
    console.error('PDF text extraction error:', error)
    throw new Error(`Failed to extract text from PDF: ${error.message}`)
  }
}

/**
 * Parse PDF buffer to event data
 */
export async function parsePDFForEvent(pdfBuffer) {
  try {
    // Extract text from PDF using PDF.js
    const pdfData = await extractTextFromPDF(pdfBuffer)
    const text = pdfData.text

    if (!text || text.trim().length < 10) {
      throw new Error('PDF contains insufficient text for parsing')
    }

    // Extract event data
    const eventData = extractEventData(text)

    // Validate extracted data
    if (!eventData.title && !eventData.date) {
      throw new Error('Could not extract meaningful event data from PDF')
    }

    return {
      success: true,
      data: eventData,
      rawText: text,
      pages: pdfData.pages
    }

  } catch (error) {
    console.error('PDF parsing error:', error)
    return {
      success: false,
      error: error.message,
      rawText: '',
      pages: 0
    }
  }
}

/**
 * Parse image using OCR
 */
export async function parseImageForEvent(imageBuffer) {
  try {
    const result = await Tesseract.recognize(imageBuffer, 'deu+eng')
    const text = result.data.text

    if (!text || text.trim().length < 10) {
      throw new Error('OCR could not extract sufficient text from image')
    }

    const eventData = extractEventData(text)

    return {
      success: true,
      data: eventData,
      rawText: text,
      ocrConfidence: result.data.confidence
    }

  } catch (error) {
    console.error('OCR parsing error:', error)
    return {
      success: false,
      error: error.message,
      rawText: '',
      ocrConfidence: 0
    }
  }
}

/**
 * Main parsing function that handles both PDFs and images
 */
export async function parseFileForEvent(file) {
  const buffer = await file.arrayBuffer()

  if (file.type === 'application/pdf') {
    return await parsePDFForEvent(buffer)
  } else if (file.type.startsWith('image/')) {
    return await parseImageForEvent(buffer)
  } else {
    return {
      success: false,
      error: 'Unsupported file type. Please upload PDF or image files.',
      rawText: '',
      pages: 0
    }
  }
}

/**
 * Format event data for display
 */
export function formatEventForDisplay(eventData) {
  return {
    title: eventData.title || 'No title found',
    date: eventData.date ? new Date(eventData.date).toLocaleDateString('de-DE') : 'No date found',
    time: eventData.time || 'No time found',
    venue: `${eventData.venue.name || ''} ${eventData.venue.address || ''}, ${eventData.venue.zip || ''} ${eventData.venue.city || ''}`.trim(),
    performers: eventData.performers.join(', ') || 'No performers found',
    website: eventData.website || 'No website found',
    confidence: `${eventData.confidence}%`
  }
}
