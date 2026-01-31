/**
 * Settings Schema Definition
 * Defines the platform feature settings structure (formerly Panel).
 */

import { FieldDefinition } from './primitives.js';
import { TargetSchema } from './targets.js';

/**
 * Settings section definition
 * Defines a section within a platform settings modal
 */
export interface SettingsSection {
  /** Section identifier */
  id: string;
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Fields to render in this section (schema-driven, rendered by SchemaRenderer) */
  fields: FieldDefinition[];
  /** Whether section is required */
  required?: boolean;
  /** Section order */
  order?: number;
}

/**
 * Settings schema
 * Defines the platform feature settings structure (NOT credentials)
 */
export interface SettingsSchema {
  /** Unique schema identifier */
  id: string;
  /** Schema version */
  version: string;
  /** Settings title */
  title: string;
  /** Settings description */
  description?: string;
  /** Settings sections */
  sections: SettingsSection[];
  /** Settings tabs (optional) */
  tabs?: Array<{
    id: string;
    label: string;
    sections: string[]; // Section IDs in this tab
  }>;
  /** Target schema for managing platform targets (recipients, subreddits, etc.) */
  targetSchema?: TargetSchema;
}
