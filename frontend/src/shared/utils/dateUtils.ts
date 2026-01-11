// Date utilities for locale-aware formatting

export type DateFormat = 'german' | 'us' | 'iso'
export type TimeFormat = '24h' | '12h'

/**
 * Format date for display based on locale and user preferences
 */
export const formatDateForDisplay = (
  isoDate: string,
  locale: string = 'de-DE',
  dateFormat?: DateFormat
): string => {
  if (!isoDate) return ''

  try {
    const date = new Date(isoDate)

    // If specific format requested, use it
    if (dateFormat) {
      switch (dateFormat) {
        case 'german':
          return new Intl.DateTimeFormat('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(date)
        case 'us':
          return new Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          }).format(date)
        case 'iso':
        default:
          return isoDate
      }
    }

    // Otherwise use locale-aware formatting
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date)
  } catch (error) {
    console.warn('Error formatting date:', error)
    return isoDate // fallback
  }
}

/**
 * Format time for display
 */
export const formatTimeForDisplay = (
  isoTime: string,
  timeFormat: TimeFormat = '24h'
): string => {
  if (!isoTime) return ''

  try {
    // Parse HH:MM format
    const [hours, minutes] = isoTime.split(':').map(Number)

    if (timeFormat === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
    }

    // 24h format
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  } catch (error) {
    console.warn('Error formatting time:', error)
    return isoTime // fallback
  }
}

/**
 * Get user's preferred locale from various sources
 */
export const getUserLocale = (): string => {
  // Try localStorage first
  const stored = localStorage.getItem('i18nextLng')
  if (stored) return stored

  // Try navigator languages
  if (navigator.languages && navigator.languages.length > 0) {
    return navigator.languages[0]
  }

  // Fallback to browser language
  return navigator.language || 'de-DE'
}

/**
 * Detect date format from string
 */
export const detectDateFormat = (dateStr: string): DateFormat => {
  if (!dateStr) return 'iso'

  // German format: DD.MM.YYYY
  if (/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(dateStr)) {
    return 'german'
  }

  // US format: MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateStr)) {
    return 'us'
  }

  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return 'iso'
  }

  return 'iso' // fallback
}

/**
 * Parse date string to Date object
 */
export const parseDateString = (dateStr: string): Date | null => {
  if (!dateStr) return null

  try {
    // Try ISO format first
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr + 'T00:00:00')
    }

    // Try German format
    const germanMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (germanMatch) {
      const [, day, month, year] = germanMatch
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`)
    }

    // Try US format
    const usMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (usMatch) {
      const [, month, day, year] = usMatch
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`)
    }

    // Fallback to native Date parsing
    return new Date(dateStr)
  } catch (error) {
    console.warn('Error parsing date:', error)
    return null
  }
}

/**
 * Format relative time (e.g., "vor 2 Tagen", "in 3 Stunden")
 */
export const formatRelativeTime = (date: Date, locale: string = 'de-DE'): string => {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    return rtf.format(diffHours, 'hour')
  }

  return rtf.format(diffDays, 'day')
}
