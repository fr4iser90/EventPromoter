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
export function schemaToBlocks(template, schema) {
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
export function blocksToSchemaFormat(blocks, schema) {
  if (!blocks || blocks.length === 0 || !schema?.template?.defaultStructure) {
    return {}
  }

  const template = {}
  
  blocks.forEach(block => {
    if (schema.template.defaultStructure[block.fieldName]) {
      template[block.fieldName] = block.data.value || ''
    }
  })

  // Stelle sicher, dass alle Schema-Felder vorhanden sind
  Object.entries(schema.template.defaultStructure).forEach(([fieldName, field]) => {
    if (!(fieldName in template)) {
      template[fieldName] = field.default || ''
    }
  })

  return template
}
