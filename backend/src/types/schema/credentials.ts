/**
 * Credentials Schema Definition
 * Defines the form structure for platform credentials/API configuration.
 */

import { FieldDefinition, ValidationRule } from './primitives.js';

export interface CredentialsSchema {
  /** Schema version */
  version: string;
  /** Schema title */
  title: string;
  /** Schema description */
  description?: string;
  /** Form fields */
  fields: FieldDefinition[];
  /** Field groups/sections */
  groups?: Array<{
    id: string;
    title: string;
    description?: string;
    fields: string[]; // Field names in this group
    collapsible?: boolean;
    collapsed?: boolean;
  }>;
  /** Form-level validation */
  validate?: (data: Record<string, any>) => { isValid: boolean; errors: Record<string, string[]> };
  // ✅ NEW: Environment Variable Mapping
  /** Map field names to environment variable names */
  envMapping?: {
    [fieldName: string]: string | {
      envVar: string;
      required?: boolean;
      default?: string;
      transform?: (value: string) => any;
    };
  };
  // ✅ NEW: Settings Categories
  /** Settings categories for better organization */
  categories?: Array<{
    id: string;
    label: string;
    description?: string;
    fields: string[]; // Field names in this category
    icon?: string;
    order?: number;
  }>;
  // ✅ NEW: Settings Transformation
  /** Transform settings before saving or after loading */
  transform?: {
    /** Transform settings before saving */
    beforeSave?: (settings: Record<string, any>) => Record<string, any>;
    /** Transform settings after loading */
    afterLoad?: (settings: Record<string, any>) => Record<string, any>;
  };
  // ✅ NEW: Settings Dependencies
  /** Field dependencies (e.g., show field only when another field has specific value) */
  dependencies?: Array<{
    field: string;
    dependsOn: string;
    condition: 'equals' | 'notEquals' | 'exists' | 'notExists';
    value?: any;
  }>;
}
