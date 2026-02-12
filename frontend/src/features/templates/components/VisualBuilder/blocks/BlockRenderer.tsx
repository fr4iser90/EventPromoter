/**
 * BlockRenderer - Generischer Block-Renderer
 * 
 * Rendert Blöcke basierend auf Schema-Feld-Typ.
 * 
 * @module features/templates/components/VisualBuilder/blocks/BlockRenderer
 */

import React from 'react'
import TextBlock from './TextBlock'
import RichTextBlock from './RichTextBlock'
import type { BlockRendererBlock as TemplateBlock, TemplateFieldSchema as FieldSchema } from '../../../types'

/**
 * BlockRenderer - Rendert Block basierend auf Schema-Typ
 * 
 * @param {Object} props
 * @param {Object} props.block - Block-Daten
 * @param {Object} props.fieldSchema - Schema für dieses Feld
 * @param {Object} props.schema - Vollständiges Platform-Schema
 * @param {boolean} props.isSelected - Ist Block ausgewählt?
 * @param {Function} props.onUpdate - Callback für Updates
 * @param {Function} props.onInsertVariable - Callback für Variable-Einfügen
 */
function BlockRenderer({
  block,
  fieldSchema,
  schema,
  isSelected,
  onUpdate,
  onInsertVariable
}: {
  block: TemplateBlock
  fieldSchema: FieldSchema
  schema?: unknown
  isSelected: boolean
  onUpdate: (data: Record<string, unknown>) => void
  onInsertVariable: (variable: string) => void
}) {
  if (!fieldSchema) {
    return null
  }

  // Rendere basierend auf Feld-Typ
  switch (fieldSchema.type) {
    case 'html':
    case 'rich':
      return (
        <RichTextBlock
          block={block}
          fieldSchema={fieldSchema}
          isSelected={isSelected}
          onUpdate={onUpdate}
          onInsertVariable={onInsertVariable}
        />
      )
    
    case 'text':
    case 'textarea':
      return (
        <TextBlock
          block={block}
          fieldSchema={fieldSchema}
          isSelected={isSelected}
          onUpdate={onUpdate}
          onInsertVariable={onInsertVariable}
        />
      )
    
    default:
      // Fallback für unbekannte Typen
      return (
        <TextBlock
          block={block}
          fieldSchema={fieldSchema}
          isSelected={isSelected}
          onUpdate={onUpdate}
          onInsertVariable={onInsertVariable}
        />
      )
  }
}

export default BlockRenderer
