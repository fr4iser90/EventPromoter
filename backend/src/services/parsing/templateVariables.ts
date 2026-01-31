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
 * Convert parsed event data + uploaded files to template variables
 * 
 * Creates aliases for compatibility (e.g., {title} → {eventTitle}, {name})
 * 
 * @param parsedData - Parsed event data from TXT/MD files
 * @param uploadedFileRefs - Array of uploaded file references
 * @returns Object with all template variables (including aliases)
 */
export function getTemplateVariables(
  parsedData: ParsedEventData | null,
  uploadedFileRefs: UploadedFileRef[] = []
): Record<string, string> {
  const variables: Record<string, string> = {}

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
      
      // Set base variable
      if (key === 'lineup' && Array.isArray(value)) {
        const lineupStr = value.join(', ')
        variables[key] = lineupStr
        // Set aliases
        aliases.forEach(alias => {
          variables[alias] = lineupStr
        })
      } else if (typeof value === 'string' && value) {
        variables[key] = value
        // Set aliases
        aliases.forEach(alias => {
          variables[alias] = value
        })
      }
    })
  }

  // Map image files
  const imageFiles = uploadedFileRefs.filter(file => 
    file.isImage || file.type?.startsWith('image/')
  )

  imageFiles.forEach((file, index) => {
    const imageUrl = file.url.startsWith('http')
      ? file.url
      : `http://localhost:4000${file.url}`
    const imageNum = index + 1

    // Support multiple variable names for images
    if (imageNum === 1) {
      variables.image1 = imageUrl
      variables.img1 = imageUrl
      variables.image = imageUrl              // Alias for first image
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
      variableNames.push('image1', 'img1', 'image')
    } else {
      variableNames.push(`image${num}`, `img${num}`)
    }
  })

  return [...new Set(variableNames)] // Remove duplicates
}


