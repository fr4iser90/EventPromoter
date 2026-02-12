/**
 * Editor Schema Definitions
 * Defines the content editor structure and allowed blocks.
 */

import { FieldType, ValidationRule, ActionSchema } from './primitives.js';

/**
 * Content block types for editor
 */
export type ContentBlockType =
  | 'text'
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'video'
  | 'link'
  | 'hashtag'
  | 'mention'
  | 'list'
  | 'quote'
  | 'code'
  | 'custom'
  | 'file_selection_input'
  | 'targets'; // Generic block type for platform-specific targets (e.g., recipients for email, subreddits for reddit)

/**
 * Settings for file selection input block
 */
export interface FileSelectionSettings {
  enableToggle?: {
    label: string;
    default: boolean;
  };
  selectionLimit?: {
    max: number;
    message: string;
  };
  fileFilter?: {
    allowedMimeTypes: string[];
    allowedExtensions: string[];
    noFilesMessage: string;
  };
  selectFileLabel?: string;
  selectedFilesLabel?: string;
}

/**
 * Content block definition
 */
export interface ContentBlock {
  /** Block type */
  type: ContentBlockType;
  /** Block identifier (used as field name in content object) */
  id: string;
  /** Block label */
  label: string;
  /** Block description */
  description?: string;
  /** Whether block is required */
  required?: boolean;
  /** Block constraints */
  constraints?: {
    /** Maximum length */
    maxLength?: number;
    /** Minimum length */
    minLength?: number;
    /** Maximum number of items (for lists) */
    maxItems?: number;
    /** Minimum number of items */
    minItems?: number;
    /** Minimum number of recipients (for recipients block) */
    minRecipients?: number;
    /** Allowed formats (for media) */
    allowedFormats?: string[];
    /** Maximum file size (bytes) */
    maxFileSize?: number;
    /** Maximum dimensions (for images) */
    maxDimensions?: { width: number; height: number };
    /** Aspect ratio (for images/videos) */
    aspectRatio?: string;
  };
  /** Block validation rules */
  validation?: ValidationRule[];
  /** Block specific settings */
  settings?: FileSelectionSettings | Record<string, any>;
  /** Block UI configuration */
  ui?: {
    /** Icon identifier */
    icon?: string;
    /** Custom component */
    component?: string;
    /** Whether block is enabled */
    enabled?: boolean;
    /** Block order */
    order?: number;
  };
  /** Block rendering configuration (for schema-driven rendering) */
  rendering?: {
    /** Rendering strategy: 'schema' (single field), 'composite' (multiple fields), 'custom' (special component) */
    strategy?: 'schema' | 'composite' | 'custom';

    /** For 'schema' strategy: Field type for SchemaRenderer */
    fieldType?: FieldType;
    /** Placeholder text */
    placeholder?: string;
    /** Default value */
    default?: any;
    /** For media blocks: upload endpoint */
    uploadEndpoint?: string;
    /** For hashtag/mention blocks: suggestions endpoint */
    suggestionsEndpoint?: string;
    /** For select/list blocks: options source */
    optionsSource?: {
      endpoint: string;
      method?: 'GET' | 'POST';
      responsePath?: string;
      transform?: 'custom' | ((item: any) => { label: string; value: any });
    };
    /** Variables available for templating in this rendered field */
    variables?: Array<{
      name: string;
      label?: string;
      description?: string;
    }>;

    /** For 'composite' strategy: Schema for multiple fields */
    schema?: Record<string, {
      fieldType: FieldType | 'mapping';
      label: string;
      description?: string;
      source: string; // Key in dataEndpoints
      required?: boolean;
      default?: any;
      /** Conditional visibility: show field only when another field has a specific value */
      visibleWhen?: {
        field: string; // Field name to watch
        value: any; // Value that triggers visibility
      };
    }>;
    /** For 'composite' strategy: Data endpoints for loading options */
    dataEndpoints?: Record<string, string>;

    /** For 'custom' strategy: Component name */
    component?: string;
    /** For 'custom' strategy: Contract version */
    contract?: string;
    /** For 'custom' strategy: Endpoints for loading data */
    endpoints?: Record<string, string>;
  };
  // ✅ NEW: Helper System
  /** Helper ID for displaying help information */
  helper?: string;
}

/**
 * Editor schema
 * Defines the content editor structure and allowed blocks
 */
export interface EditorSchema {
  /** Schema version */
  version: string;
  /** Schema title */
  title: string;
  /** Schema description */
  description?: string;
  /** Allowed content blocks */
  blocks: ContentBlock[];
  /** Editor mode */
  mode?: 'simple' | 'advanced' | 'rich' | 'markdown';
  /** Editor features */
  features?: {
    /** Enable formatting toolbar */
    formatting?: boolean;
    /** Enable media upload */
    mediaUpload?: boolean;
    /** Enable link insertion */
    linkInsertion?: boolean;
    /** Enable hashtag suggestions */
    hashtagSuggestions?: boolean;
    /** Enable mention suggestions */
    mentionSuggestions?: boolean;
    /** Enable preview */
    preview?: boolean;
    /** Enable word count */
    wordCount?: boolean;
    /** Enable character count */
    characterCount?: boolean;
  };
  /** Editor constraints */
  constraints?: {
    /** Maximum total length */
    maxLength?: number;
    /** Minimum total length */
    minLength?: number;
    /** Maximum number of blocks */
    maxBlocks?: number;
  };
}
