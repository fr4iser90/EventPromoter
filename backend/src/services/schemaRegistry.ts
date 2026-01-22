import { FormSchema } from '../types/formSchema.js';
import { PanelSchema } from '../types/platformSchema.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

interface SchemaCacheEntry {
  schema: FormSchema | PanelSchema;
  path: string;
}

export class SchemaRegistry {
  private static instance: SchemaRegistry;
  private cache: Map<string, Map<string, SchemaCacheEntry>> = new Map(); // platformId -> schemaId -> SchemaCacheEntry

  private constructor() {}

  public static getInstance(): SchemaRegistry {
    if (!SchemaRegistry.instance) {
      SchemaRegistry.instance = new SchemaRegistry();
    }
    return SchemaRegistry.instance;
  }

  public async loadAllSchemas(): Promise<void> {
    console.log('Loading all schemas into registry...');
    const currentDirname = dirname(fileURLToPath(import.meta.url));
    const platformsDirPath = join(currentDirname, '../platforms');

    try {
      const platformDirs = await readdir(platformsDirPath, { withFileTypes: true });
      for (const platformDir of platformDirs) {
        if (platformDir.isDirectory()) {
          const platformId = platformDir.name;
          const schemaDirPath = join(platformsDirPath, platformId, 'schema');
          
          try {
            const schemaFiles = await readdir(schemaDirPath, { withFileTypes: true });
            for (const schemaFile of schemaFiles) {
              if (schemaFile.isFile() && schemaFile.name.endsWith('.js')) {
                const schemaId = schemaFile.name.replace('.js', '');
                const schemaPath = join(schemaDirPath, schemaFile.name);
                
                try {
                  const schemaModule = await import(schemaPath);
                  const schema: FormSchema | PanelSchema = schemaModule.default;

                  if (schema) {
                    if (!this.cache.has(platformId)) {
                      this.cache.set(platformId, new Map());
                    }
                    this.cache.get(platformId)?.set(schemaId, { schema, path: schemaPath });
                    console.log(`  Loaded schema: ${platformId}/${schemaId}`);
                  } else {
                    console.warn(`  Schema ${platformId}/${schemaId} has no default export.`);
                  }
                } catch (importError: any) {
                  console.error(`  Error importing schema ${platformId}/${schemaId}:`, importError);
                }
              }
            }
          } catch (dirError: any) {
            if (dirError.code !== 'ENOENT') { // Ignore if schema directory doesn't exist
              console.warn(`  Could not read schema directory for platform ${platformId}:`, dirError.message);
            }
          }
        }
      }
      console.log('All schemas loaded.');
    } catch (error: any) {
      console.error('Error loading all schemas into registry:', error);
    }
  }

  public getSchema(platformId: string, schemaId: string): FormSchema | PanelSchema | undefined {
    return this.cache.get(platformId)?.get(schemaId)?.schema;
  }
}
