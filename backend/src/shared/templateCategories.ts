/**
 * Template Categories - Domain-Level Concept
 * 
 * Categories represent the business intent / domain concept, not platform-specific details.
 * They are shared across platforms but can be extended platform-specifically.
 * 
 * @module shared/templateCategories
 */

/**
 * Global template categories (shared across all platforms)
 */
export const TEMPLATE_CATEGORIES = {
  ANNOUNCEMENT: 'announcement',
  REMINDER: 'reminder',
  URGENT: 'urgent',
  INVITATION: 'invitation',
  FOLLOW_UP: 'follow-up',
  PROMOTION: 'promotion',
  WELCOME: 'welcome',
  THANK_YOU: 'thank-you',
  MUSIC: 'music',
  DISCUSSION: 'discussion',
  EVENT: 'event',
  REVIEW: 'review',
  AFTERPARTY: 'afterparty',
  GENERAL: 'general'
} as const

/**
 * Template category type
 */
export type TemplateCategory =
  typeof TEMPLATE_CATEGORIES[keyof typeof TEMPLATE_CATEGORIES]

/**
 * Global categories registry (for validation)
 */
export const GLOBAL_CATEGORIES: Record<string, boolean> = {
  [TEMPLATE_CATEGORIES.ANNOUNCEMENT]: true,
  [TEMPLATE_CATEGORIES.REMINDER]: true,
  [TEMPLATE_CATEGORIES.URGENT]: true,
  [TEMPLATE_CATEGORIES.INVITATION]: true,
  [TEMPLATE_CATEGORIES.FOLLOW_UP]: true,
  [TEMPLATE_CATEGORIES.PROMOTION]: true,
  [TEMPLATE_CATEGORIES.WELCOME]: true,
  [TEMPLATE_CATEGORIES.THANK_YOU]: true,
  [TEMPLATE_CATEGORIES.MUSIC]: true,
  [TEMPLATE_CATEGORIES.DISCUSSION]: true,
  [TEMPLATE_CATEGORIES.EVENT]: true,
  [TEMPLATE_CATEGORIES.REVIEW]: true,
  [TEMPLATE_CATEGORIES.AFTERPARTY]: true,
  [TEMPLATE_CATEGORIES.GENERAL]: true
}

/**
 * Optional category metadata (for future use)
 */
export const CATEGORY_META: Record<string, { priority?: number; description?: string }> = {
  [TEMPLATE_CATEGORIES.ANNOUNCEMENT]: { priority: 1 },
  [TEMPLATE_CATEGORIES.REMINDER]: { priority: 2 },
  [TEMPLATE_CATEGORIES.URGENT]: { priority: 3 },
  [TEMPLATE_CATEGORIES.INVITATION]: { priority: 1 },
  [TEMPLATE_CATEGORIES.FOLLOW_UP]: { priority: 4 }
}

/**
 * Validate if a category is valid (global or platform-specific)
 */
export function isValidCategory(
  category: string,
  platformCategories?: Record<string, boolean>
): boolean {
  if (GLOBAL_CATEGORIES[category]) {
    return true
  }
  return platformCategories?.[category] === true
}
