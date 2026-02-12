/**
 * Target and Group Schema Definitions
 * Defines the structure for platform targets (recipients, subreddits, users, etc.) and groups.
 */

import { FieldDefinition, ValidationRule } from './primitives.js';

/**
 * Target Schema Definition
 * Defines the structure for platform targets (recipients, subreddits, users, etc.)
 */
export interface TargetSchema {
  /** Base field name (e.g., 'email', 'subreddit', 'username') */
  baseField: string;
  /** Base field label */
  baseFieldLabel: string;
  /** Base field validation rules */
  baseFieldValidation?: ValidationRule[];
  /** Additional custom fields for personalization */
  customFields?: FieldDefinition[];
  /** Whether targets can be grouped */
  supportsGroups?: boolean;
}

/**
 * Target Object Structure
 */
export interface Target {
  /** Unique target identifier */
  id: string;
  /** Target type (e.g., 'subreddit', 'user', 'email') - required for multi-target platforms */
  targetType?: string;
  /** Metadata (optional additional data) */
  metadata?: Record<string, any>;
  /** Timestamps */
  createdAt?: string;
  updatedAt?: string;
  /** Base field value and custom fields (index signature for dynamic properties) */
  [key: string]: any;
}

/**
 * Group Object Structure
 * Groups have UUIDs like targets for consistency
 */
export interface Group {
  /** Unique group identifier (UUID) */
  id: string;
  /** Group name (display name) */
  name: string;
  /** Array of target IDs in this group */
  targetIds: string[];
  /** Number of members in this group (calculated backend) */
  memberCount?: number;
  /** Timestamps */
  createdAt?: string;
  updatedAt?: string;
  /** Optional metadata */
  metadata?: Record<string, any>;
}
