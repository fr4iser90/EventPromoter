import { FormSchema, SettingsSchema } from '@/types/schema';

export class SchemaValidator {
  public static findUnresolvedTemplates(obj: any, found = new Set<string>()): Set<string> {
    if (typeof obj === 'string') {
      const matches = obj.match(/:([a-zA-Z0-9_]+)/g);
      matches?.forEach(m => found.add(m));
    } else if (Array.isArray(obj)) {
      obj.forEach(v => SchemaValidator.findUnresolvedTemplates(v, found));
    } else if (typeof obj === 'object' && obj) {
      Object.values(obj).forEach(v => SchemaValidator.findUnresolvedTemplates(v, found));
    }
    return found;
  }

  public static validate(schema: FormSchema | SettingsSchema): void {
    const unresolved = SchemaValidator.findUnresolvedTemplates(schema);
    if (unresolved.size > 0) {
      const unresolvedList = Array.from(unresolved).join(', ');
      console.warn(`Schema validation warning: Unresolved templates found: ${unresolvedList}`);
      // In a more strict environment, you might throw an error here:
      // throw new Error(`Unresolved templates in schema: ${unresolvedList}`);
    }
  }
}