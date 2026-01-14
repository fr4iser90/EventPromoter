// Template Mapping Service - Maps templates to editor content format
// This service handles the conversion from template format to editor block format

import { Template } from '../types/templateTypes.js'
import { ParsedEventData } from '../types/index.js'
import { ContentBlock } from '../types/platformSchema.js'
import { getTemplateVariables, replaceTemplateVariables } from './parsing/templateVariables.js'
import { PlatformManager } from './platformManager.js'
import { getPlatformRegistry, initializePlatformRegistry } from './platformRegistry.js'

export interface TemplateMappingRequest {
  templateId: string
  parsedData?: ParsedEventData | null
  uploadedFileRefs?: Array<{ url: string; type: string; isImage?: boolean }>
  existingContent?: Record<string, any>
}

export interface TemplateMappingResult {
  content: Record<string, any>
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
    const newContent: Record<string, any> = {
      ...(request.existingContent || {}),
      _templateId: template.id
    }

    // Handle string templates (LinkedIn, Twitter, etc.)
    if (typeof templateContent === 'string') {
      const firstTextBlock = editorBlocks.find((b: ContentBlock) => 
        (b.type === 'paragraph' || b.type === 'text') && b.id !== 'subject' && b.id !== 'title'
      )
      if (firstTextBlock) {
        newContent[firstTextBlock.id] = replaceTemplateVariables(templateContent, templateVariables)
      }
    } else {
      // Template is an object - map fields to editor blocks
      editorBlocks.forEach((block: ContentBlock) => {
        const fieldName = block.id
        let fieldValue = templateContent[fieldName]

        // If no exact match, check for common field name mappings
        if (!fieldValue) {
          if (fieldName === 'body' && (templateContent.html || templateContent.text)) {
            fieldValue = templateContent.html || templateContent.text
          } else if (fieldName === 'bodyText' && (templateContent.html || templateContent.text)) {
            // For email: extract text from html for bodyText
            if (templateContent.html) {
              fieldValue = this.extractTextFromHtml(templateContent.html)
            } else {
              fieldValue = templateContent.text
            }
          } else if (fieldName === 'subject' && templateContent.subject) {
            fieldValue = templateContent.subject
          } else if (fieldName === 'text' && (templateContent.text || templateContent.html)) {
            fieldValue = templateContent.text || templateContent.html
          } else if (fieldName === 'title' && templateContent.title) {
            fieldValue = templateContent.title
          }
        }

        if (fieldValue && typeof fieldValue === 'string') {
          newContent[fieldName] = replaceTemplateVariables(fieldValue, templateVariables)
        }
      })

      // ✅ CRITICAL: Also set body if html is present (for preview rendering)
      // This ensures preview works even if body block doesn't exist in editor schema
      if (templateContent.html && !newContent.body) {
        newContent.body = replaceTemplateVariables(templateContent.html, templateVariables)
      }

      // Fallback: If template has html/text but no body/bodyText block found, apply to first paragraph/text block
      if ((templateContent.html || templateContent.text) && !newContent.body && !newContent.bodyText && !newContent.text) {
        const firstTextBlock = editorBlocks.find((b: ContentBlock) => 
          (b.type === 'paragraph' || b.type === 'text') && b.id !== 'subject' && b.id !== 'title'
        )
        if (firstTextBlock) {
          const templateText = templateContent.html || templateContent.text
          newContent[firstTextBlock.id] = replaceTemplateVariables(templateText, templateVariables)
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
    const templateContent = template.template as string | Record<string, any>
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
