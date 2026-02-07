import { FormSchema, SettingsSchema } from '@/types/schema/index.js';
import { SchemaContext } from '../controllers/schemaController.js';

// Helper to recursively resolve template strings (e.g., :platformId, :id)
const resolveTemplatesDeep = (obj: any, context: SchemaContext, parentKey?: string): any => {
  if (typeof obj === 'string') {
    let resolved = obj.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
      return context[key] ?? `:${key}`;
    });
    // Remove unresolved :id segments from endpoint strings (for new items)
    if (parentKey === 'endpoint' && !context.id && resolved.includes('/:id')) {
      // Remove /:id from the end or middle of the path
      resolved = resolved.replace(/\/:id(\/|$)/g, '$1').replace(/\/:id$/, '');
    }
    return resolved;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveTemplatesDeep(item, context, parentKey));
  }

  if (typeof obj === 'object' && obj !== null) {
    const newObj: { [key: string]: any } = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = resolveTemplatesDeep(obj[key], context, key);
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
