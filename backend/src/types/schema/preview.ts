/**
 * Preview Schema Type Definitions
 *
 * Defines the structure for content previews, including modes and layout slots.
 *
 * @module types/schema/preview
 */

/**
 * Preview mode types
 */
export type PreviewMode =
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'feed'
  | 'story'
  | 'post'
  | 'custom'

/**
 * Preview Slot Definition
 * Defines a layout slot where content should be placed
 * Schema defines LAYOUT, not rendering - Renderer handles how to render
 */
export interface PreviewSlot {
  /** Slot identifier (e.g., 'header', 'hero', 'body', 'footer') */
  slot: string
  /** Content field name (from editor blocks) to fill this slot */
  field: string
  /** Display order */
  order?: number
  /** Optional: Field fallback chain (try first field, then fallback to second, etc.) */
  fallback?: string[]
  /** Optional: Conditional rendering (only show if condition is met) */
  condition?: {
    field: string
    operator: 'exists' | 'notEmpty' | 'equals' | 'notEquals'
    value?: any
  }
}

/**
 * Preview schema
 * Defines LAYOUT (slots) and MODES, not rendering details
 * Renderer (platform service) handles actual HTML generation
 */
export interface PreviewSchema {
  /** Schema version */
  version: string
  /** Schema title */
  title: string
  /** Schema description */
  description?: string
  /** Default preview mode */
  defaultMode: PreviewMode
  /** Available preview modes */
  modes: Array<{
    id: PreviewMode
    label: string
    description?: string
    width?: number
    height?: number
    aspectRatio?: string
    /** Optional: Client-specific mode (e.g., 'gmail', 'outlook' for email) */
    client?: string
  }>
  /** Layout slots - defines WHERE content goes, not HOW it's rendered */
  slots: PreviewSlot[]
  /** Preview options */
  options?: {
    /** Show metadata */
    showMetadata?: boolean
    /** Show engagement metrics */
    showMetrics?: boolean
    /** Show timestamp */
    showTimestamp?: boolean
    /** Enable interactive preview */
    interactive?: boolean
  }
  /** Preview styling tokens (resolved by backend based on darkMode) */
  styling?: {
    /** Background color token */
    backgroundColor?: string
    /** Text color token */
    textColor?: string
    /** Font family (concrete value, not token) */
    fontFamily?: string
  }
  /** Legacy: contentMapping (deprecated, use slots instead) */
  contentMapping?: Array<{
    field: string
    renderAs?: string
    label?: string
    className?: string
    show?: boolean
    order?: number
    component?: string
  }>
}