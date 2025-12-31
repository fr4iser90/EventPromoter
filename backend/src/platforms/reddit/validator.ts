// Reddit-specific validation

import { RedditContent, RedditValidation } from './types.js'

export class RedditValidator {
  private static readonly MAX_TITLE_LENGTH = 300
  private static readonly MIN_TITLE_LENGTH = 10
  private static readonly MAX_SUBREDDIT_LENGTH = 21 // r/ + 21 chars

  static validateContent(content: RedditContent): RedditValidation {
    const errors: string[] = []

    // Required fields
    if (!content.title || content.title.trim().length === 0) {
      errors.push('Post title is required')
    }

    if (!content.subreddit || content.subreddit.trim().length === 0) {
      errors.push('Subreddit is required')
    }

    if (!content.text || content.text.trim().length === 0) {
      errors.push('Post text is required')
    }

    // Title validation
    if (content.title) {
      const titleLength = content.title.length

      if (titleLength < this.MIN_TITLE_LENGTH) {
        errors.push(`Title too short: ${titleLength}/${this.MIN_TITLE_LENGTH} characters minimum`)
      }

      if (titleLength > this.MAX_TITLE_LENGTH) {
        errors.push(`Title too long: ${titleLength}/${this.MAX_TITLE_LENGTH} characters maximum`)
      }

      // Check for clickbait patterns (optional warning)
      const clickbaitWords = ['SHOCKING', 'UNBELIEVABLE', 'MUST SEE', 'YOU WON\'T BELIEVE']
      const upperCaseRatio = (content.title.match(/[A-Z]/g) || []).length / titleLength

      if (upperCaseRatio > 0.5) {
        errors.push('Title appears to be in ALL CAPS - consider proper capitalization')
      }
    }

    // Subreddit validation
    if (content.subreddit) {
      const subreddit = content.subreddit.trim()

      // Remove r/ prefix if present for validation
      const cleanSubreddit = subreddit.startsWith('r/') ? subreddit.slice(2) : subreddit

      if (cleanSubreddit.length === 0) {
        errors.push('Subreddit name cannot be empty')
      } else if (cleanSubreddit.length > 21) {
        errors.push(`Subreddit name too long: ${cleanSubreddit.length}/21 characters`)
      }

      // Check for valid characters (letters, numbers, underscores)
      if (!/^[a-zA-Z0-9_]+$/.test(cleanSubreddit)) {
        errors.push('Subreddit name can only contain letters, numbers, and underscores')
      }

      // Reserved subreddits
      const reservedSubs = ['all', 'popular', 'home', 'mod']
      if (reservedSubs.includes(cleanSubreddit.toLowerCase())) {
        errors.push(`'${cleanSubreddit}' is a reserved subreddit name`)
      }
    }

    // Content validation
    if (content.text) {
      // Check for excessive caps
      const upperCaseRatio = (content.text.match(/[A-Z]/g) || []).length / content.text.length
      if (upperCaseRatio > 0.7) {
        errors.push('Post text appears to be mostly in ALL CAPS')
      }

      // Check for minimum content
      if (content.text.trim().length < 50) {
        errors.push('Post text is quite short - consider adding more details for better engagement')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      titleLength: content.title?.length || 0,
      textLength: content.text?.length || 0,
      maxTitleLength: this.MAX_TITLE_LENGTH
    }
  }

  static formatSubreddit(subreddit: string): string {
    const clean = subreddit.trim()
    return clean.startsWith('r/') ? clean : `r/${clean}`
  }

  static getSubredditUrl(subreddit: string): string {
    return `https://reddit.com/${this.formatSubreddit(subreddit)}`
  }
}
