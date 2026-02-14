/**
 * Axios Global Configuration
 * 
 * Sets up global request interceptors for all axios requests.
 * This ensures language headers are automatically sent to the backend.
 * 
 * @module shared/utils/axiosConfig
 */

import axios from 'axios'
import config from '../../config'

/**
 * Default language fallback
 */
const DEFAULT_LANG = 'de'

/**
 * Get current language from localStorage with fallback
 * Handles SSR / Edge cases where localStorage might not be available
 */
function getCurrentLanguage() {
  let lang = DEFAULT_LANG
  
  try {
    // Try to get language from localStorage (set by i18next)
    const storedLang = localStorage.getItem('i18nextLng')
    if (storedLang) {
      // Normalize language code (e.g., 'de-DE' -> 'de', 'en-US' -> 'en')
      lang = storedLang.split('-')[0]
    }
  } catch (error) {
    // localStorage not available (SSR, private browsing, etc.)
    console.warn('localStorage not available, using default language:', DEFAULT_LANG)
  }
  
  // Ensure we only use supported languages
  const supportedLangs = ['en', 'de', 'es']
  if (!supportedLangs.includes(lang)) {
    lang = DEFAULT_LANG
  }
  
  return lang
}

/**
 * Request interceptor: Automatically add Accept-Language header
 * 
 * This ensures all API requests include the user's language preference,
 * allowing the backend i18next middleware to detect and use the correct language.
 */
axios.interceptors.request.use(
  (config) => {
    const lang = getCurrentLanguage()
    
    // Set Accept-Language header for i18next backend detection
    // i18next-http-middleware expects this header (detection order: header, querystring, cookie)
    config.headers['Accept-Language'] = lang
    
    return config
  },
  (error) => {
    // Handle request error
    return Promise.reject(error)
  }
)

// Ensure cookie-based auth works when frontend and backend run on different origins in dev.
axios.defaults.withCredentials = true

// Keep same-origin behavior untouched; this only affects absolute API base URLs.
if (typeof axios.defaults.baseURL === 'undefined' && typeof config.apiUrl === 'string' && config.apiUrl.startsWith('http')) {
  axios.defaults.baseURL = config.apiUrl
}

/**
 * Export configured axios instance
 * (All imports of axios will use the same singleton with interceptors)
 */
export default axios
