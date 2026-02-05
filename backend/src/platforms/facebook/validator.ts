// Facebook-specific validation

import { FacebookContent, FacebookValidation } from './types.js'
import i18next from 'i18next'

export class FacebookValidator {
  private static readonly MAX_LENGTH = 63206

  static validateContent(content: FacebookContent): FacebookValidation {
    const errors: string[] = []
    let characterCount = content.text?.length || 0
    const t = i18next.t.bind(i18next)

    // Required fields
    if (!content.text || content.text.trim().length === 0) {
      errors.push(t('facebook:errors.text_required'))
    }

    // Length validation
    if (characterCount > this.MAX_LENGTH) {
      errors.push(t('facebook:errors.post_too_long', { count: characterCount, max: this.MAX_LENGTH }))
    }

    // URL validation if link is provided
    if (content.link) {
      try {
        new URL(content.link)
      } catch {
        errors.push(t('facebook:errors.invalid_link'))
      }
    }

    const warnings: string[] = []

    // Add warnings for optimization
    if (characterCount < 50) {
      warnings.push(t('facebook:warnings.post_short'))
    }

    if (!content.link) {
      warnings.push(t('facebook:warnings.no_link'))
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
