/**
 * Preview Renderer Service
 * 
 * Generic, schema-driven preview rendering.
 * 
 * Architecture:
 * - Content (data) → Schema (layout/slots) → Renderer (platform + mode) → HTML
 * - Frontend renders NOTHING except final HTML
 * - Preview === Send (identical rendering)
 * 
 * @module services/previewRenderer
 */

import { PreviewSchema, PreviewSlot } from '../types/platformSchema.js'
import { PlatformManager } from './platformManager.js'

export interface PreviewRenderOptions {
  /** Platform ID */
  platform: string
  /** Preview mode (desktop, mobile, etc.) */
  mode?: string
  /** Client-specific mode (e.g., 'gmail', 'outlook' for email) */
  client?: string
  /** Content data */
  content: Record<string, any>
  /** Preview schema */
  schema: PreviewSchema
  /** Dark mode */
  darkMode?: boolean
}

export interface PreviewRenderResult {
  /** Rendered HTML */
  html: string
  /** Optional: CSS (if separate from HTML) */
  css?: string
  /** Preview dimensions */
  dimensions?: {
    width: number
    height: number
  }
}

/**
 * Generic Preview Renderer
 * 
 * Delegates to platform-specific renderer if available,
 * otherwise uses fallback generic renderer
 */
export class PreviewRenderer {
  /**
   * Render preview HTML
   * 
   * @param options - Render options
   * @returns Rendered HTML
   */
  static async render(options: PreviewRenderOptions): Promise<PreviewRenderResult> {
    const { platform, mode, client, content, schema, darkMode } = options

    try {
      // Try to get platform-specific renderer
      const platformService = await PlatformManager.getPlatformService(platform)
      
      // If platform service has renderPreview method, use it
      if (platformService && typeof platformService.renderPreview === 'function') {
        return await platformService.renderPreview({
          content,
          schema,
          mode: mode || schema.defaultMode,
          client,
          darkMode
        })
      }
    } catch (error: any) {
      console.debug(`No platform-specific renderer for ${platform}, using fallback:`, error?.message)
    }

    // Fallback: Generic renderer
    return PreviewRenderer.renderGeneric(options)
  }

  /**
   * Generic fallback renderer
   * Simple HTML rendering when platform doesn't have custom renderer
   */
  private static renderGeneric(options: PreviewRenderOptions): PreviewRenderResult {
    const { content, schema, mode, darkMode } = options
    
    const selectedMode = schema.modes.find(m => m.id === (mode || schema.defaultMode)) || schema.modes[0]
    const slots = schema.slots || []
    
    // Resolve slot content
    const slotContent: Record<string, any> = {}
    slots.forEach(slot => {
      const value = PreviewRenderer.resolveSlotContent(slot, content)
      if (value !== null && value !== undefined) {
        slotContent[slot.slot] = value
      }
    })

    // Build simple HTML
    let html = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n'
    
    // Add styles
    const bgColor = schema.styling?.backgroundColor || (darkMode ? '#1a1a1a' : '#ffffff')
    const textColor = schema.styling?.textColor || (darkMode ? '#ffffff' : '#000000')
    const fontFamily = schema.styling?.fontFamily || 'Arial, sans-serif'
    
    html += `<style>
      body {
        margin: 0;
        padding: 20px;
        background-color: ${bgColor};
        color: ${textColor};
        font-family: ${fontFamily};
      }
      .preview-container {
        max-width: ${selectedMode.width || 600}px;
        margin: 0 auto;
        background: ${bgColor};
        color: ${textColor};
      }
    </style>\n`
    
    html += '</head>\n<body>\n<div class="preview-container">\n'
    
    // Render slots in order
    const sortedSlots = [...slots].sort((a, b) => (a.order || 999) - (b.order || 999))
    sortedSlots.forEach(slot => {
      const value = slotContent[slot.slot]
      if (value !== null && value !== undefined) {
        html += `<div class="slot-${slot.slot}">${String(value)}</div>\n`
      }
    })
    
    html += '</div>\n</body>\n</html>'
    
    return {
      html,
      dimensions: {
        width: selectedMode.width || 600,
        height: selectedMode.height || 400
      }
    }
  }

  /**
   * Resolve slot content from content data
   * Handles fallback chains and conditions
   */
  private static resolveSlotContent(slot: PreviewSlot, content: Record<string, any>): any {
    // Check condition
    if (slot.condition) {
      const conditionMet = PreviewRenderer.evaluateCondition(slot.condition, content)
      if (!conditionMet) {
        return null
      }
    }

    // Try primary field
    if (content[slot.field] !== null && content[slot.field] !== undefined) {
      return content[slot.field]
    }

    // Try fallback fields
    if (slot.fallback) {
      for (const fallbackField of slot.fallback) {
        if (content[fallbackField] !== null && content[fallbackField] !== undefined) {
          return content[fallbackField]
        }
      }
    }

    return null
  }

  /**
   * Evaluate condition
   */
  private static evaluateCondition(condition: PreviewSlot['condition'], content: Record<string, any>): boolean {
    if (!condition) return true

    const fieldValue = content[condition.field]

    switch (condition.operator) {
      case 'exists':
        return fieldValue !== null && fieldValue !== undefined
      case 'notEmpty':
        return fieldValue !== null && fieldValue !== undefined && String(fieldValue).trim().length > 0
      case 'equals':
        return fieldValue === condition.value
      case 'notEquals':
        return fieldValue !== condition.value
      default:
        return true
    }
  }
}

