// Generic validation utilities for frontend.

export interface PlatformRule {
  required: string[]
  maxLength: number | null
  supports: string[]
}

export type PlatformRules = Record<string, PlatformRule>

export interface EventValidationResult {
  isValid: boolean
  errors: string[]
}

export interface PlatformValidationResult {
  platform: string
  valid: boolean
  errors?: string[]
  supports?: string[]
}

export interface PlatformsValidationSummary {
  isValid: boolean
  results: PlatformValidationResult[]
}

export interface UrlValidationResult {
  valid: boolean
  reachable: boolean
  url?: string
  error?: string
}

// Deliberately empty default map: no platform hardcoding here.
export const PLATFORM_RULES: PlatformRules = {}

export function validateEventData(eventData: Record<string, unknown>): EventValidationResult {
  const errors: string[] = []
  const requiredFields = ['eventTitle', 'eventDate', 'venue', 'city']

  for (const field of requiredFields) {
    const value = eventData[field]
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`Missing required field: ${field}`)
    }
  }

  const eventDate = eventData.eventDate
  if (typeof eventDate === 'string' && eventDate.trim()) {
    const date = new Date(eventDate)
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format')
    }
  }

  const eventTime = eventData.eventTime
  if (typeof eventTime === 'string' && eventTime.trim()) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(eventTime)) {
      errors.push('Invalid time format (use HH:MM)')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validatePlatforms(
  platformContent: Record<string, unknown>,
  selectedPlatforms: Record<string, boolean> | null | undefined
): PlatformsValidationSummary {
  const results: PlatformValidationResult[] = []
  let hasErrors = false

  for (const [platform, enabled] of Object.entries(selectedPlatforms || {})) {
    if (!enabled) {
      continue
    }

    const rules = PLATFORM_RULES[platform]
    if (!rules) {
      // No configured rules means no frontend-side strict validation for this platform.
      results.push({ platform, valid: true, supports: [] })
      continue
    }

    const content = platformContent[platform] as Record<string, unknown> | undefined
    const errors: string[] = []

    for (const field of rules.required) {
      const topLevelValue = platformContent[field]
      const nestedValue = content?.[field]
      const value = topLevelValue ?? nestedValue
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`Missing required field: ${field}`)
      }
    }

    if (
      rules.maxLength &&
      content &&
      typeof content.text === 'string' &&
      content.text.length > rules.maxLength
    ) {
      errors.push(`Content too long: ${content.text.length} > ${rules.maxLength} characters`)
    }

    if (errors.length > 0) {
      hasErrors = true
      results.push({ platform, valid: false, errors })
    } else {
      results.push({ platform, valid: true, supports: rules.supports })
    }
  }

  return {
    isValid: !hasErrors,
    results
  }
}

export function validateUrl(url?: string | null): UrlValidationResult {
  if (!url) {
    return { valid: true, reachable: false }
  }

  try {
    new URL(url)
    return { valid: true, reachable: false, url }
  } catch {
    return { valid: false, reachable: false, error: 'Invalid URL format', url }
  }
}

export function formatDateForDisplay(dateString: string, timeString: string | null = null): string {
  try {
    const date = timeString ? new Date(`${dateString}T${timeString}`) : new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

export function getPlatformRequirements(platform: string): PlatformRule | null {
  return PLATFORM_RULES[platform] || null
}
