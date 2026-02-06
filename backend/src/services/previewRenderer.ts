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

import { PreviewSchema, PreviewSlot } from '@/types/schema'
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
  /** Locale for rendering (e.g., 'en', 'de', 'es') */
  locale?: string
}

export interface PreviewRenderResult {
  /** Content HTML (kein vollständiges Dokument, nur Content) */
  html: string
  /** Optional: strukturelles CSS (Layout, keine Farben) */
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
 * ✅ 100% GENERIC: Only delegates to platform-specific renderer
 * Each platform MUST implement its own renderPreview method
 * NO fallback - platforms are responsible for their own preview rendering
 */
export class PreviewRenderer {
  /**
   * Render preview HTML
   * 
   * Delegates to platform-specific renderer.
   * Throws error if platform doesn't have renderPreview method.
   * 
   * @param options - Render options
   * @returns Rendered HTML
   * @throws Error if platform doesn't have renderPreview method
   */
  static async render(options: PreviewRenderOptions): Promise<PreviewRenderResult> {
    const { platform, mode, client, content, schema, locale } = options

    // Get platform-specific service
    const platformService = await PlatformManager.getPlatformService(platform)
    
    if (!platformService) {
      throw new Error(`Platform service not found for '${platform}'`)
    }

    // Platform MUST have renderPreview method - no fallback!
    if (typeof platformService.renderPreview !== 'function') {
      throw new Error(`Platform '${platform}' does not implement renderPreview method. Each platform must handle its own preview rendering.`)
    }

    // Delegate to platform-specific renderer
    return await platformService.renderPreview({
      content,
      schema,
      mode: mode || schema.defaultMode,
      client,
      locale
    })
  }
}

