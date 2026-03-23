/**
 * Schema Converter Utilities
 * 
 * Konvertiert zwischen Schema-Format und Block-Format
 * 
 * @module features/templates/components/utils/schemaConverter
 */

/**
 * Konvertiert Schema defaultStructure zu Block-Array
 * 
 * @param {Object} template - Template im Schema-Format (z.B. { html: '...', subject: '...' })
 * @param {Object} schema - Platform Schema
 * @returns {Array} Block-Array
 */
import type {
  ConverterBlock as Block,
  ConverterSchemaTemplate as SchemaTemplate
} from '../../types'

export function schemaToBlocks(template: Record<string, any>, schema: SchemaTemplate): Block[] {
  if (!schema?.template?.defaultStructure) {
    return []
  }

  const defaultStructure = schema.template.defaultStructure

  return Object.entries(defaultStructure).map(([fieldName, field], index) => ({
    id: `block-${fieldName}`,
    fieldName,
    fieldType: field.type,
    position: index,
    data: {
      value: template[fieldName] || field.default || ''
    }
  }))
}

/**
 * Konvertiert Block-Array zu Schema-Format
 * 
 * @param {Array} blocks - Block-Array
 * @param {Object} schema - Platform Schema
 * @returns {Object} Template im Schema-Format
 */
export function blocksToSchemaFormat(blocks: Block[], schema: SchemaTemplate): Record<string, string> {
  if (!blocks || blocks.length === 0 || !schema?.template?.defaultStructure) {
    return {}
  }

  const defaultStructure = schema.template.defaultStructure
  const template: Record<string, string> = {}

  // Group blocks by fieldName so duplicated blocks are merged (concatenated)
  const byField = new Map<string, Block[]>()
  blocks.forEach((block) => {
    if (!defaultStructure[block.fieldName]) return
    const list = byField.get(block.fieldName) || []
    list.push(block)
    byField.set(block.fieldName, list)
  })
  byField.forEach((blockList, fieldName) => {
    const sorted = blockList.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    template[fieldName] = sorted.map((b) => b.data?.value ?? '').join('')
  })

  // Ensure all schema fields exist
  Object.entries(defaultStructure).forEach(([fieldName, field]) => {
    if (!(fieldName in template)) {
      template[fieldName] = (field as { default?: string }).default ?? ''
    }
  })

  return template
}
