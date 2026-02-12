/**
 * Primitive Schema Type Definitions
 * These are the fundamental, universally reusable building blocks for all other schemas.
 */

/**
 * Field types supported by the schema system
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'password'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'image'
  | 'color'
  | 'range'
  | 'json'
  | 'target-list'
  | 'button'
  | 'email'
  | 'tel';

/**
 * Validation rule types
 */
export interface ValidationRule {
  /** Rule type */
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'url' | 'custom';
  /** Rule value (e.g., min: 0, max: 100, pattern: '^[a-z]+$') */
  value?: any;
  /** Error message for this rule */
  message?: string;
  /** Custom validation function (for 'custom' type) */
  validator?: (value: any) => boolean | string;
}

export interface ActionSchema {
  id: string;
  type?: 'open-edit-modal' | 'custom' | 'submit' | 'button' | 'delete';
  schemaId?: string;
  dataEndpoint?: string;
  saveEndpoint?: string;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  trigger?: 'change' | 'submit' | 'blur' | 'click';
  onSuccess?: 'reload' | 'clear' | 'refresh' | 'none';
  // Allow any other properties that might be needed
  [key: string]: any;
}

/**
 * Field definition for schema-driven forms
 */
export interface FieldDefinition {
  /** Field name (used as key in form data) */
  name: string;
  /** Field type */
  type: FieldType;
  /** Field label */
  label: string;
  /** Field description/help text */
  description?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  default?: any;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Validation rules */
  validation?: ValidationRule[];
  /** Field options (for select, multiselect, radio) */
  options?: Array<{ label: string; value: any; disabled?: boolean }>;
  /** Dynamic options source (loads options from API) */
  optionsSource?: {
    /** API endpoint pattern (use :platformId placeholder) */
    endpoint: string;
    /** HTTP method */
    method?: 'GET' | 'POST';
    /** Response path to extract options (e.g., 'data.available' or 'items') */
    responsePath?: string;
    /** Transform function for mapping items to {label, value} */
    transform?: 'custom' | ((item: any) => { label: string; value: any });
    /** Key for the label in the options data */
    labelPath?: string;
    /** Key for the value in the options data */
    valuePath?: string;
  };
  /** Field action (triggered on value change or submit) */
  action?: ActionSchema | {
    /** API endpoint pattern (use :platformId placeholder) */
    endpoint: string;
    /** HTTP method */
    method: 'POST' | 'PUT' | 'DELETE';
    /** When to trigger action: 'change' (immediate) | 'submit' (on form submit/enter) | 'blur' (on field blur) */
    trigger?: 'change' | 'submit' | 'blur';
    /** Request body mapping (field value will be sent as 'value' or custom mapping) */
    bodyMapping?: Record<string, string>;
    /** On success action */
    onSuccess?: 'reload' | 'clear' | 'refresh' | 'none';
    /** Reload options source after action */
    reloadOptions?: boolean;
  };
  /** Field dependencies (show/hide based on other fields) */
  dependencies?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
    value: any;
  };
  /** UI hints */
  ui?: {
    /** Field width (1-12 grid system) */
    width?: number;
    /** Field order */
    order?: number;
    /** Custom CSS class */
    className?: string;
    /** Whether to show field */
    hidden?: boolean;
    /** Whether field is disabled */
    disabled?: boolean;
    /** Custom component to render (overrides default) */
    component?: string;
    /** Whether to render as a table (for 'target-list' type) */
    renderAsTable?: boolean;
    /** Column definitions for table rendering */
    tableColumns?: Array<{
      id: string;
      label: string;
      clickable?: boolean;
      type?: 'text' | 'number' | 'date' | 'boolean';
      action?: ActionSchema;
    }>;
    /** Whether this field acts as a filter for another field (e.g., a search box for a table) */
    isFilterFor?: string;
  };
  // ✅ NEW: Environment Variable Support
  /** Environment variable name or configuration */
  envVar?: string | {
    name: string;
    required?: boolean;
    default?: string;
    transform?: (value: string) => any;
  };
  // ✅ NEW: Conditional Visibility (alternative to dependencies, more explicit)
  /** Show field only when condition is met */
  visibleWhen?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'exists' | 'notExists';
    value?: any;
  };
  // ✅ NEW: Field Dependencies
  /** Fields this field depends on */
  dependsOn?: string[];
  // ✅ NEW: Field Help/Examples
  /** Help text for this field */
  help?: string;
  /** Example values for this field */
  examples?: string[];
  // ✅ NEW: Field Encryption
  /** Whether field value should be encrypted (for passwords, API keys, etc.) */
  encrypted?: boolean;
  // ✅ NEW: Field Masking
  /** Mask value in UI (for sensitive data) */
  mask?: boolean;
  // ✅ NEW: Field Autocomplete
  /** Autocomplete configuration */
  autocomplete?: {
    source: 'api' | 'static';
    endpoint?: string;
    options?: Array<{ label: string; value: any }>;
  };
  // ✅ NEW: Helper System
  /** Helper ID for displaying help information */
  helper?: string;
}
