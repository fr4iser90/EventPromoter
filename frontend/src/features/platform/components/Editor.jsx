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
  TextField,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import DescriptionIcon from '@mui/icons-material/Description'
import CloseIcon from '@mui/icons-material/Close'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import FileSelectionBlock from './blocks/FileSelectionBlock'
import { usePlatformSchema } from '../hooks/usePlatformSchema'
import SchemaRenderer from '../../schema/components/Renderer'
import CompositeRenderer from '../../schema/components/CompositeRenderer'
import { Selector as TemplateSelector } from '../../templates'
import { useTemplates } from '../../templates/hooks/useTemplates'
import useStore from '../../../store'
import { 
  getTemplateVariables, 
  replaceTemplateVariables, 
  extractTemplateVariables,
  isAutoFilledVariable,
  getVariableLabel
} from '../../../shared/utils/templateUtils'
import { getLocaleDisplayName, getValidLocale } from '../../../shared/utils/localeUtils'
import config from '../../../config'
import { getApiUrl, getFileUrl } from '../../../shared/utils/api'

function GenericPlatformEditor({ platform, content, onChange, onCopy, isActive, onSelect, onBatchChange }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const { schema, loading: schemaLoading, error: schemaError } = usePlatformSchema(platform)
  const { templates, getTemplate } = useTemplates(platform)
  const [platformConfig, setPlatformConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { parsedData, uploadedFileRefs } = useStore()
  // Track original content with variables for undo functionality
  const [originalContentWithVars, setOriginalContentWithVars] = useState({})
  // CRITICAL: Track _var_ fields separately - they persist even if variable is replaced in content
  const [persistentVarFields, setPersistentVarFields] = useState(new Set())
  // Track active template and disabled variables
  const [activeTemplate, setActiveTemplate] = useState(null)
  const [disabledVariables, setDisabledVariables] = useState(new Set())
  const [hideAutoFilled, setHideAutoFilled] = useState(true) // Hide auto-filled variables by default
  const [targetsExpanded, setTargetsExpanded] = useState(false) // For collapsible targets summary
  const [translatedTemplateNames, setTranslatedTemplateNames] = useState({}) // Cache for translated template names

  // ✅ Translate template names based on current language
  useEffect(() => {
    const translateTemplateNames = async () => {
      if (!content?._templates || !Array.isArray(content._templates)) {
        setTranslatedTemplateNames({})
        return
      }

      const translations = {}
      const currentLang = i18n.language.split('-')[0] // 'de-DE' -> 'de'

      for (const templateEntry of content._templates) {
        if (!templateEntry.templateId) {
          translations[templateEntry.id] = templateEntry.templateName || templateEntry.templateId
          continue
        }

        try {
          const template = await getTemplate(templateEntry.templateId)
          if (template) {
            // Check if template has translations
            const templateTranslations = template.translations
            if (templateTranslations && currentLang !== 'en' && templateTranslations[currentLang]) {
              // Use translated name if available
              translations[templateEntry.id] = templateTranslations[currentLang].name || templateEntry.templateName
            } else {
              // Fallback to stored name or template.name
              translations[templateEntry.id] = templateEntry.templateName || template.name || templateEntry.templateId
            }
          } else {
            // Template not found, use stored name
            translations[templateEntry.id] = templateEntry.templateName || templateEntry.templateId
          }
        } catch (error) {
          // Error loading template, use stored name
          translations[templateEntry.id] = templateEntry.templateName || templateEntry.templateId
        }
      }

      setTranslatedTemplateNames(translations)
    }

    translateTemplateNames()
  }, [content?._templates, i18n.language, getTemplate])

  // Get available images for image selection (memoized to prevent hook issues)
  const availableImages = useMemo(() => {
    return uploadedFileRefs.filter(file => file.isImage || file.type?.startsWith('image/'))
  }, [uploadedFileRefs])


  // CRITICAL: Track _var_ fields separately - update persistentVarFields when _var_ fields change
  useEffect(() => {
    if (!content) {
      setPersistentVarFields(new Set())
      return
    }

    const newPersistentVars = new Set()
    Object.keys(content).forEach(key => {
      if (key.startsWith('_var_')) {
        const varName = key.replace('_var_', '')
        const varValue = content[key]
        
        // If _var_ field has ANY value, add to persistent set
        if (varValue !== null && varValue !== undefined && String(varValue).length > 0) {
          newPersistentVars.add(varName)
        }
      }
    })
    
    setPersistentVarFields(newPersistentVars)
  }, [content])


  // Load platform configuration from backend - NO FALLBACKS
  useEffect(() => {
    if (!platform) return

    const loadPlatformConfig = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load platform data from API
        const response = await fetch(getApiUrl(`platforms/${platform}`))
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

  // Sync disabled variables from content on mount/update
  // MUST be before early returns to ensure consistent hook order
  useEffect(() => {
    const disabled = new Set()
    if (content) {
      Object.keys(content).forEach(key => {
        if (key.startsWith('_disabled_') && content[key] === true) {
          const varName = key.replace('_disabled_', '')
          disabled.add(varName)
        }
      })
    }
    setDisabledVariables(disabled)
  }, [content])

  // Restore active template from content._templateId when content loads
  useEffect(() => {
    if (!platform || !content?._templateId || activeTemplate) return
    
    let cancelled = false
    getTemplate(content._templateId).then(template => {
      if (!cancelled && template) {
        setActiveTemplate(template)
      }
    }).catch(() => {
      // Ignore errors
    })
    
    return () => {
      cancelled = true
    }
  }, [platform, content?._templateId, activeTemplate, getTemplate])

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

  // Handle template selection - NOW USES BACKEND API
  const handleTemplateSelect = async (template, filledContent, targetsValue = null, specificFiles = []) => {
    try {
      // Store active template (for UI)
      setActiveTemplate(template)
      
      // ✅ Call backend API to map template to editor content
      // This removes all mapping logic from frontend!
      const response = await fetch(
        getApiUrl(`templates/${platform}/${template.id}/apply`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            templateId: template.id,
            parsedData: parsedData || null,
            uploadedFileRefs: uploadedFileRefs || [],
            existingContent: content || {}
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to apply template: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to apply template')
      }

      // Backend returns mapped content - use it directly!
      const mappedContent = result.content

      // Store original content with variables for undo (extract from template)
      const templateContent = template.template || {}
      const originalContent = {}
      Object.keys(templateContent).forEach(key => {
        if (typeof templateContent[key] === 'string') {
          originalContent[key] = templateContent[key]
        }
      })
      setOriginalContentWithVars(originalContent)

      // Update all fields at once
      const updatedContent = { ...content, ...mappedContent }

      // ✅ Save targets value if provided (from template modal), or use default 'all'
      const targetsBlock = editorSchema?.blocks?.find(block => block.type === 'targets')
      if (targetsBlock) {
        // Use provided targetsValue, or default to 'all' if nothing selected
        // ✅ Remove templateLocale from targetsValue before saving to content[targetsBlock.id]
        // templateLocale should only be stored in _templates[].targets.templateLocale
        const targetsForContent = targetsValue ? { ...targetsValue } : { mode: 'all' }
        delete targetsForContent.templateLocale
        updatedContent[targetsBlock.id] = targetsForContent
      }

      // ✅ GENERIC: Resolve target names using schema endpoints (no platform-specific logic!)
      // ✅ Spread targetsValue to preserve ALL properties including templateLocale
      let resolvedTargets = targetsValue ? { ...targetsValue } : null
      
      if (resolvedTargets && targetsBlock) {
        const dataEndpoints = targetsBlock.rendering?.dataEndpoints || {}
        
        // ✅ PRESERVE templateLocale before any modifications
        const preservedTemplateLocale = resolvedTargets.templateLocale
        
        try {
          // Resolve individual target names
          if (resolvedTargets.mode === 'individual' && resolvedTargets.individual && dataEndpoints.recipients) {
            const endpoint = dataEndpoints.recipients.replace(':platformId', platform)
            const response = await fetch(getApiUrl(endpoint))
            if (response.ok) {
              const data = await response.json()
              const options = data.options || [] // Backend liefert bereits options mit {label, value}!
              
              // Create ID -> label mapping (GENERIC!)
              const idToLabel = new Map(options.map(opt => [opt.value, opt.label]))
              resolvedTargets.targetNames = resolvedTargets.individual.map(id => 
                idToLabel.get(id) || id
              )
            }
          }
          
          // Resolve group names
          if (resolvedTargets.mode === 'groups' && resolvedTargets.groups && dataEndpoints.recipientGroups) {
            const endpoint = dataEndpoints.recipientGroups.replace(':platformId', platform)
            const response = await fetch(getApiUrl(endpoint))
            if (response.ok) {
              const data = await response.json()
              const groups = data.groups || []
              // Handle both array and object format
              const groupsArray = Array.isArray(groups) ? groups : Object.values(groups)
              const idToName = new Map(groupsArray.map(g => [g.id, g.name || g.id]))
              resolvedTargets.groupNames = resolvedTargets.groups.map(id => 
                idToName.get(id) || id
              )
            }
          }
          
          // For 'all' mode, load all targets to show names
          if (resolvedTargets.mode === 'all' && dataEndpoints.recipients) {
            const endpoint = dataEndpoints.recipients.replace(':platformId', platform)
            const response = await fetch(getApiUrl(endpoint))
            if (response.ok) {
              const data = await response.json()
              const options = data.options || []
              resolvedTargets.targetNames = options.map(opt => opt.label || opt.value)
            }
          }
          
          // ✅ RESTORE templateLocale if it was lost during modifications
          if (preservedTemplateLocale) {
            resolvedTargets.templateLocale = preservedTemplateLocale
          }
        } catch (err) {
          console.warn('Failed to resolve target names:', err)
          // ✅ RESTORE templateLocale even if there was an error
          if (preservedTemplateLocale) {
            resolvedTargets.templateLocale = preservedTemplateLocale
          }
        }
      }

      // ✅ Add to _templates array (multiple templates with targets)
      const existingTemplates = content._templates || []
      const newTemplateEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Simple unique ID
        templateId: template.id,
        templateName: template.name || template.id,
        targets: resolvedTargets, // Use resolved targets with names
        specificFiles: specificFiles, // NEW: Specific files for this run
        appliedAt: new Date().toISOString()
      }
      updatedContent._templates = [...existingTemplates, newTemplateEntry]

      // Always ensure _templateId is set first (for backward compatibility)
      if (mappedContent._templateId) {
        onChange('_templateId', mappedContent._templateId)
      }

      // If onBatchChange is available, use it to set all fields at once
      if (onBatchChange) {
        onBatchChange(updatedContent)
      } else {
        // Set all fields individually (including _templateId)
        Object.keys(updatedContent).forEach(key => {
          if (updatedContent[key] !== undefined && updatedContent[key] !== null) {
            onChange(key, updatedContent[key])
          }
        })
      }
    } catch (error) {
      console.error('Failed to apply template:', error)
      // Show error to user (you might want to add a toast/alert here)
      setError(error.message || 'Failed to apply template')
    }
  }
  
  // Handle disabling/enabling a template variable
  const handleToggleVariable = (variableName) => {
    const newDisabled = new Set(disabledVariables)
    if (newDisabled.has(variableName)) {
      newDisabled.delete(variableName)
      // Remove disabled flag from content
      onChange(`_disabled_${variableName}`, false)
    } else {
      newDisabled.add(variableName)
      // Set disabled flag in content
      onChange(`_disabled_${variableName}`, true)
    }
    setDisabledVariables(newDisabled)
  }

  // Get current content as string for template selector
  const getCurrentContentString = () => {
    if (!content) return ''
    return Object.values(content).filter(v => typeof v === 'string').join('\n')
  }

  // Render image selector for image fields
  const renderImageSelector = (block, field) => {
    const fieldValue = content?.[block.id]
    const imageUrl = fieldValue ? getFileUrl(fieldValue) : null

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
              const imgUrl = getFileUrl(img.url)
              return imgUrl === selected || img.url === selected
            })
            return selectedFile ? selectedFile.name : 'Selected image'
          }}
        >
          <MenuItem value="">
            <em>No image</em>
          </MenuItem>
          {availableImages.map((file, index) => {
            const fileUrl = getFileUrl(file.url)
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
          globalFiles={content?.globalFiles || []}
          sx={{ ml: 'auto' }}
        />
      </Box>

      {/* ✅ All Template+Targets Combinations (shown when templates are applied) */}
      {(() => {
        const targetsBlock = editorBlocks.find(block => block.type === 'targets')
        const templates = content?._templates || []
        
        if (!targetsBlock || templates.length === 0) return null

        // Helper to format targets summary - uses names from backend if available
        const formatTargetsSummary = (targets) => {
          if (!targets || Object.keys(targets).length === 0) return 'No targets'
          
          const mode = targets.mode || 'all'
          if (mode === 'all') {
            // For 'all' mode, show resolved target names from backend
            const names = targets.targetNames || []
            return `All recipients: ${names.join(', ')}`
          } else if (mode === 'groups') {
            const groups = targets.groups || []
            // Use groupNames if available (resolved by backend), otherwise use IDs
            const groupNames = targets.groupNames || groups
            return `${groups.length} group(s): ${groupNames.join(', ')}`
          } else if (mode === 'individual') {
            const individuals = targets.individual || []
            // Use targetNames if available (resolved by backend), otherwise use IDs
            const targetNames = targets.targetNames || individuals
            const displayNames = targetNames.slice(0, 3)
            const remaining = targetNames.length > 3 ? '...' : ''
            return `${individuals.length} single: ${displayNames.join(', ')}${remaining}`
          }
          return 'Targets configured'
        }

        return (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              {t('editor.appliedTemplates')}
            </Typography>
            {templates.map((templateEntry, index) => (
              <Box
                key={templateEntry.id || index}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.default',
                  mb: 1,
                  p: 1.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {translatedTemplateNames[templateEntry.id] || templateEntry.templateName || templateEntry.templateId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {t('editor.targets')} {formatTargetsSummary(templateEntry.targets)}
                    </Typography>
                    {/* ✅ Show Language always - if templateLocale is missing, show Error */}
                    {(() => {
                      const templateLocale = templateEntry.targets?.templateLocale || 
                                           (targetsBlock && content?.[targetsBlock.id]?.templateLocale)
                      return (
                        <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5 }}>
                          Language: {templateLocale 
                            ? getLocaleDisplayName(getValidLocale(templateLocale))
                            : 'Error'
                          }
                        </Typography>
                      )
                    })()}
                    {(templateEntry.specificFiles?.length > 0 || (content?.globalFiles?.length > 0)) && (
                      <Typography variant="caption" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <AttachFileIcon sx={{ fontSize: '0.8rem' }} />
                        {templateEntry.specificFiles?.length || 0} {t('editor.specificFiles')}, {content?.globalFiles?.length || 0} {t('editor.standardFiles')}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Remove this template entry
                      const updatedTemplates = templates.filter((_, i) => i !== index)
                      onChange('_templates', updatedTemplates)
                    }}
                    sx={{ ml: 1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )
      })()}

      {/* ✅ Template Variables: Show template variables as separate fields */}
      {activeTemplate && (() => {
        
        const templateVars = extractTemplateVariables(activeTemplate)
        const templateVariables = getTemplateVariables(parsedData, uploadedFileRefs)
        
        // Show ALL variables from template.variables array (no filtering)
        const displayVars = templateVars
        
        if (displayVars.length === 0) return null
        
        return (
          <Box sx={{ mt: 2, mb: 2 }}>
            {/* Checkbox to hide/show auto-filled variables */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={hideAutoFilled}
                  onChange={(e) => setHideAutoFilled(e.target.checked)}
                  size="small"
                />
              }
              label={t('editor.hideAutoFilledVariables')}
              sx={{ mb: 1 }}
            />
            
            {displayVars.map(varName => {
              const varValue = content?.[`_var_${varName}`] || templateVariables[varName] || ''
              const isDisabled = disabledVariables.has(varName)
              const isAutoFilled = isAutoFilledVariable(varName, parsedData)
              const { label, icon } = getVariableLabel(varName)
              
              // Hide auto-filled variables if checkbox is checked
              if (hideAutoFilled && isAutoFilled && !isDisabled) return null
              
              // Check if this is an image variable
              const isImageVar = /^(img|image)\d*$/i.test(varName) || varName === 'image'
              
              return (
                <Box key={varName} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {icon} {label}:
                    </Typography>
                    {isAutoFilled && (
                      <IconButton
                        size="small"
                        onClick={() => handleToggleVariable(varName)}
                        sx={{ 
                          ml: 'auto',
                          color: isDisabled ? 'text.disabled' : 'text.secondary',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        title={isDisabled ? 'Enable field' : 'Disable field'}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  {isImageVar ? (
                    // Image selector dropdown
                    <FormControl fullWidth size="small" disabled={isDisabled}>
                      <Select
                        value={varValue || ''}
                        onChange={(e) => {
                          if (!isAutoFilled) {
                            onChange(`_var_${varName}`, e.target.value)
                          }
                        }}
                        renderValue={(selected) => {
                          if (!selected) return 'No image selected'
                          const selectedFile = availableImages.find(img => {
                            const imgUrl = getFileUrl(img.url)
                            return imgUrl === selected || img.url === selected || img.url === getFileUrl(selected)
                          })
                          if (selectedFile) {
                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  src={getFileUrl(selectedFile.url)}
                                  alt={selectedFile.name}
                                  variant="rounded"
                                  sx={{ width: 24, height: 24 }}
                                />
                                <Typography variant="body2">{selectedFile.name}</Typography>
                              </Box>
                            )
                          }
                          return 'Selected image'
                        }}
                        sx={{
                          '& .MuiInputBase-root': {
                            bgcolor: isDisabled ? 'action.disabledBackground' : 'background.paper',
                            opacity: isDisabled ? 0.6 : 1
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>{t('editor.noImage')}</em>
                        </MenuItem>
                        {availableImages.map((file, index) => {
                          const fileUrl = getFileUrl(file.url)
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
                    </FormControl>
                  ) : (
                    // Text field for non-image variables
                    <TextField
                      fullWidth
                      size="small"
                      value={varValue}
                      disabled={isDisabled}
                      onChange={(e) => {
                        // Allow manual editing if not auto-filled
                        if (!isAutoFilled) {
                          onChange(`_var_${varName}`, e.target.value)
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          bgcolor: isDisabled ? 'action.disabledBackground' : 'background.paper',
                          opacity: isDisabled ? 0.6 : 1
                        }
                      }}
                      InputProps={{
                        readOnly: isAutoFilled && !isDisabled
                      }}
                    />
                  )}
                </Box>
              )
            })}
          </Box>
        )
      })()}

      {/* ✅ Editor Blocks (Generic) */}
      {editorBlocks.map(block => {
        if (block.type === 'file_selection_input') {
          return (
            <FileSelectionBlock
              key={block.id || block.type}
              block={block}
              content={content}
              onChange={onChange}
              uploadedFileRefs={uploadedFileRefs}
            />
          );
        }
        return null;
      })}

      {/* Template-based editing only - no editorBlocks */}
      {!activeTemplate && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please select a template to start editing. All content is managed through templates.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        {maxLength && (
          <Typography
            variant="body2"
            color={textLength > maxLength ? "error" : "text.secondary"}
          >
            {t('editor.characters')} {textLength}/{maxLength}
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
