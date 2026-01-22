import { Request, Response } from 'express'
import { FormSchema, PanelSchema } from '@/types/schema';
import { SchemaRegistry } from '../services/schemaRegistry.js'
import { SchemaResolver } from '../services/schemaResolver.js'
import { SchemaValidator } from '../services/schemaValidator.js'

// Define the generic SchemaContext type
export type SchemaContext = {
  platformId?: string;
  [key: string]: string | undefined; // Allow for other dynamic context variables
}


export class SchemaController {
  /**
   * Get a schema for a specific platform and schema ID
   * GET /api/platforms/:platformId/schemas/:schemaId
   */
  static async getSchema(req: Request, res: Response) {
    try {
      const { platformId, schemaId } = req.params
      
      const schemaRegistry = SchemaRegistry.getInstance();
      const schema: FormSchema | PanelSchema | undefined = schemaRegistry.getSchema(platformId, schemaId);

      if (!schema) {
        return res.status(404).json({
          success: false,
          error: `Schema ${platformId}/${schemaId} not found in registry.`
        })
      }
      
      // Define the context for enrichment
      const schemaContext: SchemaContext = {
        platformId: platformId,
        // Add other context variables here as needed, e.g., userId, locale
        // userId: req.user.id,
        // locale: req.headers['accept-language']
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

  static enrichSchema(schema: FormSchema | PanelSchema, context: SchemaContext): FormSchema | PanelSchema {
    return SchemaResolver.resolveAndEnrich(schema, context);
  }
}