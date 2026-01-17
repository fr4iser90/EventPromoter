// API utility functions
import config from '../../config.js'

/**
 * Get the full API URL for a given endpoint
 * @param {string} endpoint - API endpoint (e.g., '/api/platforms' or 'platforms')
 * @returns {string} Full URL
 * 
 * Examples:
 * - getApiUrl('/api/platforms') → '/api/platforms' (relative) or 'http://localhost:4000/api/platforms' (dev)
 * - getApiUrl('platforms') → '/api/platforms' (relative) or 'http://localhost:4000/api/platforms' (dev)
 */
export function getApiUrl(endpoint) {
  // Ensure endpoint starts with /api
  let cleanEndpoint = endpoint.startsWith('/api') 
    ? endpoint 
    : endpoint.startsWith('/') 
      ? `/api${endpoint}`
      : `/api/${endpoint}`
  
  // If apiUrl is relative (starts with /), use it directly
  if (config.apiUrl.startsWith('/')) {
    return cleanEndpoint
  }
  
  // Otherwise, it's a full URL - append endpoint
  return `${config.apiUrl}${cleanEndpoint}`
}

/**
 * Get file URL - handles both relative and absolute URLs
 * @param {string} filePath - File path from backend
 * @returns {string} Full file URL
 */
export function getFileUrl(filePath) {
  if (!filePath) return null
  
  // If already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  
  // If relative path, prepend API URL
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`
  
  if (config.apiUrl.startsWith('/')) {
    return `${config.apiUrl}${cleanPath}`
  }
  
  return `${config.apiUrl}${cleanPath}`
}
