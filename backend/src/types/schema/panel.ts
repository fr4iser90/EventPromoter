/**
 * Panel Schema Definition
 * Defines the platform feature panel structure.
 */

import { FieldDefinition } from './primitives.js';
import { TargetSchema } from './targets.js';

/**
 * Panel section definition
 * Defines a section within a platform panel
 * Uses schema-driven fields (like SettingsSchema) instead of hardcoded components
 */
export interface PanelSection {
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
 * Panel schema
 * Defines the platform feature panel structure (NOT settings/credentials)
 */
export interface PanelSchema {
  /** Unique schema identifier */
  id: string;
  /** Schema version */
  version: string;
  /** Panel title */
  title: string;
  /** Panel description */
  description?: string;
  /** Panel sections */
  sections: PanelSection[];
  /** Panel tabs (optional) */
  tabs?: Array<{
    id: string;
    label: string;
    sections: string[]; // Section IDs in this tab
  }>;
  // ✅ NEW: Target Schema for target management
  /** Target schema for managing platform targets (recipients, subreddits, etc.) */
  targetSchema?: TargetSchema;
}
