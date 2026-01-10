import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Button,
  useTheme
} from '@mui/material'
import DescriptionIcon from '@mui/icons-material/Description'
import { usePlatformSchema } from '../../hooks/usePlatformSchema'
import SchemaRenderer from '../SchemaRenderer/SchemaRenderer'
import TemplateSelector from '../TemplateEditor/TemplateSelector'
import useStore from '../../store'
import { getTemplateVariables, replaceTemplateVariables } from '../../utils/templateUtils'
import config from '../../config'

function GenericPlatformEditor({ platform, content, onChange, onCopy, isActive, onSelect }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { schema, loading: schemaLoading, error: schemaError } = usePlatformSchema(platform)
  const [platformConfig, setPlatformConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { parsedData, uploadedFileRefs } = useStore()

  // Load platform configuration from backend - NO FALLBACKS
  useEffect(() => {
    if (!platform) return

    const loadPlatformConfig = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load platform data from API
        const response = await fetch(`${config.apiUrl || 'http://localhost:4000'}/api/platforms/${platform}`)
        if (!response.ok) {
          throw new Error(`Failed to load platform config: ${response.status}`)
        }
        const data = await response.json()

        if (!data.success || !data.platform) {
          throw new Error('Invalid platform data received')
        }

        setPlatformConfig(data.platform)
        setError(null)
      } catch (err) {
        console.error(`Failed to load config for ${platform}:`, err)
        setError(err.message)
        // NO FALLBACK - show error instead
        setPlatformConfig(null)
      } finally {
        setLoading(false)
      }
    }

    loadPlatformConfig()
  }, [platform])

  // Calculate character count from content
  const getTextLength = () => {
    if (!content) return 0
    // Sum all text field lengths
    return Object.values(content).reduce((total, value) => {
      if (typeof value === 'string') {
        return total + value.length
      }
      return total
    }, 0)
  }

  const textLength = getTextLength()
  const maxLength = platformConfig?.limits?.maxLength || schema?.editor?.constraints?.maxLength || 1000
  const isValid = textLength <= maxLength && textLength > 0

  if (loading || schemaLoading) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={24} sx={{ mb: 1 }} />
        <Typography variant="body2">{t('status.loadingPlatformConfig', { platform })}</Typography>
      </Paper>
    )
  }

  if (error || schemaError) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 1 }}>
          Failed to load {platform} configuration: {error || schemaError}
          <br />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please ensure the backend server is running and the platform is properly configured.
          </Typography>
        </Alert>
      </Paper>
    )
  }

  if (!platformConfig && !schema) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="warning">
          No configuration available for platform: {platform}
        </Alert>
      </Paper>
    )
  }

  // Handle template selection
  const handleTemplateSelect = (template, filledContent) => {
    // Get template variables from parsed data and uploaded files
    const templateVariables = getTemplateVariables(parsedData, uploadedFileRefs)
    
    // Get template content structure
    const templateContent = template.template || {}
    
    // Apply template to content fields based on platform schema
    const editorSchema = schema?.editor || platformConfig?.schema?.editor
    const editorBlocks = editorSchema?.blocks || []
    
    const newContent = { ...content }
    
    // Replace variables in each field
    editorBlocks.forEach(block => {
      const fieldName = block.id
      const fieldValue = templateContent[fieldName] || templateContent.html || templateContent.text || ''
      
      if (fieldValue) {
        // Replace template variables with actual values
        const replacedValue = replaceTemplateVariables(fieldValue, templateVariables)
        newContent[fieldName] = replacedValue
      }
    })
    
    // If template has direct html/text, apply to first text field
    if (templateContent.html || templateContent.text) {
      const firstTextBlock = editorBlocks.find(b => 
        b.type === 'text' || b.type === 'paragraph' || b.type === 'heading'
      )
      if (firstTextBlock) {
        const templateText = templateContent.html || templateContent.text
        newContent[firstTextBlock.id] = replaceTemplateVariables(templateText, templateVariables)
      }
    }
    
    // Update all fields at once
    Object.keys(newContent).forEach(key => {
      onChange(key, newContent[key])
    })
  }

  // Get current content as string for template selector
  const getCurrentContentString = () => {
    if (!content) return ''
    return Object.values(content).filter(v => typeof v === 'string').join('\n')
  }

  // Use schema-driven editor if available
  const editorSchema = schema?.editor || platformConfig?.schema?.editor
  const editorBlocks = editorSchema?.blocks || []

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        border: `2px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}`,
        cursor: 'pointer'
      }}
      onClick={onSelect}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          📝 {platformConfig?.name || platform} Editor
        </Typography>
        
        {/* Template Selector */}
        <TemplateSelector
          platform={platform}
          onSelectTemplate={handleTemplateSelect}
          currentContent={getCurrentContentString()}
          sx={{ ml: 'auto' }}
        />
      </Box>

      {/* ✅ FULLY SCHEMA-DRIVEN: Render blocks based on schema.rendering config */}
      {editorSchema && editorBlocks.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          {editorBlocks
            .filter(block => block.ui?.enabled !== false)
            .sort((a, b) => (a.ui?.order || 999) - (b.ui?.order || 999))
            .map((block) => {
              // ✅ Use block.rendering config if available, otherwise infer from block.type
              const rendering = block.rendering || {}
              const fieldType = rendering.fieldType || 
                (block.type === 'paragraph' ? 'textarea' : 
                 block.type === 'heading' ? 'text' : 
                 block.type === 'text' ? 'textarea' :
                 block.type)

              // Convert block to field format for SchemaRenderer
              const field = {
                name: block.id,
                type: fieldType,
                label: block.label,
                description: block.description || rendering.placeholder,
                required: block.required,
                placeholder: rendering.placeholder || block.description,
                default: rendering.default,
                validation: block.validation,
                ui: block.ui,
                constraints: block.constraints,
                // Add rendering-specific config
                optionsSource: rendering.optionsSource,
                action: rendering.action
              }

              // ✅ Handle media blocks (image/video) - use file input if fieldType is 'file'
              if ((block.type === 'image' || block.type === 'video') && fieldType === 'file') {
                return (
                  <Box key={block.id} sx={{ mb: 2 }}>
                    <SchemaRenderer
                      fields={[field]}
                      values={content || {}}
                      onChange={(fieldName, value) => onChange(fieldName, value)}
                      errors={{}}
                    />
                  </Box>
                )
              }

              // ✅ Handle hashtag/mention blocks - use multiselect if configured
              if ((block.type === 'hashtag' || block.type === 'mention') && fieldType === 'multiselect') {
                return (
                  <Box key={block.id} sx={{ mb: 2 }}>
                    <SchemaRenderer
                      fields={[field]}
                      values={content || {}}
                      onChange={(fieldName, value) => onChange(fieldName, value)}
                      errors={{}}
                    />
                  </Box>
                )
              }

              // ✅ Render all other blocks using SchemaRenderer (fully generic)
              return (
                <Box key={block.id} sx={{ mb: 2 }}>
                  <SchemaRenderer
                    fields={[field]}
                    values={content || {}}
                    onChange={(fieldName, value) => onChange(fieldName, value)}
                    errors={{}}
                  />
                </Box>
              )
            })}
        </Box>
      ) : (
        // Fallback: Show message if no schema available
        <Alert severity="info" sx={{ mt: 2 }}>
          No editor schema available for this platform. Please configure the platform schema in the backend.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        {maxLength && (
          <Typography
            variant="body2"
            color={textLength > maxLength ? "error" : "text.secondary"}
          >
            Characters: {textLength}/{maxLength}
          </Typography>
        )}
        <Chip
          size="small"
          color={isValid ? "success" : "warning"}
          label={isValid ? t('status.ready') : t('status.draft')}
        />
      </Box>
    </Paper>
  )
}

export default GenericPlatformEditor
