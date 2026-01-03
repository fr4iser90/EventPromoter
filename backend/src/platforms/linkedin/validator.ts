// LinkedIn-specific validation

import { LinkedInContent, LinkedInValidation } from './types.js'

export class LinkedInValidator {
  private static readonly MAX_LENGTH = 3000

  static validateContent(content: LinkedInContent): LinkedInValidation {
    const errors: string[] = []
    const characterCount = content.text?.length || 0

    // Required fields
    if (!content.text || content.text.trim().length === 0) {
      errors.push('Post text is required')
    }

    // Length validation
    if (characterCount > this.MAX_LENGTH) {
      errors.push(`Post too long: ${characterCount}/${this.MAX_LENGTH} characters`)
    }

    const warnings: string[] = []

    // Add warnings for optimization
    if (characterCount < 100) {
      warnings.push('Post is quite short - LinkedIn posts with 100+ characters perform better')
    }

    if (!content.text.includes('?') && !content.text.includes('!')) {
      warnings.push('Consider ending with a question or call-to-action for better engagement')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      characterCount,
      maxLength: this.MAX_LENGTH
    }
  }
}
