/**
 * Locale Utilities
 * 
 * Centralized locale handling for the frontend.
 * Provides normalization, validation, and user locale detection.
 * 
 * @module shared/utils/localeUtils
 */

/**
 * Normalize locale code (e.g., 'de-DE' -> 'de', 'en-US' -> 'en')
 */
export const normalizeLocale = (locale: string): string => {
  if (!locale) return 'en'
  return locale.split('-')[0].toLowerCase()
}

/**
 * Validate and normalize locale to supported values
 * 
 * @param locale - Locale string (e.g., 'de-DE', 'de', 'en-US')
 * @returns Valid locale: 'en' | 'de' | 'es'
 */
export const getValidLocale = (locale?: string): 'en' | 'de' | 'es' => {
  if (!locale) return 'en'
  const normalized = normalizeLocale(locale)
  return ['en', 'de', 'es'].includes(normalized) ? normalized as 'en' | 'de' | 'es' : 'en'
}

/**
 * Get user locale from i18n
 * 
 * @param i18n - i18next instance
 * @returns Valid locale: 'en' | 'de' | 'es'
 */
export const getUserLocale = (i18n: any): 'en' | 'de' | 'es' => {
  return getValidLocale(i18n?.language)
}

/**
 * Get locale map for date formatting (Intl.DateTimeFormat)
 * 
 * @param locale - Valid locale: 'en' | 'de' | 'es'
 * @returns Full locale string for Intl (e.g., 'de-DE', 'en-US')
 */
export const getLocaleMap = (locale: 'en' | 'de' | 'es'): string => {
  const map: Record<string, string> = {
    'de': 'de-DE',
    'es': 'es-ES',
    'en': 'en-US'
  }
  return map[locale] || 'en-US'
}

/**
 * Get locale display name
 * 
 * @param locale - Valid locale: 'en' | 'de' | 'es'
 * @returns Display name with flag emoji
 */
export const getLocaleDisplayName = (locale: 'en' | 'de' | 'es'): string => {
  const map: Record<string, string> = {
    'de': '🇩🇪 Deutsch',
    'es': '🇪🇸 Español',
    'en': '🇬🇧 English'
  }
  return map[locale] || '🇬🇧 English'
}
