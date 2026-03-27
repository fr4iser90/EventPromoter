/**
 * ImageBlock - Image-Block Komponente
 *
 * Block für type: 'image' – URL oder Variable {image} für Bild im Template.
 *
 * @module features/templates/components/VisualBuilder/blocks/ImageBlock
 */

import React from 'react'
import { TextField, Typography, Box, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { BlockRendererBlock as TemplateBlock, TemplateFieldSchema as FieldSchema } from '../../../types'

function ImageBlock({
  block,
  fieldSchema,
  isSelected,
  onUpdate,
  onInsertVariable
}: {
  block: TemplateBlock
  fieldSchema: FieldSchema
  isSelected: boolean
  onUpdate: (data: Record<string, unknown>) => void
  onInsertVariable: (variable: string) => void
}) {
  const { t } = useTranslation()
  void isSelected
  const translatedLabel = fieldSchema?.label
    ? t(fieldSchema.label, { defaultValue: fieldSchema.label })
    : t('template.imageBlockLabel', { defaultValue: 'Image' })
  const translatedDescription = fieldSchema?.description
    ? t(fieldSchema.description, { defaultValue: fieldSchema.description })
    : ''
  const translatedPlaceholder = fieldSchema?.placeholder
    ? t(fieldSchema.placeholder, { defaultValue: fieldSchema.placeholder })
    : t('template.imageBlockPlaceholder', { defaultValue: 'URL or {image}' })

  const value = (block.data?.value as string) || ''
  const isUrl = value && !value.startsWith('{') && (value.startsWith('http') || value.startsWith('/'))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ value: e.target.value })
  }

  const handleInsertImageVar = () => {
    onInsertVariable('image')
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
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          size="small"
          value={value}
          onChange={handleChange}
          placeholder={translatedPlaceholder}
          variant="outlined"
          sx={{ flex: 1, minWidth: 200 }}
        />
        <Button size="small" variant="outlined" onClick={handleInsertImageVar}>
          {t('template.insertImageVar', { defaultValue: 'Insert {image}' })}
        </Button>
      </Box>
      {isUrl && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {t('template.preview', { defaultValue: 'Preview' })}
          </Typography>
          <Box
            component="img"
            src={value}
            alt=""
            sx={{
              maxWidth: '100%',
              maxHeight: 200,
              objectFit: 'contain',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1
            }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </Box>
      )}
    </Box>
  )
}

export default ImageBlock
