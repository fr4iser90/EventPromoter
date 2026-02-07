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
function TextBlock({ block, fieldSchema, isSelected, onUpdate, onInsertVariable }) {
  const { t } = useTranslation()

  const handleChange = (e) => {
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
        placeholder={fieldSchema.placeholder || t('template.enterText', { defaultValue: 'Enter text...' })}
        variant="outlined"
        size="small"
      />
    </Box>
  )
}

export default TextBlock
