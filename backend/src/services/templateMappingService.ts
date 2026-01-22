// Template Mapping Service - Maps templates to editor content format
// This service handles the conversion from template format to editor block format

import { Template } from '../types/templateTypes.js'
import { ParsedEventData } from '../types/index.js'
import { ContentBlock } from '@/types/schema'
import { getTemplateVariables, replaceTemplateVariables } from './parsing/templateVariables.js'
import { PlatformManager } from './platformManager.js'
import { getPlatformRegistry, initializePlatformRegistry } from './platformRegistry.js'

// Content value types that can be stored in editor content
type ContentValue = string | number | boolean | null | undefined

export interface TemplateMappingRequest {
  templateId: string
  parsedData?: ParsedEventData | null
  uploadedFileRefs?: Array<{ url: string; type: string; isImage?: boolean }>
  existingContent?: Record<string, ContentValue>
}

export interface TemplateMappingResult {
  content: Record<string, ContentValue>
  templateId: string
  variables: Record<string, string>
}

export class TemplateMappingService {
  /**
   * Map template to editor content format
   * 
   * This is the core mapping logic that converts template format to editor block format.
   * Previously this was done in the frontend, but now it's centralized in the backend.
   * 
   * @param platform - Platform ID (e.g., 'email', 'twitter')
   * @param template - Template to apply
   * @param request - Mapping request with parsed data and file refs
   * @returns Mapped content ready for editor
   */
  static async mapTemplateToEditorContent(
    platform: string,
    template: Template,
    request: TemplateMappingRequest
  ): Promise<TemplateMappingResult> {
    // Get platform schema to understand editor blocks
    const platformService = await PlatformManager.getPlatformService(platform)
    if (!platformService) {
      throw new Error(`Platform service not found for: ${platform}`)
    }

    // Get platform schema from registry
    const registry = getPlatformRegistry()
    if (!registry.isInitialized()) {
      await initializePlatformRegistry()
    }
    
    const platformSchema = registry.getPlatformSchema(platform.toLowerCase())
    if (!platformSchema || !platformSchema.editor) {
      throw new Error(`Platform schema not found for: ${platform}`)
    }

    const editorSchema = platformSchema.editor
    if (!editorSchema || !editorSchema.blocks) {
      throw new Error(`Editor schema not found for platform: ${platform}`)
    }

    const editorBlocks: ContentBlock[] = editorSchema.blocks

    // Get template variables
    const templateVariables = getTemplateVariables(
      request.parsedData || null,
      request.uploadedFileRefs || []
    )

    // Get template content structure
    const templateContent = template.template || {}

    // Start with existing content (if any)
    const newContent: Record<string, ContentValue> = {
      ...(request.existingContent || {}),
      _templateId: template.id
    }

    // Handle string templates (LinkedIn, Twitter, etc.)
    // String templates must have a 'text' block in editor schema - no fallbacks
    if (typeof templateContent === 'string') {
      const textBlock = editorBlocks.find((b: ContentBlock) => b.id === 'text')
      if (textBlock) {
        newContent.text = replaceTemplateVariables(templateContent, templateVariables)
      }
    } else {
      // Template is an object - map fields to editor blocks (EXACT MATCHES ONLY - no fallbacks)
      editorBlocks.forEach((block: ContentBlock) => {
        const fieldName = block.id
        const fieldValue = templateContent[fieldName]

        // Only use exact matches - no fallback mappings
        if (fieldValue && typeof fieldValue === 'string') {
          // Replace variables in the field value
          const processedValue = replaceTemplateVariables(fieldValue, templateVariables)
          newContent[fieldName] = processedValue
        }
      })
      
      // Special handling for platforms that use Markdown (Reddit, etc.)
      // If template has 'text' field and it contains Markdown, preserve it
      // The preview renderer will handle Markdown rendering

      // Extract body content from template HTML and set as bodyText (if html exists and bodyText not already set)
      // This is specifically for Email platform which uses HTML templates
      if (templateContent.html && !newContent.bodyText) {
        const templateHtml = replaceTemplateVariables(templateContent.html, templateVariables)
        
        // Try to extract body content from full HTML document
        const bodyMatch = templateHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
        if (bodyMatch && bodyMatch[1]) {
          // Extract body content, remove style tags (preview has its own styles)
          let bodyContent = bodyMatch[1]
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
            .trim()
          
          // Set as bodyText (structured field) - preview will render it
          newContent.bodyText = bodyContent
        } else {
          // No <body> tag found - might be HTML fragment
          // Check if it's a full HTML document or just a fragment
          if (templateHtml.includes('<!DOCTYPE') || templateHtml.includes('<html')) {
            // Full document but no body - extract from html tag or use as-is
            const htmlMatch = templateHtml.match(/<html[^>]*>([\s\S]*?)<\/html>/i)
            if (htmlMatch && htmlMatch[1]) {
              let bodyContent = htmlMatch[1]
                .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '') // Remove head
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
                .trim()
              newContent.bodyText = bodyContent
            }
          } else {
            // HTML fragment - use directly after cleaning
            let bodyContent = templateHtml
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
              .trim()
            newContent.bodyText = bodyContent
          }
        }
      }
    }

    // Process template variables that aren't in template.template fields
    // These are variables used in the template but not as direct fields
    const templateVars = this.extractTemplateVariables(template)
    const editorFieldNames = new Set(editorBlocks.map((block: ContentBlock) => block.id))

    templateVars.forEach(varName => {
      // Skip if already handled as a direct field
      if (editorFieldNames.has(varName) || newContent[varName] !== undefined) {
        return
      }

      // Get value from templateVariables (already computed from parsedData)
      const varValue = templateVariables[varName]
      if (varValue !== undefined && varValue !== null && varValue !== '') {
        // Store as _var_ field (will be displayed as separate field in UI)
        newContent[`_var_${varName}`] = varValue
      }
    })

    return {
      content: newContent,
      templateId: template.id,
      variables: templateVariables
    }
  }

  /**
   * Extract text content from HTML (removes tags and decodes entities)
   */
  private static extractTextFromHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  /**
   * Extract template variables from template content
   */
  private static extractTemplateVariables(template: Template): string[] {
    const variables: Set<string> = new Set()

    // Add variables from template.variables array
    if (template.variables && Array.isArray(template.variables)) {
      template.variables.forEach(v => variables.add(v))
    }

    // Extract variables from template content (look for {variable} patterns)
    // Template content can be a string (LinkedIn/Twitter) or an object (Email/Reddit)
    const templateContent = template.template as string | Record<string, string>
    if (typeof templateContent === 'string') {
      const matches = templateContent.match(/\{([^}]+)\}/g)
      if (matches) {
        matches.forEach((match: string) => {
          const varName = match.replace(/[{}]/g, '')
          variables.add(varName)
        })
      }
    } else if (templateContent && typeof templateContent === 'object') {
      Object.values(templateContent).forEach((value: unknown) => {
        if (typeof value === 'string') {
          const matches = value.match(/\{([^}]+)\}/g)
          if (matches) {
            matches.forEach((match: string) => {
              const varName = match.replace(/[{}]/g, '')
              variables.add(varName)
            })
          }
        }
      })
    }

    return Array.from(variables)
  }
}
