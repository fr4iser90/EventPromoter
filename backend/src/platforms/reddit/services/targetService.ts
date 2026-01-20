/**
 * Reddit Target Service
 * 
 * Platform-specific target service for Reddit subreddits.
 * Extends BaseTargetService with subreddit-specific validation.
 * 
 * @module platforms/reddit/services/targetService
 */

import { BaseTargetService } from '../../../services/targetService.js'
import { TargetSchema } from '../../../types/platformSchema.js'

export class RedditTargetService extends BaseTargetService {
  constructor() {
    const targetSchema: TargetSchema = {
      baseField: 'subreddit',
      baseFieldLabel: 'Subreddit Name',
      baseFieldValidation: [
        { type: 'pattern', value: '^[a-z0-9_]{3,21}$', message: 'Invalid subreddit name' }
      ],
      customFields: [
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung',
          required: false,
          validation: [
            { type: 'maxLength', value: 500, message: 'Description must be at most 500 characters' }
          ],
          ui: { width: 12, order: 1 }
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags',
          required: false,
          options: [],
          ui: { width: 12, order: 2 }
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'Aktiv',
          required: false,
          default: true,
          ui: { width: 6, order: 3 }
        }
      ],
      supportsGroups: true
    }

    super('reddit', targetSchema)
    this.dataFileName = 'targets.json'
  }

  getBaseField(): string {
    return 'subreddit'
  }

  validateBaseField(subreddit: string): boolean {
    return /^[a-z0-9_]{3,21}$/.test(subreddit.toLowerCase())
  }

  protected normalizeBaseField(value: string): string {
    // Remove r/ prefix if present, convert to lowercase
    return value.trim().toLowerCase().replace(/^r\//, '').replace(/^\//, '')
  }
}
