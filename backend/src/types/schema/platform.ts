/**
 * Platform Schema Definition
 * Defines the complete structure for a platform's schema, combining all sub-schemas.
 */

import { CredentialsSchema } from './credentials';
import { EditorSchema } from './editor';
import { PreviewSchema } from './preview';
import { SettingsSchema } from './settings';
import { TemplateSchema } from './template';

/**
 * Complete platform schema
 * Combines credentials, editor, preview, settings, and template schemas
 */
export interface PlatformSchema {
  /** Schema version */
  version: string;
  /** Credentials schema (for API keys/auth - shown in modal) */
  credentials: CredentialsSchema;
  /** Editor schema (for content editing) */
  editor: EditorSchema;
  /** Preview schema (for content preview) */
  preview: PreviewSchema;
  /** Settings schema (for platform features/options - shown in modal) */
  settings?: SettingsSchema;
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
    obj.credentials &&
    typeof obj.credentials === 'object' &&
    obj.editor &&
    typeof obj.editor === 'object' &&
    obj.preview &&
    typeof obj.preview === 'object' &&
    typeof obj.preview.defaultMode === 'string'
  );
}
