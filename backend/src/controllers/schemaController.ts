import { Request, Response } from 'express'
import { FormSchema, SettingsSchema } from '@/types/schema/index.js';
import { SchemaRegistry } from '../services/schemaRegistry.js'
import { SchemaResolver } from '../services/schemaResolver.js'
import { SchemaValidator } from '../services/schemaValidator.js'
import { getPlatformRegistry } from '../services/platformRegistry.js'

// Define the generic SchemaContext type
export type SchemaContext = {
  platformId?: string;
  [key: string]: string | undefined; // Allow for other dynamic context variables
}


export class SchemaController {

  /**
   * Get the complete platform schema for a given platform
   * GET /api/platforms/:platformId/schema
   */
  static async getPlatformSchema(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const platformRegistry = getPlatformRegistry();
      const platformSchema = platformRegistry.getPlatformSchema(platformId);

      if (!platformSchema) {
        return res.status(404).json({
          success: false,
          error: `Platform schema not found for platform: ${platformId}`
        });
      }

      // No enrichment for the top-level platform schema, as it's a structural definition
      return res.json({
        success: true,
        schema: platformSchema
      });
    } catch (error: any) {
      console.error('Get platform schema error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get platform schema',
        details: error.message
      });
    }
  }

  /**
   * Get a schema for a specific platform and schema ID
   * GET /api/platforms/:platformId/schemas/:schemaId
   */
  static async getSchema(req: Request, res: Response) {
    try {
      const { platformId, schemaId } = req.params
      
      const schemaRegistry = SchemaRegistry.getInstance();
      const schema: FormSchema | SettingsSchema | undefined = schemaRegistry.getSchema(platformId, schemaId);

      if (!schema) {
        return res.status(404).json({
          success: false,
          error: `Schema ${platformId}/${schemaId} not found in registry.`
        })
      }
      
      // Define the context for enrichment
      const schemaContext: SchemaContext = {
        platformId: platformId,
        id: (req.query.id as string) || (req.params.id as string), // Support id from query or params
      };

      // Enrich schema with platform-specific data and resolved templates
      const enrichedSchema = SchemaController.enrichSchema(schema, schemaContext);
      
      // Validate the enriched schema for any unresolved templates
      SchemaValidator.validate(enrichedSchema);

      return res.json({
        success: true,
        schema: enrichedSchema
      })
    } catch (error: any) {
      console.error('Get schema error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get schema',
        details: error.message
      })
    }
  }

  static enrichSchema(schema: FormSchema | SettingsSchema, context: SchemaContext): FormSchema | SettingsSchema {
    return SchemaResolver.resolveAndEnrich(schema, context);
  }
}