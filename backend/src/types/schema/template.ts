/**
 * Template Schema Definition
 * Defines template structure and variables for a platform.
 */

import { ValidationRule } from './primitives.js';

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
  variables?: Array<{
    /** Variable name (e.g., 'eventTitle') */
    name: string;
    /** Variable label */
    label: string;
    /** Variable description */
    description?: string;
    /** Variable type */
    type?: 'string' | 'date' | 'number' | 'url' | 'image';
    /** Default value if not available */
    defaultValue?: string;
  }>;
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
