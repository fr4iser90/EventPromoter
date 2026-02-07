import { FormSchema, SettingsSchema } from '@/types/schema/index.js';
import { SchemaContext } from '../controllers/schemaController.js';

// Helper to recursively resolve template strings (e.g., :platformId, :id)
const resolveTemplatesDeep = (obj: any, context: SchemaContext): any => {
  if (typeof obj === 'string') {
    return obj.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
      return context[key] ?? `:${key}`;
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveTemplatesDeep(item, context));
  }

  if (typeof obj === 'object' && obj !== null) {
    const newObj: { [key: string]: any } = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = resolveTemplatesDeep(obj[key], context);
    }
    return newObj;
  }

  return obj;
};

// Apply Field-Type Enrichments
const applyFieldTypeEnrichments = (obj: any) => {
  if (typeof obj === 'object' && obj !== null) {
    // Set backend-driven defaults if missing
    if (obj.optionsSource && !obj.optionsSource.responsePath) {
      obj.optionsSource.responsePath = 'targets';
    }

    if (obj.type === 'checkbox' && obj.default === undefined) {
        obj.default = false;
    }
    for (const key of Object.keys(obj)) {
      applyFieldTypeEnrichments(obj[key]);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(applyFieldTypeEnrichments);
  }
};

export class SchemaResolver {
  public static resolveAndEnrich(schema: FormSchema | SettingsSchema, context: SchemaContext): FormSchema | SettingsSchema {
    // Create a deep clone to avoid mutating the original schema object
    const clonedSchema: FormSchema | SettingsSchema = JSON.parse(JSON.stringify(schema));

    // Apply generic template resolution
    const resolvedSchema = resolveTemplatesDeep(clonedSchema, context);

    // Apply Field-Type Enrichments
    applyFieldTypeEnrichments(resolvedSchema);

    return resolvedSchema;
  }
}
