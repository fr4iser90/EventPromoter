import { FormSchema, SettingsSchema } from '@/types/schema';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

interface SchemaCacheEntry {
  schema: FormSchema | SettingsSchema;
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

    const isDevelopment = process.env.NODE_ENV === 'development';
    const fileExtension = isDevelopment ? '.ts' : '.js';

    try {
      const platformDirs = await readdir(platformsDirPath, { withFileTypes: true });
      const loadedSchemas: Record<string, string[]> = {};
      
      for (const platformDir of platformDirs) {
        if (platformDir.isDirectory()) {
          const platformId = platformDir.name;
          const schemaDirPath = join(platformsDirPath, platformId, 'schema');
          
          try {
            const schemaFiles = await readdir(schemaDirPath, { withFileTypes: true });
            for (const schemaFile of schemaFiles) {
              if (schemaFile.isFile() && schemaFile.name.endsWith(fileExtension)) {
                const schemaId = schemaFile.name.replace(fileExtension, '');
                const schemaPath = join(schemaDirPath, schemaFile.name);
                
                try {
                  const schemaPathWithExt = schemaPath.endsWith(fileExtension) ? schemaPath : schemaPath + fileExtension;
                  const schemaModule = await import(schemaPathWithExt);
                  const schema: FormSchema | SettingsSchema = schemaModule.default || schemaModule[schemaId] || schemaModule[Object.keys(schemaModule)[0]];

                  if (schema) {
                    if (!this.cache.has(platformId)) {
                      this.cache.set(platformId, new Map());
                    }
                    this.cache.get(platformId)?.set(schemaId, { schema, path: schemaPath });
                    if (!loadedSchemas[platformId]) {
                      loadedSchemas[platformId] = [];
                    }
                    loadedSchemas[platformId].push(schemaId);
                  } else {
                    console.info(`  Schema ${platformId}/${schemaId} has no default export.`);
                  }
                } catch (importError: any) {
                  console.error(`  Error importing schema ${platformId}/${schemaId}:`, importError);
                }
              }
            }
          } catch (dirError: any) {
            if (dirError.code !== 'ENOENT') { // Ignore if schema directory doesn't exist
              console.info(`  Could not read schema directory for platform ${platformId}:`, dirError.message);
            }
          }
        }
      }
      
      // Summarize loaded schemas per platform
      for (const [platformId, schemas] of Object.entries(loadedSchemas)) {
        console.info(`  Loaded ${schemas.length} schema(s) for ${platformId}: ${schemas.join(', ')}`);
      }
      
      console.log('All schemas loaded.');
    } catch (error: any) {
      console.error('Error loading all schemas into registry:', error);
    }
  }

  public getSchema(platformId: string, schemaId: string): FormSchema | SettingsSchema | undefined {
    return this.cache.get(platformId)?.get(schemaId)?.schema;
  }
}
