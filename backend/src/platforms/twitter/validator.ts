// Twitter-specific validation

import { TwitterContent, TwitterValidation } from './types.js'

export class TwitterValidator {
  private static readonly MAX_LENGTH = 280
  private static readonly URL_LENGTH = 23 // Twitter shortens URLs to 23 chars

  static validateContent(content: TwitterContent): TwitterValidation {
    const errors: string[] = []
    const warnings: string[] = []
    let characterCount = content.text?.length || 0

    // Check required fields
    if (!content.text || content.text.trim().length === 0) {
      errors.push('Tweet text is required')
    }

    // Check length (accounting for URL shortening)
    if (content.link) {
      // URLs count as 23 characters
      characterCount += this.URL_LENGTH + 1 // +1 for space
    }

    if (characterCount > this.MAX_LENGTH) {
      errors.push(`Tweet too long: ${characterCount}/${this.MAX_LENGTH} characters`)
    }

    // Check for mentions (must be valid Twitter handles)
    const mentions = content.text.match(/@\w+/g) || []
    for (const mention of mentions) {
      if (mention.length > 15) { // Twitter handles max 15 chars
        errors.push(`Invalid mention: ${mention} (too long)`)
      }
    }

    // Check for hashtags (optional validation)
    const hashtags = content.text.match(/#\w+/g) || []
    for (const hashtag of hashtags) {
      if (hashtag.length > 100) { // Reasonable limit
        errors.push(`Hashtag too long: ${hashtag}`)
      }
    }

    // Add warnings for optimization
    if (characterCount < 50) {
      warnings.push('Tweet is quite short - consider adding more content')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      characterCount,
      maxLength: this.MAX_LENGTH
    }
  }

  static getCharacterCount(content: TwitterContent): number {
    let count = content.text?.length || 0
    if (content.link) {
      count += this.URL_LENGTH + 1
    }
    return count
  }

  static getRemainingChars(content: TwitterContent): number {
    return this.MAX_LENGTH - this.getCharacterCount(content)
  }
}
