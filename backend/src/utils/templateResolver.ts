/**
 * Template Resolver
 * 
 * Resolves templates for different contexts (preview, export, raw).
 * Templates are raw material - resolvers make them context-capable.
 * 
 * IMPORTANT: This resolver does NOT handle colors, tokens, or themes.
 * It only removes/allows/blocks styles based on context.
 * 
 * @module utils/templateResolver
 */

import { JSDOM } from 'jsdom'
import { Template } from '../types/templateTypes.js'

/**
 * Template resolution modes
 */
export type TemplateMode = 'preview' | 'export' | 'raw'

/**
 * Strip styles from template HTML (for preview mode)
 * 
 * Removes:
 * - <style> tags
 * - style="" attributes
 * 
 * Uses DOM parsing (not regex) for robustness.
 */
function stripStyles(template: Template): Template {
  const processed = { ...template }
  
  // Process template content object
  if (processed.template && typeof processed.template === 'object') {
    const processedContent: Record<string, any> = {}
    
    Object.keys(processed.template).forEach(key => {
      const value = processed.template[key]
      
      if (typeof value === 'string' && value.trim()) {
        // Check if content is actually HTML (contains HTML tags)
        // If it's Markdown or plain text, don't process it with JSDOM
        const hasHtmlTags = /<[a-z][\s\S]*>/i.test(value)
        
        if (hasHtmlTags) {
          // Only process if it contains HTML tags
          try {
            // Parse HTML with JSDOM
            const dom = new JSDOM(value, {
              contentType: 'text/html',
              // Don't execute scripts for security
              runScripts: 'outside-only'
            })
            
            const document = dom.window.document
            
            // Remove <style> tags
            document.querySelectorAll('style').forEach((node: Element) => node.remove())
            
            // Remove style="" attributes from all elements
            document.querySelectorAll('[style]').forEach((node: Element) => {
              node.removeAttribute('style')
            })
            
            // Get cleaned HTML - extract body content
            const bodyContent = document.body?.innerHTML || document.documentElement.innerHTML
            // Remove any remaining HTML wrapper tags
            processedContent[key] = bodyContent
              .replace(/^<html><head><\/head><body>/, '')
              .replace(/<\/body><\/html>$/, '')
              .replace(/^<body>/, '')
              .replace(/<\/body>$/, '')
          } catch (error) {
            // If parsing fails, fallback to original value
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[TemplateResolver] Failed to parse HTML for key ${key}:`, error)
            }
            processedContent[key] = value
          }
        } else {
          // Not HTML - pass through unchanged (Markdown, plain text, etc.)
          processedContent[key] = value
        }
      } else {
        // Non-string values pass through unchanged
        processedContent[key] = value
      }
    })
    
    processed.template = processedContent
  }
  
  return processed
}

/**
 * Resolve template for specific mode
 * 
 * @param template - Raw template
 * @param mode - Resolution mode
 * @returns Resolved template
 */
export function resolveTemplate(
  template: Template,
  mode: TemplateMode
): Template {
  switch (mode) {
    case 'preview':
      // Remove styles for preview (respects theme)
      return stripStyles(template)
    
    case 'export':
      // Keep styles for export (full fidelity)
      return template
    
    case 'raw':
    default:
      // Return unchanged
      return template
  }
}

/**
 * Resolve multiple templates
 */
export function resolveTemplates(
  templates: Template[],
  mode: TemplateMode
): Template[] {
  return templates.map(template => resolveTemplate(template, mode))
}

