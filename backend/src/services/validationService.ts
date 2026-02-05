// ✅ GENERIC: Validation service for business logic validation
// Uses PlatformRegistry instead of hardcoded PlatformManager

import { PlatformValidationResult, PlatformValidation } from '../types/index.js'
import { PlatformManager } from './platformManager.js'
import i18next from 'i18next'

export class ValidationService {
  static validateEventData(eventData: any): { isValid: boolean, errors: string[] } {
    const errors: string[] = []
    const t = i18next.t.bind(i18next)

    // Use ONLY ParsedEventData format: title, date (NO legacy eventTitle/eventDate)
    const requiredFields = ['title', 'date', 'venue', 'city']
    for (const field of requiredFields) {
      if (!eventData[field] || (typeof eventData[field] === 'string' && eventData[field].trim().length === 0)) {
        errors.push(t('errors:missing_required_field', { field }))
      }
    }

    // Validate date format
    if (eventData.date) {
      const dateObj = new Date(eventData.date)
      if (isNaN(dateObj.getTime())) {
        errors.push(t('errors:invalid_date_format'))
      }
    }

    // Validate time format (if provided)
    if (eventData.time) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(eventData.time)) {
        errors.push(t('errors:invalid_time_format'))
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static async validatePlatforms(platformContent: any, selectedPlatforms: string[]): Promise<PlatformValidationResult> {
    const validationResults: PlatformValidation[] = []
    let hasErrors = false
    const t = i18next.t.bind(i18next)

    for (const platform of selectedPlatforms) {
      try {
        // Use platform-specific validation
        const isSupported = await PlatformManager.isPlatformSupported(platform)
        if (!isSupported) {
          validationResults.push({
            platform,
            valid: false,
            errors: [t('errors:platform_not_found', { platform })]
          })
          hasErrors = true
          continue
        }

        const validation = await PlatformManager.validateContent(platform, platformContent[platform])
        const requirements = await PlatformManager.getPlatformRequirements(platform)
        if (validation.isValid) {
          validationResults.push({
            platform,
            valid: true,
            supports: requirements.supports
          })
        } else {
          validationResults.push({
            platform,
            valid: false,
            errors: validation.errors
          })
          hasErrors = true
        }
      } catch (error: any) {
        validationResults.push({
          platform,
          valid: false,
          errors: [t('errors:validation_error', { platform, message: error.message })]
        })
        hasErrors = true
      }
    }

    return {
      isValid: !hasErrors,
      results: validationResults
    }
  }

  static validateFiles(files: any[]): { isValid: boolean, errors: string[] } {
    const errors: string[] = []
    const t = i18next.t.bind(i18next)

    if (!files || files.length === 0) {
      errors.push(t('errors:at_least_one_file'))
      return { isValid: false, errors }
    }

    // Check file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024 // 10MB
    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(t('errors:file_too_large', { 
          name: file.name, 
          size: Math.round(file.size / 1024 / 1024) 
        }))
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static async getPlatformRequirements(platform: string): Promise<any> {
    return await PlatformManager.getPlatformRequirements(platform)
  }
}
