import { BaseTargetService } from '../../../services/targetService.js'
import { Target, Group, TargetSchema } from '@/types/schema/index.js'
import { redditSettingsSchema } from '../schema/settings.js' // Import the settings schema

/**
 * Reddit Target Service
 * 
 * This service provides target management for the Reddit platform.
 * It extends the BaseTargetService to provide platform-specific implementations
 * for fetching and managing targets (e.g., subreddits, users).
 * 
 * Supports multiple target types: 'subreddit' and 'user'
 */
export class RedditTargetService extends BaseTargetService {
  constructor() {
    const targetSchemas = redditSettingsSchema.targetSchemas!;
    super('reddit', targetSchemas)
  }

  /**
   * Validate the base field value for Reddit targets.
   * @param value The value to validate.
   * @param type Optional target type ('subreddit' or 'user')
   * @returns True if the value is valid, false otherwise.
   */
  validateBaseField(value: string, type?: string): boolean {
    const schema = this.getTargetSchema(type);
    
    // Implement validation based on schema.baseFieldValidation rules
    for (const rule of schema.baseFieldValidation || []) {
      if (rule.type === 'required' && (!value || value.trim() === '')) {
        return false
      }
      if (rule.type === 'pattern' && typeof value === 'string' && !new RegExp(rule.value as string).test(value)) {
        return false
      }
    }
    return true
  }

  protected normalizeBaseField(value: string): string {
    return value.trim().toLowerCase()
  }
}