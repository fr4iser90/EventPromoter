/**
 * Form Schema Definitions
 * Defines the form structure for generic data entry and editing.
 */

import { FieldDefinition, ActionSchema } from './primitives.js';

export interface FormSection {
  id: string;
  title: string;
  fields: string[]; // Referenziert Feld-Namen
}

export interface FormSchema {
  /** Unique schema identifier */
  id: string;
  /** Schema version */
  version?: string;
  /** Schema title */
  title: string;
  /** Schema description */
  description?: string;
  /** Form fields */
  fields: FieldDefinition[];
  /** Form actions (e.g., Save, Cancel) */
  actions?: ActionSchema[];
  /** Field groups/sections (optional, for complex forms) */
  sections?: FormSection[];
  /** Form-level validation */
  validate?: (data: Record<string, any>) => { isValid: boolean; errors: Record<string, string[]> };
  // Allow any other properties that might be needed
  [key: string]: any;
}
