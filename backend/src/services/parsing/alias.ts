/**
 * Template Variable Aliases
 * 
 * Defines aliases for template variables.
 * Add or modify aliases here for compatibility.
 * 
 * @module services/parsing/alias
 */

/**
 * Alias mappings: maps base field names to their aliases
 * 
 * Format: {
 *   'baseFieldName': ['alias1', 'alias2', ...]
 * }
 */
export const VARIABLE_ALIASES: Record<string, string[]> = {
  // Title aliases
  'title': ['eventTitle', 'name'],
  
  // Date aliases
  'date': ['eventDate'],
  
  // Time aliases
  'time': ['eventTime'],
  
  // Venue aliases
  'venue': ['location'],
  
  // City (no aliases)
  'city': [],
  
  // Genre aliases
  'genre': ['category'],
  
  // Price aliases
  'price': ['ticketPrice'],
  
  // Organizer aliases
  'organizer': ['organiser'],
  
  // Website aliases
  'website': ['url', 'link'],
  
  // Lineup aliases
  'lineup': ['performers', 'artists'],
  
  // Description aliases
  'description': ['desc', 'text']
}

/**
 * Image variable aliases
 */
export const IMAGE_ALIASES = {
  first: ['image', 'img1', 'image1'],
  others: (index: number) => [`img${index}`, `image${index}`]
}
