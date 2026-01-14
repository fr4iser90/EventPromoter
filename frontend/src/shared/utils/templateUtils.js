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

/**
 * Extract unfulfilled template variables from content
 * Returns array of variable names that are still in {variableName} format
 */
export function getUnfulfilledVariables(content, availableVariables = {}) {
  if (!content || typeof content !== 'string') {
    return []
  }

  // Find all {variableName} patterns
  const variablePattern = /\{([a-zA-Z0-9_]+)\}/g
  const matches = []
  let match

  while ((match = variablePattern.exec(content)) !== null) {
    const variableName = match[1]
    // Only include if not in availableVariables
    if (!availableVariables[variableName]) {
      matches.push(variableName)
    }
  }

  // Remove duplicates
  return [...new Set(matches)]
}

/**
 * Extract all template variables from a template object
 * Extracts from template.variables array OR parses from template.template.html/subject
 * 
 * @param template - Template object with variables array or html/subject with {variable} patterns
 * @returns Array of unique variable names
 */
export function extractTemplateVariables(template) {
  if (!template) return []

  // Use ONLY template.variables array (no fallbacks)
  if (template.variables && Array.isArray(template.variables)) {
    return template.variables
  }

  return []
}

/**
 * Check if a variable is auto-filled (comes from parsedData)
 * Auto-filled variables: date, time, venue, city, title, eventTitle, etc.
 * 
 * @param variableName - Name of the variable
 * @param parsedData - Parsed event data
 * @returns true if variable is auto-filled from parsedData
 */
export function isAutoFilledVariable(variableName, parsedData) {
  if (!parsedData) return false

  // Map variable names to parsedData fields
  const autoFilledMap = {
    'date': 'date',
    'eventDate': 'date',
    'time': 'time',
    'eventTime': 'time',
    'venue': 'venue',
    'location': 'venue',
    'city': 'city',
    'title': 'title',
    'eventTitle': 'title',
    'name': 'title',
    'description': 'description',
    'desc': 'description',
    'text': 'description',
    'price': 'price',
    'ticketPrice': 'price',
    'genre': 'genre',
    'category': 'genre',
    'organizer': 'organizer',
    'organiser': 'organizer',
    'website': 'website',
    'url': 'website',
    'link': 'website',
    'lineup': 'lineup',
    'performers': 'lineup',
    'artists': 'lineup'
  }

  const mappedField = autoFilledMap[variableName]
  return mappedField && parsedData[mappedField] !== undefined && parsedData[mappedField] !== null
}

/**
 * Get label and icon for a template variable
 * 
 * @param variableName - Name of the variable
 * @returns Object with label and icon
 */
export function getVariableLabel(variableName) {
  const labels = {
    'date': { label: 'Date', icon: '📅' },
    'eventDate': { label: 'Date', icon: '📅' },
    'time': { label: 'Time', icon: '🕐' },
    'eventTime': { label: 'Time', icon: '🕐' },
    'venue': { label: 'Venue', icon: '📍' },
    'location': { label: 'Location', icon: '📍' },
    'city': { label: 'City', icon: '🏙️' },
    'title': { label: 'Title', icon: '🎉' },
    'eventTitle': { label: 'Title', icon: '🎉' },
    'name': { label: 'Title', icon: '🎉' },
    'description': { label: 'Description', icon: '📝' },
    'desc': { label: 'Description', icon: '📝' },
    'text': { label: 'Description', icon: '📝' },
    'price': { label: 'Price', icon: '💰' },
    'ticketPrice': { label: 'Price', icon: '💰' },
    'genre': { label: 'Genre', icon: '🎵' },
    'category': { label: 'Category', icon: '🎵' },
    'organizer': { label: 'Organizer', icon: '👤' },
    'organiser': { label: 'Organizer', icon: '👤' },
    'website': { label: 'Website', icon: '🔗' },
    'url': { label: 'URL', icon: '🔗' },
    'link': { label: 'Link', icon: '🔗' },
    'lineup': { label: 'Lineup', icon: '🎤' },
    'performers': { label: 'Performers', icon: '🎤' },
    'artists': { label: 'Artists', icon: '🎤' },
    'ticketInfo': { label: 'Ticket Info', icon: '🎫' },
    'highlights': { label: 'Highlights', icon: '✨' },
    'prepTips': { label: 'Preparation Tips', icon: '💡' },
    'unsubscribeLink': { label: 'Unsubscribe Link', icon: '🔕' },
    'contactLink': { label: 'Contact Link', icon: '📧' }
  }

  return labels[variableName] || { label: variableName, icon: '📌' }
}

/**
 * Extract template variables from content object
 * Reads _var_{variableName} fields and filters out disabled ones
 * 
 * @param content - Content object with _var_* fields
 * @returns Object with variable values (disabled ones excluded)
 */
export function extractVariablesFromContent(content) {
  if (!content) return {}
  
  const variables = {}
  
  Object.keys(content).forEach(key => {
    // Check if it's a variable field
    if (key.startsWith('_var_')) {
      const varName = key.replace('_var_', '')
      
      // Check if variable is disabled
      const isDisabled = content[`_disabled_${varName}`] === true
      
      // Only include if not disabled and has a value
      if (!isDisabled && content[key] !== undefined && content[key] !== null && content[key] !== '') {
        variables[varName] = content[key]
      }
    }
  })
  
  return variables
}
