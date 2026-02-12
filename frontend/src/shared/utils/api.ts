import config from '../../config'

/**
 * Get the full API URL for a given endpoint.
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/api')
    ? endpoint
    : endpoint.startsWith('/')
      ? `/api${endpoint}`
      : `/api/${endpoint}`

  if (config.apiUrl.startsWith('/')) {
    return cleanEndpoint
  }

  return `${config.apiUrl}${cleanEndpoint}`
}

/**
 * Get file URL and handle both relative and absolute URLs.
 */
export function getFileUrl(filePath?: string | null): string | null {
  if (!filePath) {
    return null
  }

  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }

  if (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://')) {
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`
    return `${config.apiUrl}${cleanPath}`
  }

  return filePath
}
