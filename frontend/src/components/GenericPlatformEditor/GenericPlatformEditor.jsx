import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Button,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Avatar,
  TextField
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import DescriptionIcon from '@mui/icons-material/Description'
import { usePlatformSchema } from '../../hooks/usePlatformSchema'
import SchemaRenderer from '../SchemaRenderer/SchemaRenderer'
import TemplateSelector from '../TemplateEditor/TemplateSelector'
import useStore from '../../store'
import { getTemplateVariables, replaceTemplateVariables, getUnfulfilledVariables } from '../../utils/templateUtils'
import config from '../../config'

function GenericPlatformEditor({ platform, content, onChange, onCopy, isActive, onSelect, onBatchChange }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { schema, loading: schemaLoading, error: schemaError } = usePlatformSchema(platform)
  const [platformConfig, setPlatformConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { parsedData, uploadedFileRefs } = useStore()
  const [unfulfilledVarsOpen, setUnfulfilledVarsOpen] = useState(false)
  const [unfulfilledVariables, setUnfulfilledVariables] = useState({})

  // Get available images for image selection (memoized to prevent hook issues)
  const availableImages = useMemo(() => {
    return uploadedFileRefs.filter(file => file.isImage || file.type?.startsWith('image/'))
  }, [uploadedFileRefs])

  // Check for unfulfilled template variables in content
  useEffect(() => {
    if (!content) {
      setUnfulfilledVariables({})
      setUnfulfilledVarsOpen(false)
      return
    }

    const templateVariables = getTemplateVariables(parsedData, uploadedFileRefs)
    const unfulfilled = {}
    const allMissingVars = new Set()

    // Check all content fields for unfulfilled variables
    Object.entries(content).forEach(([fieldName, fieldValue]) => {
      if (typeof fieldValue === 'string') {
        const missing = getUnfulfilledVariables(fieldValue, templateVariables)
        if (missing.length > 0) {
          unfulfilled[fieldName] = missing
          missing.forEach(v => allMissingVars.add(v))
        }
      }
    })

    setUnfulfilledVariables(unfulfilled)
    // Auto-expand if there are unfulfilled variables
    if (allMissingVars.size > 0) {
      setUnfulfilledVarsOpen(true)
    } else {
      setUnfulfilledVarsOpen(false)
    }
  }, [content, parsedData, uploadedFileRefs])

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
      // Check for exact field match first, then fallback to html/text
      let fieldValue = templateContent[fieldName]
      
      // If no exact match, check for common field name mappings
      if (!fieldValue) {
        // Map common template fields to editor blocks
        if (fieldName === 'body' && (templateContent.html || templateContent.text)) {
          fieldValue = templateContent.html || templateContent.text
        } else if (fieldName === 'subject' && templateContent.subject) {
          fieldValue = templateContent.subject
        } else if (fieldName === 'text' && (templateContent.text || templateContent.html)) {
          fieldValue = templateContent.text || templateContent.html
        }
      }
      
      if (fieldValue) {
        // Replace template variables with actual values
        const replacedValue = replaceTemplateVariables(fieldValue, templateVariables)
        newContent[fieldName] = replacedValue
      }
    })
    
    // Fallback: If template has html/text but no body block found, apply to first paragraph/text block
    if ((templateContent.html || templateContent.text) && !newContent.body) {
      const firstTextBlock = editorBlocks.find(b => 
        (b.type === 'paragraph' || b.type === 'text') && b.id !== 'subject'
      )
      if (firstTextBlock) {
        const templateText = templateContent.html || templateContent.text
        newContent[firstTextBlock.id] = replaceTemplateVariables(templateText, templateVariables)
      }
    }
    
    // Debug: Log what we're setting
    if (process.env.NODE_ENV === 'development') {
      console.log('[TemplateSelector] Applying template:', {
        templateContent,
        newContent,
        editorBlocks: editorBlocks.map(b => ({ id: b.id, type: b.type })),
        currentContent: content
      })
    }
    
    // Collect all fields to update
    const fieldsToUpdate = {}
    Object.keys(newContent).forEach(key => {
      if (newContent[key] !== undefined && newContent[key] !== null && newContent[key] !== '') {
        fieldsToUpdate[key] = newContent[key]
      }
    })
    
    // Also explicitly set fields from template that might have been mapped
    editorBlocks.forEach(block => {
      const fieldName = block.id
      if (newContent[fieldName] !== undefined && newContent[fieldName] !== null && newContent[fieldName] !== '') {
        fieldsToUpdate[fieldName] = newContent[fieldName]
      }
    })
    
    // Debug: Log what we're about to update
    if (process.env.NODE_ENV === 'development') {
      console.log('[TemplateSelector] Updating fields:', fieldsToUpdate)
    }
    
    // Update all fields at once by merging with current content
    // This ensures all fields are set in one operation
    const updatedContent = { ...content, ...fieldsToUpdate }
    
    // If onBatchChange is available, use it to set all fields at once
    // Otherwise, fall back to individual onChange calls
    if (onBatchChange) {
      onBatchChange(updatedContent)
    } else {
      // Set all fields - call onChange for each field
      // Note: This might cause race conditions if onChange uses stale closures
      Object.keys(fieldsToUpdate).forEach(key => {
        onChange(key, updatedContent[key])
      })
    }
  }

  // Get current content as string for template selector
  const getCurrentContentString = () => {
    if (!content) return ''
    return Object.values(content).filter(v => typeof v === 'string').join('\n')
  }

  // Render image selector for image fields
  const renderImageSelector = (block, field) => {
    const fieldValue = content?.[block.id]
    const imageUrl = fieldValue?.startsWith('http') ? fieldValue : fieldValue ? `http://localhost:4000${fieldValue}` : null

    return (
      <FormControl key={block.id} fullWidth sx={{ mb: 2 }}>
        <InputLabel>{block.label}</InputLabel>
        <Select
          value={fieldValue || ''}
          onChange={(e) => onChange(block.id, e.target.value)}
          label={block.label}
          renderValue={(selected) => {
            if (!selected) return 'No image selected'
            const selectedFile = availableImages.find(img => {
              const imgUrl = img.url?.startsWith('http') ? img.url : `http://localhost:4000${img.url}`
              return imgUrl === selected || img.url === selected
            })
            return selectedFile ? selectedFile.name : 'Selected image'
          }}
        >
          <MenuItem value="">
            <em>No image</em>
          </MenuItem>
          {availableImages.map((file, index) => {
            const fileUrl = file.url?.startsWith('http') ? file.url : `http://localhost:4000${file.url}`
            return (
              <MenuItem key={index} value={fileUrl}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={fileUrl}
                    alt={file.name}
                    variant="rounded"
                    sx={{ width: 40, height: 40 }}
                  />
                  <Typography variant="body2">{file.name}</Typography>
                </Box>
              </MenuItem>
            )
          })}
        </Select>
        {block.description && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {block.description}
          </Typography>
        )}
      </FormControl>
    )
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

              // ✅ Handle image blocks - use image selector if images are available
              if (block.type === 'image') {
                if (availableImages.length > 0) {
                  return renderImageSelector(block, field)
                } else {
                  // No images uploaded - don't show anything
                  return null
                }
              }

              // ✅ Handle video blocks - use file input
              if (block.type === 'video' && fieldType === 'file') {
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

      {/* Dynamic Template Variables Section */}
      {Object.keys(unfulfilledVariables).length > 0 && (
        <Box sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              ⚠️ Additional Template Variables Required
            </Typography>
            <IconButton
              size="small"
              onClick={() => setUnfulfilledVarsOpen(!unfulfilledVarsOpen)}
            >
              {unfulfilledVarsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            These variables are used in your template but haven't been filled yet. Please provide values:
          </Typography>
          
          <Collapse in={unfulfilledVarsOpen}>
            <Box sx={{ mt: 2 }}>
              {(() => {
                // Collect all unique variables across all fields
                const allVars = new Set()
                Object.values(unfulfilledVariables).forEach(vars => {
                  vars.forEach(v => allVars.add(v))
                })
                const uniqueVars = Array.from(allVars)

                return (
                  <>
                    {/* Show all unique variables once */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {uniqueVars.map((varName) => (
                        <Chip key={varName} label={`{${varName}}`} size="small" color="warning" />
                      ))}
                    </Box>
                    {/* Show input fields for each unique variable */}
                    {uniqueVars.map((varName) => (
                      <TextField
                        key={varName}
                        fullWidth
                        label={`${varName} (for {${varName}})`}
                        placeholder={`Enter value for ${varName}...`}
                        value={content?.[`_var_${varName}`] || ''}
                        onChange={(e) => {
                          const newValue = e.target.value
                          onChange(`_var_${varName}`, newValue)
                          
                          // Auto-replace in ALL fields that contain this variable
                          Object.keys(unfulfilledVariables).forEach(fieldName => {
                            if (unfulfilledVariables[fieldName].includes(varName)) {
                              const fieldValue = content?.[fieldName]
                              if (typeof fieldValue === 'string') {
                                const updatedValue = fieldValue.replace(
                                  new RegExp(`\\{${varName}\\}`, 'g'),
                                  newValue
                                )
                                onChange(fieldName, updatedValue)
                              }
                            }
                          })
                        }}
                        sx={{ mb: 1 }}
                        size="small"
                      />
                    ))}
                  </>
                )
              })()}
            </Box>
          </Collapse>
        </Box>
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
