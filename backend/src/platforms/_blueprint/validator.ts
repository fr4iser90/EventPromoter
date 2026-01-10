/**
 * PLATFORM_ID Validator
 * 
 * Validates content according to platform constraints.
 * 
 * @module platforms/PLATFORM_ID/validator
 */

import { ContentValidator, ValidationResult, ContentLimits } from '../../types/index.js'

export class PLATFORM_IDValidator implements ContentValidator {
  /**
   * Validate content
   */
  validate(content: any): ValidationResult {
    const errors: string[] = []

    if (!content.text || content.text.length === 0) {
      errors.push('Content text is required')
    }

    if (content.text && content.text.length > 1000) {
      errors.push('Content must be at most 1000 characters')
    }

    if (content.images && content.images.length > 5) {
      errors.push('Maximum 5 images allowed')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate content (static method for compatibility)
   */
  static validateContent(content: any): ValidationResult {
    const validator = new PLATFORM_IDValidator()
    return validator.validate(content)
  }

  /**
   * Get platform content limits
   */
  getLimits(): ContentLimits {
    return {
      maxLength: 1000,
      maxImages: 5,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif']
    }
  }
}

export default new PLATFORM_IDValidator()

