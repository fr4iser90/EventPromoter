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

    // ✅ GENERIC: Validate that AT LEAST ONE target type is present (subreddits OR users)
    const hasSubreddits = content.subreddits && content.subreddits.mode
    const hasUsers = content.users && content.users.mode
    
    if (!hasSubreddits && !hasUsers) {
      errors.push('At least one target configuration is required (subreddits or users)')
    } else {
      // Validate subreddits if present
      if (hasSubreddits) {
        const targets = content.subreddits!
        if (!targets.mode) {
          errors.push('Subreddits mode is required')
        } else if (targets.mode === 'individual' && (!targets.individual || !Array.isArray(targets.individual) || targets.individual.length === 0)) {
          errors.push('Individual subreddits array is required when mode is "individual"')
        } else if (targets.mode === 'groups' && (!targets.groups || !Array.isArray(targets.groups) || targets.groups.length === 0)) {
          errors.push('Groups array is required when mode is "groups"')
        }
      }
      
      // Validate users if present
      if (hasUsers) {
        const targets = content.users!
        if (!targets.mode) {
          errors.push('Users mode is required')
        } else if (targets.mode === 'individual' && (!targets.individual || !Array.isArray(targets.individual) || targets.individual.length === 0)) {
          errors.push('Individual users array is required when mode is "individual"')
        } else if (targets.mode === 'groups' && (!targets.groups || !Array.isArray(targets.groups) || targets.groups.length === 0)) {
          errors.push('Groups array is required when mode is "groups"')
        }
      }
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

    const warnings: string[] = []

    // Add warnings for optimization
    if ((content.title?.length || 0) < 20) {
      warnings.push('Title is quite short - Reddit titles with 20+ characters perform better')
    }

    if (!content.text || content.text.length < 50) {
      warnings.push('Post text is quite short - consider providing more detailed content')
    }

    if (content.title && !content.title.includes('?') && !content.title.includes('!') && !content.title.includes('[')) {
      warnings.push('Consider making your title more engaging with questions, brackets, or excitement')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
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
