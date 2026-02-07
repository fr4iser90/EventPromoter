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

/**
 * Get default currency symbol based on locale
 * 
 * @param locale - Valid locale: 'en' | 'de' | 'es' (optional, defaults to 'de')
 * @returns Currency symbol: '€' | '$'
 */
export const getDefaultCurrency = (locale?: 'en' | 'de' | 'es'): string => {
  const validLocale = locale || 'de'
  switch (validLocale) {
    case 'en':
      return '$'
    case 'de':
    case 'es':
    default:
      return '€'
  }
}

/**
 * Extract currency symbol from price string
 * 
 * @param inputValue - Price string (e.g., "25$", "30€")
 * @returns Currency symbol if found, null otherwise
 */
export const extractCurrencyFromPrice = (inputValue: string): string | null => {
  if (!inputValue || inputValue.trim().length === 0) return null
  
  const trimmed = inputValue.trim()
  
  // Match currency symbols at the end of the string
  const currencyMatch = trimmed.match(/[€$£¥₹₽₩₪₫₨₦₡₵₴₸₷₯₰₱₲₳₶₷₸₹₺₼₽₾₿]$/)
  if (currencyMatch) {
    return currencyMatch[0]
  }
  
  return null
}

/**
 * Format price input with currency - auto-add currency if only numbers entered
 * 
 * @param inputValue - User input value
 * @param locale - Valid locale: 'en' | 'de' | 'es' (optional)
 * @returns Formatted price string with currency
 */
export const formatPriceInput = (inputValue: string, locale?: 'en' | 'de' | 'es'): string => {
  if (!inputValue || inputValue.trim().length === 0) return ''
  
  const trimmed = inputValue.trim()
  
  // If it's "Coming Soon" or similar text, keep as is
  if (/^[a-zA-Z\s]+$/i.test(trimmed)) {
    return trimmed
  }
  
  // Check if already has currency symbol
  const hasCurrency = /[€$£¥₹₽₩₪₫₨₦₡₵₴₸₷₯₰₱₲₳₶₷₸₹₺₼₽₾₿]/.test(trimmed)
  
  // If it's just numbers, add default currency
  if (!hasCurrency && /^\d+([.,]\d+)?$/.test(trimmed)) {
    return `${trimmed}${getDefaultCurrency(locale)}`
  }
  
  // Otherwise keep as is (user has already formatted it)
  return trimmed
}
