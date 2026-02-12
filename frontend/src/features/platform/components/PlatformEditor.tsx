import { useState, useEffect, useMemo } from 'react'
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
import { TemplateSelector } from '../../templates'
import { useTemplates } from '../../templates/hooks/useTemplates'
import useStore from '../../../store'
import { 
  getTemplateVariables
} from '../../../shared/utils/templateUtils'
import { getLocaleDisplayName, getValidLocale } from '../../../shared/utils/localeUtils'
import config from '../../../config'
import { getApiUrl, getFileUrl } from '../../../shared/utils/api'
import { usePlatformTranslations } from '../hooks/usePlatformTranslations'
import type {
  ContentState,
  EditorBlock,
  EditorSchema,
  GenericRecord,
  PlatformConfig,
  PlatformTemplateRecord as TemplateRecord,
  TargetsConfig,
  TemplateDisplayVar,
  TemplateDefinition,
  UploadedFileRef
} from '../types'

function GenericPlatformEditor({
  platform,
  content,
  onChange,
  onCopy,
  isActive,
  onSelect,
  onBatchChange
}: {
  platform: string
  content: ContentState
  onChange: (field: string, value: unknown) => void
  onCopy: () => void
  isActive: boolean
  onSelect: () => void
  onBatchChange?: (content: ContentState) => void
}) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const { schema, loading: schemaLoading, error: schemaError } = usePlatformSchema(platform) as {
    schema?: { editor?: EditorSchema }
    loading: boolean
    error: string | null
  }
  // Load platform-specific translations
  usePlatformTranslations(platform, i18n.language)
  const { templates, getTemplate } = useTemplates(platform) as {
    templates: TemplateRecord[]
    getTemplate: (id: string) => Promise<TemplateRecord | null>
  }
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { parsedData, uploadedFileRefs } = useStore() as unknown as { parsedData: GenericRecord | null; uploadedFileRefs: UploadedFileRef[] }
  // Track original content with variables for undo functionality
  const [originalContentWithVars, setOriginalContentWithVars] = useState<Record<string, string>>({})
  // CRITICAL: Track _var_ fields separately - they persist even if variable is replaced in content
  const [persistentVarFields, setPersistentVarFields] = useState<Set<string>>(new Set())
  // Track active template and disabled variables
  const [activeTemplate, setActiveTemplate] = useState<TemplateRecord | null>(null)
  const [disabledVariables, setDisabledVariables] = useState<Set<string>>(new Set())
  const [hideAutoFilled, setHideAutoFilled] = useState(true) // Hide auto-filled variables by default
  const [targetsExpanded, setTargetsExpanded] = useState(false) // For collapsible targets summary
  const [translatedTemplateNames, setTranslatedTemplateNames] = useState<Record<string, string>>({}) // Cache for translated template names

  // ✅ Translate template names based on current language
  useEffect(() => {
    const translateTemplateNames = async () => {
      if (!content?._templates || !Array.isArray(content._templates)) {
        setTranslatedTemplateNames({})
        return
      }

      const translations: Record<string, string> = {}
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
              translations[templateEntry.id] =
                templateTranslations[currentLang].name || templateEntry.templateName || templateEntry.templateId
            } else {
              // Fallback to stored name or template.name
              translations[templateEntry.id] = templateEntry.templateName || template.name || templateEntry.templateId
            }
          } else {
            // Template not found, use stored name
            translations[templateEntry.id] = templateEntry.templateName || templateEntry.templateId
          }
        } catch {
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
    return uploadedFileRefs.filter((file) => file.isImage || file.type?.startsWith('image/'))
  }, [uploadedFileRefs])


  // CRITICAL: Track _var_ fields separately - update persistentVarFields when _var_ fields change
  useEffect(() => {
    if (!content) {
      setPersistentVarFields(new Set())
      return
    }

    const newPersistentVars = new Set<string>()
    Object.keys(content).forEach((key) => {
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
      } catch (err: unknown) {
        console.error(`Failed to load config for ${platform}:`, err)
        setError(err instanceof Error ? err.message : t('editor.failedToLoadConfig'))
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
    const disabled = new Set<string>()
    if (content) {
      Object.keys(content).forEach((key) => {
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
    getTemplate(content._templateId).then((template) => {
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
    return Object.values(content).reduce<number>((total, value) => {
      if (typeof value === 'string') {
        return total + value.length
      }
      return total
    }, 0)
  }

  const textLength = getTextLength()
  const maxLength = (platformConfig?.limits?.maxLength || (schema?.editor as any)?.constraints?.maxLength || 1000) as number
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
          {t('platform.failedToLoadConfigurationWithPlatform', { platform, error: error || schemaError })}
          <br />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {t('platform.ensureBackendRunningConfigured')}
          </Typography>
        </Alert>
      </Paper>
    )
  }

  if (!platformConfig && !schema) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="warning">
          {t('platform.noConfigurationForPlatform', { platform })}
        </Alert>
      </Paper>
    )
  }

  // Handle template selection - NOW USES BACKEND API
  const handleTemplateSelect = async (
    template: TemplateRecord,
    _parsed?: unknown,
    targetsValue: TargetsConfig | null = null,
    specificFiles: string[] = []
  ) => {
    try {
      if (!template.id) {
      setError(t('editor.templateMissingId'))
        return
      }
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
      const originalContent: Record<string, string> = {}
      Object.keys(templateContent).forEach((key) => {
        if (typeof templateContent[key] === 'string') {
          originalContent[key] = templateContent[key]
        }
      })
      setOriginalContentWithVars(originalContent)

      // Update all fields at once
      const updatedContent = { ...content, ...mappedContent }

      // ✅ Save targets value if provided (from template modal), or use default 'all'
      const targetsBlock = editorSchema?.blocks?.find((block) => block.type === 'targets')
      if (targetsBlock) {
        // Use provided targetsValue, or default to 'all' if nothing selected
        // ✅ Remove templateLocale from targetsValue before saving to content[targetsBlock.id]
        // templateLocale should only be stored in _templates[].targets.templateLocale
        const targetsForContent = targetsValue ? { ...targetsValue } : { mode: 'all' }
        delete targetsForContent.templateLocale
        if (targetsBlock.id) {
          updatedContent[targetsBlock.id] = targetsForContent
        }
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
              const idToLabel = new Map<string, string>(options.map((opt: { value: string; label: string }) => [opt.value, opt.label]))
              resolvedTargets.targetNames = resolvedTargets.individual.map((id: string) =>
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
              const idToName = new Map<string, string>((groupsArray as Array<{ id: string; name?: string }>).map((g) => [g.id, g.name || g.id]))
              resolvedTargets.groupNames = resolvedTargets.groups.map((id: string) =>
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
              resolvedTargets.targetNames = options.map((opt: { value: string; label?: string }) => opt.label || opt.value)
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
        Object.keys(updatedContent).forEach((key) => {
          if (updatedContent[key] !== undefined && updatedContent[key] !== null) {
            onChange(key, updatedContent[key])
          }
        })
      }
    } catch (error: unknown) {
      console.error('Failed to apply template:', error)
      // Show error to user (you might want to add a toast/alert here)
      setError(error instanceof Error ? error.message : t('template.failedToApply'))
    }
  }
  
  // Get current content as string for template selector
  const getCurrentContentString = () => {
    if (!content) return ''
    return Object.values(content).filter(v => typeof v === 'string').join('\n')
  }

  // Render image selector for image fields
  const renderImageSelector = (block: EditorBlock, field: GenericRecord) => {
    const blockId = block.id || ''
    const fieldValue = content?.[blockId]
    // const imageUrl = typeof fieldValue === 'string' && fieldValue ? getFileUrl(fieldValue) : null

    return (
      <FormControl key={blockId} fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t(block.label || 'editor.image')}</InputLabel>
        <Select
          value={(fieldValue as string) || ''}
          onChange={(e) => onChange(blockId, e.target.value)}
          label={t(block.label || 'editor.image')}
          renderValue={(selected) => {
            if (!selected) return t('editor.noImageSelected')
            const selectedValue = String(selected)
            const selectedFile = availableImages.find((img) => {
              const imgUrl = getFileUrl(img.url || '')
              return imgUrl === selectedValue || img.url === selectedValue
            })
            return selectedFile ? selectedFile.name : t('editor.selectedImage')
          }}
        >
          <MenuItem value="">
            <em>{t('editor.noImage')}</em>
          </MenuItem>
          {availableImages.map((file, index) => {
            const fileUrl = getFileUrl(file.url || '')
            return (
              <MenuItem key={index} value={fileUrl || ''}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={fileUrl || undefined}
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
            {t(block.description)}
          </Typography>
        )}
      </FormControl>
    )
  }

  // Use schema-driven editor if available
  const editorSchema = (schema?.editor || platformConfig?.schema?.editor) as EditorSchema | undefined
  const editorBlocks = editorSchema?.blocks || []

  const renderBlock = (block: EditorBlock) => {
    const blockId = block.id || ''
    
    switch (block.type) {
      case 'targets':
        return (
          <Box key={blockId} sx={{ mb: 3 }}>
            <CompositeRenderer
              block={block as any}
              platform={platform}
              value={content[blockId] as any}
              onChange={(val) => onChange(blockId, val)}
            />
          </Box>
        )

      case 'file_selection_input':
        return (
          <Box key={blockId} sx={{ mb: 3 }}>
            <FileSelectionBlock
              block={block as any}
              content={content}
              onChange={onChange}
              uploadedFileRefs={uploadedFileRefs as any}
            />
          </Box>
        )

      case 'form':
        return (
          <Box key={blockId} sx={{ mb: 3 }}>
            <SchemaRenderer
              fields={(block as any).fields || []}
              groups={(block as any).groups || []}
              values={content as any}
              onChange={onChange}
              platformId={platform}
              onButtonAction={(action, field, values) => {
                console.log(`[PlatformEditor] Button action: ${action}`, { field, values })
                if (action === 'reload') {
                  onSelect()
                }
              }}
            />
          </Box>
        )

      case 'image_select':
        return renderImageSelector(block, (block as any).field || {})

      default:
        return null
    }
  }

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
          {t('editor.editorTitle', { platform: platformConfig?.name || platform })}
        </Typography>
        
        {/* Template Selector */}
        <TemplateSelector
          platform={platform}
          onSelectTemplate={(template, parsed, targets, specificFiles) => {
            void handleTemplateSelect(template, parsed, targets as TargetsConfig | null, specificFiles)
          }}
          currentContent={getCurrentContentString()}
          globalFiles={(content?.globalFiles || []).map((f) => (typeof f === 'string' ? f : { id: f.id || '' }))}
          sx={{ ml: 'auto' }}
        />
      </Box>

      {/* ✅ All Template+Targets Combinations (shown when templates are applied) */}
      {(() => {
      const targetsBlock = editorBlocks.find((block) => block.type === 'targets')
        const templates = content?._templates || []
        
        if (!targetsBlock || templates.length === 0) return null

        // Helper to format targets summary - uses names from backend if available
        const formatTargetsSummary = (targets: TargetsConfig | undefined) => {
          if (!targets || Object.keys(targets).length === 0) return t('editor.noTargets')
          
          const mode = targets.mode || 'all'
          if (mode === 'all') {
            // For 'all' mode, show resolved target names from backend
            const names = targets.targetNames || []
            return t('editor.allRecipients', { names: names.join(', ') })
          } else if (mode === 'groups') {
            const groups = targets.groups || []
            // Use groupNames if available (resolved by backend), otherwise use IDs
            const groupNames = targets.groupNames || groups
            return t('editor.groupsSummary', { count: groups.length, names: groupNames.join(', ') })
          } else if (mode === 'individual') {
            const individuals = targets.individual || []
            // Use targetNames if available (resolved by backend), otherwise use IDs
            const targetNames = targets.targetNames || individuals
            const displayNames = targetNames.slice(0, 3)
            const remaining = targetNames.length > 3 ? '...' : ''
            return t('editor.individualSummary', { count: individuals.length, names: `${displayNames.join(', ')}${remaining}` })
          }
          return t('editor.targetsConfigured')
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
                        (targetsBlock?.id ? (content?.[targetsBlock.id] as { templateLocale?: string } | undefined)?.templateLocale : undefined)
                      return (
                        <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5 }}>
                          {t('editor.language')}: {templateLocale 
                            ? getLocaleDisplayName(getValidLocale(templateLocale))
                            : t('editor.errorValue')
                          }
                        </Typography>
                      )
                    })()}
                    {((templateEntry.specificFiles?.length || 0) > 0 || ((content?.globalFiles?.length || 0) > 0)) && (
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
        const templateVariables = getTemplateVariables(parsedData ?? undefined, uploadedFileRefs)
        const definitionList = Array.isArray(activeTemplate.variableDefinitions) ? activeTemplate.variableDefinitions : []

        if (definitionList.length === 0) {
          return (
            <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
              {t('editor.noVariableDefinitions')}
            </Alert>
          )
        }

        const displayVars: TemplateDisplayVar[] = Object.values(
          definitionList.reduce<Record<string, Omit<TemplateDisplayVar, 'aliases'> & { aliases: Set<string> }>>((acc, def) => {
            const canonicalName = def.canonicalName || def.name
            if (!acc[canonicalName]) {
              acc[canonicalName] = {
                canonicalName,
                aliases: new Set(),
                label: def.label,
                type: def.type,
                source: def.source,
                parsedField: def.parsedField,
                editable: def.editable,
                showWhenEmpty: def.showWhenEmpty,
                icon: def.icon
              }
            }

            acc[canonicalName].aliases.add(def.name)
            ;(def.aliases || []).forEach((alias: string) => acc[canonicalName].aliases.add(alias))
            return acc
          }, {})
        ).map((entry) => ({
          ...entry,
          aliases: Array.from(entry.aliases)
        }))

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
            
            {displayVars.map(({ canonicalName, aliases, label, type, source, parsedField, editable, showWhenEmpty, icon }) => {
              const explicitValue = aliases
                .map((alias: string) => content?.[`_var_${alias}`])
                .find((value: unknown) => value !== undefined && value !== null && String(value).length > 0)
              const fallbackValue = aliases
                .map((alias: string) => templateVariables[alias])
                .find((value: unknown) => value !== undefined && value !== null && String(value).length > 0)
              const varValue = (explicitValue || fallbackValue || templateVariables[canonicalName] || '') as string
              const isDisabled = aliases.some((alias: string) => disabledVariables.has(alias))
              const isAutoFilled = ['parsed', 'parsed_optional'].includes(source || '') &&
                parsedData?.[(parsedField || canonicalName)] !== undefined &&
                parsedData?.[(parsedField || canonicalName)] !== null
              const isImageVar = type === 'image'
              const canEdit = editable !== false && !isDisabled
              const displayLabel = t(label || canonicalName)
              
              // Hide auto-filled variables if checkbox is checked
              if (hideAutoFilled && isAutoFilled && !isDisabled) return null
              if (showWhenEmpty === false && !varValue) return null
              
              return (
                <Box key={canonicalName} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {icon ? `${icon} ` : ''}{displayLabel}:
                    </Typography>
                  </Box>
                  
                  {isImageVar ? (
                    // Image selector dropdown
                    <FormControl fullWidth size="small" disabled={isDisabled}>
                      <Select
                        value={varValue || ''}
                        onChange={(e) => {
                          if (canEdit) {
                            aliases.forEach((alias: string) => onChange(`_var_${alias}`, e.target.value))
                          }
                        }}
                        renderValue={(selected) => {
                          if (!selected) return 'No image selected'
                            const selectedValue = String(selected)
                            const selectedFile = availableImages.find((img) => {
                              const imgUrl = getFileUrl(img.url || '')
                              return imgUrl === selectedValue || img.url === selectedValue || img.url === getFileUrl(selectedValue)
                          })
                          if (selectedFile) {
                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  src={getFileUrl(selectedFile.url || '') || undefined}
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
                          const fileUrl = getFileUrl(file.url || '')
                          return (
                            <MenuItem key={index} value={fileUrl || ''}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  src={fileUrl || undefined}
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
                        if (canEdit) {
                          aliases.forEach((alias: string) => onChange(`_var_${alias}`, e.target.value))
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          bgcolor: isDisabled ? 'action.disabledBackground' : 'background.paper',
                          opacity: isDisabled ? 0.6 : 1
                        }
                      }}
                      InputProps={{
                        readOnly: !canEdit
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
      {editorBlocks.map(block => renderBlock(block))}

      {/* Template-based editing only - no editorBlocks */}
      {!activeTemplate && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('editor.selectTemplatePrompt')}
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
