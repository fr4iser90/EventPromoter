// Instagram-specific validation

import { InstagramContent, InstagramValidation } from './types.js'

export class InstagramValidator {
  private static readonly MAX_CAPTION_LENGTH = 2200

  static validateContent(content: InstagramContent): InstagramValidation {
    const errors: string[] = []
    const captionLength = content.caption?.length || 0

    // Required fields
    if (!content.caption || content.caption.trim().length === 0) {
      errors.push('Caption is required')
    }

    // Length validation
    if (captionLength > this.MAX_CAPTION_LENGTH) {
      errors.push(`Caption too long: ${captionLength}/${this.MAX_CAPTION_LENGTH} characters`)
    }

    const warnings: string[] = []

    // Add warnings for optimization
    if (captionLength < 30) {
      warnings.push('Caption is quite short - Instagram captions with 125+ characters get more engagement')
    }

    if (!content.caption.includes('#')) {
      warnings.push('Consider adding relevant hashtags for better discoverability')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      captionLength,
      maxLength: this.MAX_CAPTION_LENGTH
    }
  }
}
