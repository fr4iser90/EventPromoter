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
  const translatedLabel = fieldSchema.label
    ? t(fieldSchema.label, { defaultValue: fieldSchema.label })
    : ''
  const translatedDescription = fieldSchema.description
    ? t(fieldSchema.description, { defaultValue: fieldSchema.description })
    : ''
  const translatedPlaceholder = fieldSchema.placeholder
    ? t(fieldSchema.placeholder, { defaultValue: fieldSchema.placeholder })
    : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ value: e.target.value })
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
        {translatedLabel}
      </Typography>
      {translatedDescription && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {translatedDescription}
        </Typography>
      )}
      <TextField
        fullWidth
        multiline
        minRows={4}
        value={block.data.value || ''}
        onChange={handleChange}
        placeholder={translatedPlaceholder || t('template.enterText')}
        variant="outlined"
        size="small"
      />
    </Box>
  )
}

export default TextBlock
