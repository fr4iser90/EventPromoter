/**
 * Template Utilities
 * Functions for mapping placeholders and replacing template variables
 */

/**
 * Map German placeholders to template variable names
 */
export const PLACEHOLDER_MAPPING = {
  'titel': ['title', 'eventTitle', 'name'],
  'datum': ['date', 'eventDate'],
  'zeit': ['time', 'eventTime'],
  'venue': ['venue', 'location'],
  'stadt': ['city'],
  'genre': ['genre', 'category'],
  'preis': ['price', 'ticketPrice'],
  'organizer': ['organizer', 'organiser'],
  'website': ['website', 'url', 'link'],
  'lineup': ['lineup', 'performers', 'artists'],
  'beschreibung': ['description', 'desc', 'text'],
  'img1': ['image1', 'img1', 'image'],
  'img2': ['image2', 'img2'],
  'img3': ['image3', 'img3'],
  'img4': ['image4', 'img4'],
  'img5': ['image5', 'img5'],
}

/**
 * Convert parsed event data + uploaded files to template variables
 */
export function getTemplateVariables(parsedData, uploadedFileRefs = []) {
  const variables = {}

  // Map parsed data fields
  if (parsedData) {
    if (parsedData.title) {
      variables.title = parsedData.title
      variables.eventTitle = parsedData.title
      variables.name = parsedData.title
    }
    if (parsedData.date) {
      variables.date = parsedData.date
      variables.eventDate = parsedData.date
    }
    if (parsedData.time) {
      variables.time = parsedData.time
      variables.eventTime = parsedData.time
    }
    if (parsedData.venue) {
      variables.venue = parsedData.venue
      variables.location = parsedData.venue
    }
    if (parsedData.city) {
      variables.city = parsedData.city
    }
    if (parsedData.genre) {
      variables.genre = parsedData.genre
      variables.category = parsedData.genre
    }
    if (parsedData.price) {
      variables.price = parsedData.price
      variables.ticketPrice = parsedData.price
    }
    if (parsedData.organizer) {
      variables.organizer = parsedData.organizer
      variables.organiser = parsedData.organizer
    }
    if (parsedData.website) {
      variables.website = parsedData.website
      variables.url = parsedData.website
      variables.link = parsedData.website
    }
    if (parsedData.lineup) {
      const lineupStr = Array.isArray(parsedData.lineup) 
        ? parsedData.lineup.join(', ') 
        : parsedData.lineup
      variables.lineup = lineupStr
      variables.performers = lineupStr
      variables.artists = lineupStr
    }
    if (parsedData.description) {
      variables.description = parsedData.description
      variables.desc = parsedData.description
      variables.text = parsedData.description
    }
  }

  // Map image files
  const imageFiles = uploadedFileRefs.filter(file => file.type.startsWith('image/'))
  imageFiles.forEach((file, index) => {
    const imageUrl = file.url.startsWith('http') ? file.url : `http://localhost:4000${file.url}`
    const imageNum = index + 1
    
    // Support multiple variable names for images
    if (imageNum === 1) {
      variables.image1 = imageUrl
      variables.img1 = imageUrl
      variables.image = imageUrl
    } else {
      variables[`image${imageNum}`] = imageUrl
      variables[`img${imageNum}`] = imageUrl
    }
  })

  return variables
}

/**
 * Replace template variables in content with actual values
 */
export function replaceTemplateVariables(content, variables) {
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
 * Get available placeholders as template variable names
 */
export function getTemplateVariableNames(parsedData, uploadedFileRefs = []) {
  const variableNames = []
  const imageFiles = uploadedFileRefs.filter(file => file.type.startsWith('image/'))

  if (parsedData?.title) variableNames.push('title', 'eventTitle')
  if (parsedData?.date) variableNames.push('date', 'eventDate')
  if (parsedData?.time) variableNames.push('time', 'eventTime')
  if (parsedData?.venue) variableNames.push('venue', 'location')
  if (parsedData?.city) variableNames.push('city')
  if (parsedData?.genre) variableNames.push('genre', 'category')
  if (parsedData?.price) variableNames.push('price', 'ticketPrice')
  if (parsedData?.organizer) variableNames.push('organizer')
  if (parsedData?.website) variableNames.push('website', 'url', 'link')
  if (parsedData?.lineup) variableNames.push('lineup', 'performers', 'artists')
  if (parsedData?.description) variableNames.push('description', 'desc', 'text')
  
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

