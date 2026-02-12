/**
 * Generic Preview Frame Component
 * 
 * ✅ 100% GENERIC: Kennt keine Platform, nur HTML-Hosting
 * 
 * Architecture:
 * - Frontend besitzt die Preview-Shell (iframe HTML)
 * - Backend liefert nur Content-HTML
 * - Theme wird via DOM API injiziert (kein String-Patching)
 * 
 * @module shared/components/PreviewFrame
 */

import React, { useRef, useEffect } from 'react'
import { useTheme } from '@mui/material'

/**
 * Preview Document Interface (Platform-agnostic)
 */
export const PreviewDocument = {
  /** Content HTML (kein vollständiges Dokument) */
  html: String,
  /** Optional: strukturelles CSS (Layout, keine Farben) */
  css: String,
  /** Optional: Meta-Informationen */
  meta: {
    title: String,
    viewport: String
  }
}

/**
 * Generic Preview Frame Component
 * 
 * Hostet fremdes HTML sicher und themed es basierend auf MUI Theme.
 * Kennt keine Platform-spezifischen Details.
 * 
 * @param {Object} props
 * @param {Object} props.document - Preview document with html, css, meta
 * @param {string} props.document.html - Content HTML (kein vollständiges Dokument)
 * @param {string} [props.document.css] - Optional: strukturelles CSS
 * @param {Object} [props.document.meta] - Optional: Meta-Informationen
 * @param {Object} [props.dimensions] - Preview dimensions
 * @param {number} [props.dimensions.width] - Preview width
 * @param {number} [props.dimensions.height] - Preview height
 */
export function PreviewFrame({ document, dimensions, ...props }: {
  document: {
    html: string
    css?: string
    meta?: { title?: string; viewport?: string }
  }
  dimensions?: { width?: number | string; height?: number | string }
  [key: string]: any
}) {
  const theme = useTheme()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // ✅ Preview Shell HTML (Frontend-owned)
  // :root bleibt leer - wird komplett via setProperty gesetzt
  const shellHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style id="preview-structural-css">
          /* Strukturelles CSS vom Backend (wird injiziert) */
        </style>
        <style id="preview-theme-css">
          /* Theme CSS Variables (werden komplett via JS gesetzt) */
          :root {
            /* Leer - wird via setProperty gesetzt */
          }
          body {
            margin: 0;
            padding: 20px;
            background-color: var(--preview-bg);
            color: var(--preview-text);
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
          }
          #preview-root {
            min-height: 100vh;
          }
        </style>
      </head>
      <body>
        <div id="preview-root"></div>
      </body>
    </html>
  `

  // ✅ Shell-Setup: Immer setzen (nie conditional)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // ✅ Profi-Fix: Shell immer setzen, nie conditional
    (iframe as any).srcdoc = shellHtml
  }, [])

  // ✅ Helper: Setze Theme CSS Variables
  const setThemeVariables = (doc: Document) => {
    if (!doc) return
    const root = doc.documentElement
    root.style.setProperty('--preview-bg', theme.palette.background.default)
    root.style.setProperty('--preview-text', theme.palette.text.primary)
    root.style.setProperty('--preview-container-bg', theme.palette.background.paper)
    root.style.setProperty('--preview-divider', theme.palette.divider)
    root.style.setProperty('--preview-link', theme.palette.primary.main)
    root.style.setProperty('--preview-text-secondary', theme.palette.text.secondary)
  }

  // ✅ Theme-Injection via DOM API (kein String-Patching!)
  // ✅ FIX: Warte auf iframe-Load (verhindert Race Conditions)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const injectTheme = () => {
      const doc = iframe.contentDocument
      if (!doc) return
      setThemeVariables(doc)
    }

    // ✅ Warte auf iframe-Load (verhindert Race Conditions)
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      injectTheme()
    } else {
      const handleLoad = () => injectTheme()
      iframe.addEventListener('load', handleLoad)
      return () => iframe.removeEventListener('load', handleLoad)
    }
  }, [theme])

  // ✅ Content-Mounting (Backend-HTML in Shell einfügen)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !document?.html) return

    // ✅ Warte auf iframe-Load (verhindert Race Conditions)
    const handleLoad = () => {
      const doc = iframe.contentDocument
      // ✅ Profi-Fix: contentDocument prüfen
      if (!doc) return

      const mount = doc.getElementById('preview-root')
      if (!mount) return

      // Injiziere strukturelles CSS vom Backend
      const structuralStyle = doc.getElementById('preview-structural-css')
      if (structuralStyle && document.css) {
        structuralStyle.textContent = document.css
      }

      // Mounte Backend-HTML
      mount.innerHTML = document.html
      
      // ✅ FIX: Theme nach Content-Mounting nochmal setzen (falls Theme-Injection zu früh war)
      // Das stellt sicher, dass Theme auch nach Content-Update korrekt ist
      setThemeVariables(doc)
    }

    // Prüfe ob bereits geladen
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      handleLoad()
    } else {
      iframe.addEventListener('load', handleLoad)
      return () => iframe.removeEventListener('load', handleLoad)
    }
  }, [document, theme]) // ✅ Include theme in dependencies

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: '100%',
        height: dimensions?.height || 'auto',
        minHeight: dimensions?.height || 400,
        border: 'none',
        display: 'block',
        backgroundColor: 'transparent'
      }}
      title={document?.meta?.title || 'Preview'}
      {...props}
    />
  )
}

export default PreviewFrame
