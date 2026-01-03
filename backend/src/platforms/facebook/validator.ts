// Facebook-specific validation

import { FacebookContent, FacebookValidation } from './types.js'

export class FacebookValidator {
  private static readonly MAX_LENGTH = 63206

  static validateContent(content: FacebookContent): FacebookValidation {
    const errors: string[] = []
    let characterCount = content.text?.length || 0

    // Required fields
    if (!content.text || content.text.trim().length === 0) {
      errors.push('Post text is required')
    }

    // Length validation
    if (characterCount > this.MAX_LENGTH) {
      errors.push(`Post too long: ${characterCount}/${this.MAX_LENGTH} characters`)
    }

    // URL validation if link is provided
    if (content.link) {
      try {
        new URL(content.link)
      } catch {
        errors.push('Invalid link URL format')
      }
    }

    const warnings: string[] = []

    // Add warnings for optimization
    if (characterCount < 50) {
      warnings.push('Post is quite short - consider adding more content for better engagement')
    }

    if (!content.link) {
      warnings.push('Consider adding a link to drive traffic')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      characterCount,
      maxLength: this.MAX_LENGTH
    }
  }

  static getCharacterCount(content: FacebookContent): number {
    return content.text?.length || 0
  }

  static getRemainingChars(content: FacebookContent): number {
    return this.MAX_LENGTH - this.getCharacterCount(content)
  }
}
