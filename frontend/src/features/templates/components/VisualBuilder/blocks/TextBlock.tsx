/**
 * TextBlock - Text-Block Komponente
 * 
 * Einfacher Text-Block für type: 'text' oder 'textarea'
 * 
 * @module features/templates/components/VisualBuilder/blocks/TextBlock
 */

import React from 'react'
import { TextField, Typography, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { BlockRendererBlock as TemplateBlock, TemplateFieldSchema as FieldSchema } from '../../../types'

/**
 * TextBlock Komponente
 * 
 * @param {Object} props
 * @param {Object} props.block - Block-Daten
 * @param {Object} props.fieldSchema - Schema für dieses Feld
 * @param {boolean} props.isSelected - Ist Block ausgewählt?
 * @param {Function} props.onUpdate - Callback für Updates
 * @param {Function} props.onInsertVariable - Callback für Variable-Einfügen
 */
function TextBlock({
  block,
  fieldSchema,
  isSelected,
  onUpdate,
  onInsertVariable
}: {
  block: TemplateBlock
  fieldSchema: FieldSchema
  isSelected: boolean
  onUpdate: (data: { value: string }) => void
  onInsertVariable: (variable: string) => void
}) {
  const { t } = useTranslation()
  void isSelected
  void onInsertVariable

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ value: e.target.value })
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
        {fieldSchema.label}
      </Typography>
      {fieldSchema.description && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {fieldSchema.description}
        </Typography>
      )}
      <TextField
        fullWidth
        multiline
        minRows={4}
        value={block.data.value || ''}
        onChange={handleChange}
        placeholder={fieldSchema.placeholder || t('template.enterText')}
        variant="outlined"
        size="small"
      />
    </Box>
  )
}

export default TextBlock
