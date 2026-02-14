/**
 * Template Variables Utility
 * 
 * Maps parsed event data to template variables with aliases.
 * This is the SOURCE OF TRUTH for variable mapping - backend only!
 * 
 * @module services/parsing/templateVariables
 */

import { ParsedEventData } from '../../types/index.js'
import { VARIABLE_ALIASES, IMAGE_ALIASES } from './alias.js'

export interface UploadedFileRef {
  id?: string
  url: string
  type: string
  isImage?: boolean
  visibility?: 'internal' | 'public'
}

/**
 * Format date based on locale
 */
export function formatDate(dateString: string, locale: string = 'en'): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString // Invalid date, return as-is
    
    const localeMap: Record<string, string> = {
      'de': 'de-DE',
      'es': 'es-ES',
      'en': 'en-US'
    }
    const normalizedLocale = localeMap[locale] || 'en-US'
    
    return date.toLocaleDateString(normalizedLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

/**
 * Format time based on locale (24h for de/es, keep as-is for en)
 */
function formatTime(timeString: string, locale: string = 'en'): string {
  // Time is already in 24h format (HH:MM), just return as-is
  // All locales use 24h format for consistency
  return timeString
}

/**
 * Convert parsed event data + uploaded files to template variables
 * 
 * Creates aliases for compatibility (e.g., {title} → {eventTitle}, {name})
 * Formats date and time based on locale
 * 
 * @param parsedData - Parsed event data from TXT/MD files
 * @param uploadedFileRefs - Array of uploaded file references
 * @param locale - Optional locale for formatting dates/times (default: 'en')
 * @returns Object with all template variables (including aliases)
 */
export function getTemplateVariables(
  parsedData: ParsedEventData | null,
  uploadedFileRefs: UploadedFileRef[] = [],
  locale: string = 'en'
): Record<string, string> {
  const variables: Record<string, string> = {}
  const normalizedLocale = locale.split('-')[0] // Normalize 'de-DE' -> 'de'

  // Map parsed data fields using aliases from alias.ts
  if (parsedData) {
    // Iterate through all fields in parsedData
    Object.entries(parsedData).forEach(([key, value]) => {
      // Skip non-string fields and metadata
      if (key === 'rawText' || key === 'confidence' || key === 'parsedAt' || key === 'hash' || 
          key === 'originalDate' || key === 'originalTime' || key === 'detectedLocale' ||
          key === 'platformContent' || value === null || value === undefined) {
        return
      }

      // Get aliases for this field
      const aliases = VARIABLE_ALIASES[key] || []
      
      // Format date and time based on locale
      let formattedValue: string
      if (key === 'date') {
        formattedValue = formatDate(String(value), normalizedLocale)
      } else if (key === 'time') {
        formattedValue = formatTime(String(value), normalizedLocale)
      } else if (key === 'lineup' && Array.isArray(value)) {
        formattedValue = value.join(', ')
      } else {
        formattedValue = String(value)
      }
      
      // Set base variable
      variables[key] = formattedValue
      // Set aliases
      aliases.forEach(alias => {
        variables[alias] = formattedValue
      })
    })

    // Map extended data fields (Ticket-Info, Contact-Info, etc.)
    if (parsedData.extendedData) {
      const extendedVars = generateExtendedDataVariables(parsedData.extendedData)
      Object.assign(variables, extendedVars)
    }
  }

  // Map image files
  const imageFiles = uploadedFileRefs.filter(file => 
    file.isImage || file.type?.startsWith('image/')
  )

  imageFiles.forEach((file, index) => {
    const imageUrl = (() => {
      if (file.url.startsWith('http://') || file.url.startsWith('https://')) {
        return file.url
      }

      const cleanPath = file.url.startsWith('/') ? file.url : `/${file.url}`

      // In production/docker setups frontend and backend can run on different hosts.
      // Prefer explicit BASE_URL when configured; otherwise keep relative path.
      const baseUrl = process.env.BASE_URL
      if (baseUrl && (baseUrl.startsWith('http://') || baseUrl.startsWith('https://'))) {
        return `${baseUrl}${cleanPath}`
      }

      return cleanPath
    })()
    const imageNum = index + 1

    // Canonical image variable is `image`.
    // Legacy aliases (`img1`, `image1`, `imgN`) are still written for backwards compatibility.
    if (imageNum === 1) {
      variables.image = imageUrl
      variables.image1 = imageUrl
      variables.img1 = imageUrl
    } else {
      variables[`image${imageNum}`] = imageUrl
      variables[`img${imageNum}`] = imageUrl
    }
  })

  return variables
}

/**
 * Replace template variables in content with actual values
 * 
 * @param content - Template content with {variable} placeholders
 * @param variables - Object with variable values
 * @returns Content with variables replaced
 */
export function replaceTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  if (!content || typeof content !== 'string') {
    return content
  }

  let result = content

  // Replace all variable patterns {variableName}
  Object.entries(variables).forEach(([key, value]) => {
    // Handle array values (like lineup)
    const replacement = Array.isArray(value) ? value.join(', ') : String(value || '')

    // Replace {variableName} pattern
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    result = result.replace(regex, replacement)
  })

  return result
}

/**
 * Get list of all available template variable names
 * 
 * @param parsedData - Parsed event data
 * @param uploadedFileRefs - Array of uploaded file references
 * @returns Array of variable names
 */
export function getTemplateVariableNames(
  parsedData: ParsedEventData | null,
  uploadedFileRefs: UploadedFileRef[] = []
): string[] {
  const variableNames: string[] = []
  const imageFiles = uploadedFileRefs.filter(file =>
    file.isImage || file.type?.startsWith('image/')
  )

  if (parsedData?.title) {
    variableNames.push('title', 'eventTitle', 'name')
  }
  if (parsedData?.date) {
    variableNames.push('date', 'eventDate')
  }
  if (parsedData?.time) {
    variableNames.push('time', 'eventTime')
  }
  if (parsedData?.venue) {
    variableNames.push('venue', 'location')
  }
  if (parsedData?.city) {
    variableNames.push('city')
  }
  if (parsedData?.genre) {
    variableNames.push('genre', 'category')
  }
  if (parsedData?.price) {
    variableNames.push('price', 'ticketPrice')
  }
  if (parsedData?.organizer) {
    variableNames.push('organizer', 'organiser')
  }
  if (parsedData?.website) {
    variableNames.push('website', 'url', 'link')
  }
  if (parsedData?.lineup) {
    variableNames.push('lineup', 'performers', 'artists')
  }
  if (parsedData?.description) {
    variableNames.push('description', 'desc', 'text')
  }

  // Add image variables
  imageFiles.forEach((_, index) => {
    const num = index + 1
    if (num === 1) {
      variableNames.push('image', 'image1', 'img1')
    } else {
      variableNames.push(`image${num}`, `img${num}`)
    }
  })

  // Add extended data variables
  if (parsedData?.extendedData) {
    const extendedVarNames = getExtendedDataVariableNames(parsedData.extendedData)
    variableNames.push(...extendedVarNames)
  }

  return [...new Set(variableNames)] // Remove duplicates
}

/**
 * Generate template variables from extended data structure
 * 
 * @param extendedData - Extended data object with groups
 * @returns Object with template variables
 */
function generateExtendedDataVariables(extendedData: Record<string, Record<string, any>>): Record<string, string> {
  const variables: Record<string, string> = {}

  Object.entries(extendedData).forEach(([groupId, groupData]) => {
    if (!groupData || typeof groupData !== 'object') return

    // Handle nested structures (e.g., ticketInfo.presale.price)
    Object.entries(groupData).forEach(([fieldId, fieldValue]) => {
      if (fieldValue === null || fieldValue === undefined) return

      // If fieldValue is an object (nested group), process recursively
      if (typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
        Object.entries(fieldValue).forEach(([subFieldId, subFieldValue]) => {
          if (subFieldValue === null || subFieldValue === undefined) return
          
          // Generate variable name: {groupId}{capitalize(fieldId)}{capitalize(subFieldId)}
          // Example: ticketInfo.presale.price → ticketPresalePrice
          const varName = `${groupId}${capitalize(fieldId)}${capitalize(subFieldId)}`
          variables[varName] = String(subFieldValue)
        })
      } else {
        // Simple field: {groupId}{capitalize(fieldId)}
        // Example: ticketInfo.info → ticketInfo
        const varName = `${groupId}${capitalize(fieldId)}`
        variables[varName] = String(fieldValue)
      }
    })
  })

  return variables
}

/**
 * Get template variable names from extended data
 */
function getExtendedDataVariableNames(extendedData: Record<string, Record<string, any>>): string[] {
  const variableNames: string[] = []

  Object.entries(extendedData).forEach(([groupId, groupData]) => {
    if (!groupData || typeof groupData !== 'object') return

    Object.entries(groupData).forEach(([fieldId, fieldValue]) => {
      if (fieldValue === null || fieldValue === undefined) return

      if (typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
        // Nested structure
        Object.keys(fieldValue).forEach(subFieldId => {
          const varName = `${groupId}${capitalize(fieldId)}${capitalize(subFieldId)}`
          variableNames.push(varName)
        })
      } else {
        // Simple field
        const varName = `${groupId}${capitalize(fieldId)}`
        variableNames.push(varName)
      }
    })
  })

  return variableNames
}

/**
 * Capitalize first letter of string
 */
function capitalize(str: string): string {
  if (!str || str.length === 0) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}


