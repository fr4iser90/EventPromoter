// Validation service for business logic validation

import { ValidationResult, PlatformValidation } from '../types/index.js'
import { PlatformManager } from './platformManager.js'

export class ValidationService {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validateEventData(eventData: any): { isValid: boolean, errors: string[] } {
    const errors: string[] = []

    const requiredFields = ['eventTitle', 'eventDate', 'venue', 'city']
    for (const field of requiredFields) {
      if (!eventData[field] || eventData[field].trim() === '') {
        errors.push(`Missing required field: ${field}`)
      }
    }

    if (eventData.eventDate) {
      const date = new Date(eventData.eventDate)
      if (isNaN(date.getTime())) {
        errors.push('Invalid date format')
      }
    }

    if (eventData.eventTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(eventData.eventTime)) {
        errors.push('Invalid time format (use HH:MM)')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validatePlatforms(platformContent: any, selectedPlatforms: string[]): ValidationResult {
    const validationResults: PlatformValidation[] = []
    let hasErrors = false

    for (const platform of selectedPlatforms) {
      try {
        // Use platform-specific validation if available
        if (PlatformManager.isPlatformSupported(platform)) {
          const validation = PlatformManager.validateContent(platform, platformContent[platform])
          if (validation.isValid) {
            validationResults.push({
              platform,
              valid: true,
              supports: PlatformManager.getPlatformRequirements(platform).supports
            })
          } else {
            validationResults.push({
              platform,
              valid: false,
              errors: validation.errors
            })
            hasErrors = true
          }
        } else {
          // Fallback validation for unsupported platforms
          validationResults.push({
            platform,
            valid: false,
            errors: [`Platform '${platform}' not fully supported yet`]
          })
          hasErrors = true
        }
        } catch (error: any) {
          validationResults.push({
            platform,
            valid: false,
            errors: [`Validation error for ${platform}: ${error.message}`]
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

    if (!files || files.length === 0) {
      errors.push('At least one file is required')
      return { isValid: false, errors }
    }

    // Check file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024 // 10MB
    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(`File ${file.name} is too large (${Math.round(file.size / 1024 / 1024)}MB > 10MB)`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static getPlatformRequirements(platform: string): any {
    return PlatformManager.getPlatformRequirements(platform)
  }
}
