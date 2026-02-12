/**
 * Event Data Schema Type Definitions
 * 
 * Schema system for extensible event data fields (Ticket-Info, Contact-Info, Social Media, etc.)
 * Similar to EditorSchema but for parsed event data structure.
 * 
 * @module types/schema/eventData
 */

import { FieldType, ValidationRule } from './primitives.js'

/**
 * Event Data Field Definition
 * Defines a single field within an event data group
 */
export interface EventDataField {
  /** Field identifier (used as key in data object) */
  id: string
  /** Field type */
  type: FieldType | 'group' // 'group' for nested field groups
  /** Field label */
  label: string
  /** Field description/help text */
  description?: string
  /** Placeholder text */
  placeholder?: string
  /** Default value */
  default?: any
  /** Whether field is required */
  required?: boolean
  /** Validation rules */
  validation?: ValidationRule[]
  /** Field options (for select, multiselect) */
  options?: Array<{ label: string; value: any }>
  /** Nested fields (for 'group' type) */
  fields?: EventDataField[]
  /** UI hints */
  ui?: {
    /** Field width (1-12 grid system) */
    width?: number
    /** Custom CSS class */
    className?: string
  }
}

/**
 * Event Data Group Definition
 * Groups related fields together (e.g., Ticket-Info, Contact-Info)
 */
export interface EventDataGroup {
  /** Group identifier (used as key in extendedData object) */
  id: string
  /** Group label */
  label: string
  /** Group description */
  description?: string
  /** Icon emoji or identifier */
  icon?: string
  /** Whether group can be collapsed */
  collapsible?: boolean
  /** Whether group is expanded by default */
  defaultExpanded?: boolean
  /** Fields in this group */
  fields: EventDataField[]
  /** Template variable prefix (e.g., "ticket" → {ticketPresalePrice}) */
  variablePrefix?: string
  /** Whether to show group even if empty */
  showWhenEmpty?: boolean
}

/**
 * Event Data Schema
 * Complete schema definition for extensible event data
 */
export interface EventDataSchema {
  /** Schema version */
  version: string
  /** Field groups */
  groups: EventDataGroup[]
  /** Global fields (not in any group, shown at top level) */
  globalFields?: EventDataField[]
}
