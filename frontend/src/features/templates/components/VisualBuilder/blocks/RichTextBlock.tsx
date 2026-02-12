/**
 * RichTextBlock - Rich-Text-Block Komponente
 * 
 * Rich-Text-Block für type: 'html' oder 'rich'
 * Unterstützt visuelles Bearbeiten mit React-Quill
 * 
 * @module features/templates/components/VisualBuilder/blocks/RichTextBlock
 */

import React, { useMemo } from 'react'
import { Typography, Box, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import type { RichTextBlockProps } from '../../../types'

/**
 * RichTextBlock Komponente
 */
function RichTextBlock({ block, fieldSchema, isSelected, onUpdate, onInsertVariable }: RichTextBlockProps) {
  const { t } = useTranslation()
  const [editorMode, setEditorMode] = React.useState<'visual' | 'code'>('visual') // 'visual' or 'code'

  const handleChange = (value: string) => {
    onUpdate({ value })
  }

  // Extrahiere Variablen aus dem Content
  const extractVariables = (content: string) => {
    if (!content) return []
    const matches = content.match(/\{([^}]+)\}/g) || []
    return [...new Set(matches.map((m: string) => m.slice(1, -1)))]
  }

  const variables = extractVariables(block.data.value || '')

  // React-Quill Module Konfiguration
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link'],
        ['clean']
      ],
      handlers: {
        // Custom handler für Variablen-Einfügen könnte hier hinzugefügt werden
      }
    }
  }), [])

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link'
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
          {fieldSchema.label}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {variables.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {variables.map((varName) => (
                <Chip
                  key={varName}
                  label={`{${varName}}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          )}
          {fieldSchema.type === 'html' && (
            <ToggleButtonGroup
              value={editorMode}
              exclusive
              onChange={(e, value) => {
                if (value !== null) {
                  setEditorMode(value)
                }
              }}
              size="small"
            >
              <ToggleButton value="visual">
                {t('template.visual', { defaultValue: 'Visual' })}
              </ToggleButton>
              <ToggleButton value="code">
                {t('template.code', { defaultValue: 'Code' })}
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      </Box>
      {fieldSchema.description && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {fieldSchema.description}
        </Typography>
      )}
      
      {editorMode === 'visual' ? (
        <Box sx={{ 
          '& .quill': {
            bgcolor: 'background.paper',
          },
          '& .ql-container': {
            minHeight: '300px',
            fontSize: '14px',
          },
          '& .ql-editor': {
            minHeight: '300px',
          }
        }}>
          <ReactQuill
            theme="snow"
            value={block.data.value || ''}
            onChange={handleChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder={fieldSchema.placeholder || t('template.enterContent', { defaultValue: 'Enter content... Use {variable} for dynamic content' })}
          />
        </Box>
      ) : (
        <Box>
          <textarea
            value={block.data.value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldSchema.placeholder || t('template.enterContent', { defaultValue: 'Enter content... Use {variable} for dynamic content' })}
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical',
            }}
          />
        </Box>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {t('template.variablesHint', { defaultValue: 'Use variables in curly braces, e.g., {title}, {date}' })}
      </Typography>
    </Box>
  )
}

export default RichTextBlock
