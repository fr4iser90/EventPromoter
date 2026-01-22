/**
 * Platform Schema Definition
 * Defines the complete structure for a platform's schema, combining all sub-schemas.
 */

import { SettingsSchema } from './settings';
import { EditorSchema } from './editor';
import { PreviewSchema } from './preview';
import { PanelSchema } from './panel';
import { TemplateSchema } from './template';

/**
 * Complete platform schema
 * Combines settings, editor, preview, panel, and template schemas
 */
export interface PlatformSchema {
  /** Schema version */
  version: string;
  /** Settings schema (for credentials/API keys - shown in modal) */
  settings: SettingsSchema;
  /** Editor schema (for content editing) */
  editor: EditorSchema;
  /** Preview schema (for content preview) */
  preview: PreviewSchema;
  /** Panel schema (for platform features/options - shown in sidebar) */
  panel?: PanelSchema;
  /** Template schema (for template management) */
  template?: TemplateSchema;
  /** Schema metadata */
  metadata?: {
    /** Last updated timestamp */
    lastUpdated?: string;
    /** Schema author */
    author?: string;
    /** Schema description */
    description?: string;
  };
}

/**
 * Type guard to check if an object is a valid PlatformSchema
 */
export function isPlatformSchema(obj: any): obj is PlatformSchema {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.version === 'string' &&
    obj.settings &&
    typeof obj.settings === 'object' &&
    obj.editor &&
    typeof obj.editor === 'object' &&
    obj.preview &&
    typeof obj.preview === 'object' &&
    typeof obj.preview.defaultMode === 'string'
  );
}
