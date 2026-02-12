/**
 * Template Schema Definition
 * Defines template structure and variables for a platform.
 */

import { ValidationRule } from './primitives.js';

export type TemplateVariableSource =
  | 'parsed'
  | 'parsed_optional'
  | 'manual'
  | 'target'
  | 'computed';

export interface TemplateVariableDefinition {
  /** Variable key that appears in template placeholders, e.g. "eventTitle" */
  name: string;
  /** Canonical key used for UI deduplication and normalization, e.g. "title" */
  canonicalName?: string;
  /** Optional alias keys belonging to same semantic variable */
  aliases?: string[];
  /** Variable label (human readable or i18n key) */
  label: string;
  /** Variable description */
  description?: string;
  /** Variable type */
  type?: 'string' | 'date' | 'number' | 'url' | 'image';
  /** Where this value usually comes from */
  source?: TemplateVariableSource;
  /** Parsed data field name if source is parsed/parsed_optional */
  parsedField?: string;
  /** Whether user can edit/override the value manually in editor */
  editable?: boolean;
  /** If true, keep variable visible in editor even when value is empty */
  showWhenEmpty?: boolean;
  /** Optional icon identifier for UI */
  icon?: string;
  /** Default value if not available */
  defaultValue?: string;
}

export interface TemplateSchema {
  /** Schema version */
  version: string;
  /** Template title */
  title: string;
  /** Template description */
  description?: string;
  /** Default template structure (fields that templates should have) */
  defaultStructure: Record<string, {
    /** Field label */
    label: string;
    /** Field type */
    type: 'text' | 'textarea' | 'html' | 'rich';
    /** Default value (with variable placeholders) */
    default?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Whether field is required */
    required?: boolean;
    /** Field description */
    description?: string;
  }>;
  /** Available template variables (from event data) */
  variables?: TemplateVariableDefinition[];
  /**
   * Canonical variable registry for editor/preview rendering.
   * If present, frontend should prefer this over hardcoded mappings.
   */
  variableDefinitions?: TemplateVariableDefinition[];
  /** Template categories */
  categories?: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  /** Template validation rules */
  validation?: {
    /** Required fields */
    requiredFields?: string[];
    /** Variable pattern (e.g., /\{[^}]+\}/) */
    variablePattern?: string;
  };
}
