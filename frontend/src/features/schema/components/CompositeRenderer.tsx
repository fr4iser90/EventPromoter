/**
 * Composite Renderer Component
 * 
 * Renders composite blocks that consist of multiple fields.
 * Completely generic - no platform-specific logic.
 * 
 * The schema defines what "targets" means for each platform via dataEndpoints.
 * Frontend only knows about generic "targets" - platform-specific mapping happens in backend.
 * 
 * @module components/CompositeRenderer
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Autocomplete,
  TextField,
  Chip,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SchemaRenderer from './Renderer'
import { getApiUrl } from '../../../shared/utils/api'
import { getUserLocale } from '../../../shared/utils/localeUtils'
import { usePlatformTranslations } from '../../platform/hooks/usePlatformTranslations'
import axios from 'axios'
import type { Primitive, SchemaField, SchemaValues } from '../types'

type TranslationFn = (
  key: string,
  optionsOrFallback?: string | { defaultValue?: string; [key: string]: unknown }
) => string

type CompositeFieldSchema = {
  fieldType: string
  label: string
  description?: string
  source: string
  required?: boolean
  default?: unknown
  visibleWhen?: {
    field: string
    value: unknown
  }
}

type CompositeBlock = {
  label?: string
  description?: string
  rendering?: {
    schema?: Record<string, CompositeFieldSchema>
    dataEndpoints?: Record<string, string>
  }
}

type CompositeOption = {
  label: string
  value: string
  id?: string
}

const getOptionValue = (option: CompositeOption | string) =>
  typeof option === 'string' ? option : option.value

const getOptionLabel = (option: CompositeOption | string) =>
  typeof option === 'string' ? option : option.label

/**
 * Render a mapping field (group → template mapping)
 */
function renderMappingField(
  field: SchemaField & { name: string },
  value: Record<string, string> | undefined,
  onChange: (fieldName: string, value: unknown) => void,
  options: CompositeOption[],
  groups: string[],
  t: TranslationFn
) {
  if (!groups || groups.length === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {field.label}: {t('common.noSelection', 'No selection')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
        {field.label}
      </Typography>
      {groups.map((groupName) => {
        const currentTemplate = value?.[groupName] || ''
        return (
          <Box key={groupName} sx={{ mb: 1, pl: 2 }}>
            <SchemaRenderer
              fields={[{
                name: `mapping_${groupName}`,
                type: 'select',
                label: groupName,
                options: options || [],
                default: currentTemplate
              }]}
              values={{ [`mapping_${groupName}`]: currentTemplate }}
              onChange={(_, newValue) => {
                const newMapping = { ...value, [groupName]: newValue }
                onChange(field.name, newMapping)
              }}
              errors={{}}
            />
          </Box>
        )
      })}
    </Box>
  )
}

/**
 * Composite Renderer
 * 
 * Renders a composite block with multiple fields based on schema.
 * Loads data from endpoints and renders fields generically.
 */
function CompositeRenderer({
  block,
  value,
  onChange,
  platform
}: {
  block: CompositeBlock
  value?: SchemaValues
  onChange: (value: SchemaValues) => void
  platform?: string
}) {
  const { t, i18n } = useTranslation()
  const translate: TranslationFn = (key, optionsOrFallback) => {
    const options = typeof optionsOrFallback === 'string'
      ? { defaultValue: optionsOrFallback }
      : (optionsOrFallback ?? { defaultValue: key })
    const translated = t(key, options)
    const fallback = typeof optionsOrFallback === 'string'
      ? optionsOrFallback
      : options.defaultValue ?? key
    return typeof translated === 'string' ? translated : fallback
  }
  // ✅ Load platform translations
  const { loaded: translationsLoaded } = usePlatformTranslations(platform, i18n.language)
  const [loading, setLoading] = useState(true)
  
  console.log('[CompositeRenderer] Render', {
    platform,
    language: i18n.language,
    translationsLoaded,
    blockLabel: block.label,
    blockLabelTranslation: block.label ? t(block.label) : null,
    isKey: block.label ? t(block.label) === block.label : null
  })
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Record<string, CompositeOption[]>>({})
  const [compositeValues, setCompositeValues] = useState<SchemaValues>(value || {})
  const [searchTerm, setSearchTerm] = useState('')
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const rendering = block.rendering || {}
  const schema = (rendering.schema || {}) as Record<string, CompositeFieldSchema>
  const dataEndpoints = (rendering.dataEndpoints || {}) as Record<string, string>

  // Load data from all endpoints
  useEffect(() => {
    if (!platform || !dataEndpoints || Object.keys(dataEndpoints).length === 0) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const loadedData: Record<string, CompositeOption[]> = {}
        
        // Load data from each endpoint
        for (const [key, endpoint] of Object.entries(dataEndpoints)) {
          try {
            const url = getApiUrl(endpoint.replace(':platformId', platform))
            const response = await axios.get(url)
            
            if (response.data.success) {
              // Extract options from response
              const options = response.data.options || response.data[key] || []
              loadedData[key] = Array.isArray(options)
                ? options.map((item: unknown) => {
                    if (typeof item === 'object' && item !== null) {
                      const obj = item as Record<string, unknown>
                      const label = String(obj.label ?? obj.name ?? obj.value ?? '')
                      const value = String(obj.value ?? obj.id ?? obj.name ?? '')
                      return { label, value }
                    }
                    const text = String(item)
                    return { label: text, value: text }
                  })
                : []
            } else {
              console.warn('[CompositeRenderer] Endpoint returned success=false', { key, error: response.data.error })
              loadedData[key] = []
            }
          } catch (err: unknown) {
            console.error('[CompositeRenderer] Failed to load data from endpoint', { key, endpoint, error: err })
            if (err instanceof Error) {
              console.error(`[CompositeRenderer] Error details:`, err.message)
            }
            loadedData[key] = []
          }
        }

        setData(loadedData)
      } catch (err: unknown) {
        console.error('Composite renderer data load error:', err)
        setError(err instanceof Error ? err.message : t('common.failedToLoadData'))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [platform, JSON.stringify(dataEndpoints), reloadTrigger]) // Reload when trigger changes

  // ✅ UX: Initialize default values after data is loaded
  // Set mode to 'all' if not set, and auto-select template if only one available
  useEffect(() => {
    if (loading || !data || Object.keys(data).length === 0) return
    
    const currentValues = compositeValues || {}
    const initialValues = { ...currentValues }
    let hasChanges = false
    
    // ✅ Always initialize templateLocale if missing (even if value is set)
    // This ensures templateLocale is always available
    if (!initialValues.templateLocale) {
      const userLocale = getUserLocale(i18n)
      initialValues.templateLocale = userLocale
      hasChanges = true
    }
    
    // Don't override other fields if value prop is explicitly set (from parent)
    if (value !== undefined && value !== null && Object.keys(value).length > 0) {
      // Only update if we initialized templateLocale
      if (hasChanges) {
        setCompositeValues(initialValues)
        onChange(initialValues)
      }
      return
    }
    
    // Set default mode to 'all' if not set
    if (!initialValues.mode) {
      const modeField = schema.mode
      if (modeField?.default) {
        initialValues.mode = modeField.default
        hasChanges = true
      } else {
        // Fallback: use first available mode option (prefer 'all')
        const modes = data.modes || []
        if (modes.length > 0) {
          const allMode = modes.find(m => (m.value || m) === 'all')
          const firstMode = allMode || modes[0]
          initialValues.mode = firstMode?.value || firstMode
          hasChanges = true
        }
      }
    }
    
    // Smart Default: Auto-select template if only one available
    if (!initialValues.defaultTemplate) {
      const templates = data.templates || []
      if (templates.length === 1) {
        const singleTemplate = templates[0]
        initialValues.defaultTemplate = singleTemplate.value
        hasChanges = true
      }
    }
    
    
    // Only update if we actually changed something
    if (hasChanges) {
      setCompositeValues(initialValues)
      onChange(initialValues)
    }
     
  }, [data, loading]) // Run after data is loaded

  // Sync compositeValues with value prop (when value changes from outside, e.g., template applied)
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const valueStr = JSON.stringify(value)
      const currentStr = JSON.stringify(compositeValues)
      if (valueStr !== currentStr) {
        // ✅ PRESERVE templateLocale when syncing - only if user has set it
        const preservedTemplateLocale = compositeValues?.templateLocale
        const newCompositeValues = { ...value }
        // Only preserve if user explicitly set it (not undefined/null)
        if (preservedTemplateLocale !== undefined && preservedTemplateLocale !== null) {
          newCompositeValues.templateLocale = preservedTemplateLocale
        }
        setCompositeValues(newCompositeValues)
      }
    }
     
  }, [value])

  const handleFieldChange = (fieldKey: string, fieldValue: unknown) => {
    const newValues = {
      ...compositeValues,
      [fieldKey]: fieldValue
    }
    setCompositeValues(newValues)
    
    // Call onChange immediately, not in useEffect
    onChange(newValues)
  }

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ mt: 1 }}>{t('common.loading')}</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t('common.failedToLoadData')}: {error}
      </Alert>
    )
  }

    // Convert schema to fields for SchemaRenderer
    const fields = Object.entries(schema).map<SchemaField & { name: string }>(([fieldKey, fieldSchema]) => {
      const sourceData = data[fieldSchema.source] || []
      
      const labelKey = fieldSchema.label
      const labelTranslation = labelKey ? translate(labelKey, labelKey) : null
      const isLabelKey = labelKey && labelTranslation === labelKey
      
      const descKey = fieldSchema.description
      const descTranslation = descKey ? translate(descKey, descKey) : null
      const isDescKey = descKey && descTranslation === descKey
      
      console.log('[CompositeRenderer] Field translation check', {
        fieldKey,
        labelKey,
        labelTranslation,
        isLabelKey,
        descKey,
        descTranslation,
        isDescKey
      })

      return {
        name: fieldKey,
        type: fieldSchema.fieldType === 'mapping' ? 'mapping' : fieldSchema.fieldType,
        label: fieldSchema.label,
        description: fieldSchema.description,
        required: fieldSchema.required,
        default: fieldSchema.default as Primitive | Primitive[] | Record<string, Primitive> | undefined,
        visibleWhen: fieldSchema.visibleWhen as { field: string; value: string | number | boolean | null | undefined } | undefined,
        source: fieldSchema.source,
        options: sourceData.map((item) => ({
          label: item.label || item.value,
          value: item.value
        }))
      }
  })

  // Helper function to check if field should be visible
  const isFieldVisible = (field: SchemaField) => {
    if (!field.visibleWhen) return true
    
    const { field: watchField, value: watchValue } = field.visibleWhen
    const currentValue = compositeValues[watchField]
    return currentValue === watchValue
  }

  // Get selected groups for mapping field
  const selectedGroups = Array.isArray(compositeValues.groups) ? (compositeValues.groups as string[]) : []
  const selectedIndividuals = Array.isArray(compositeValues.individual) ? (compositeValues.individual as string[]) : []

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
      {/* Block label and description - only show if not already shown by fields */}
      {block.label && !schema.mode && (
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {translate(block.label, block.label)}
        </Typography>
      )}
      
      {block.description && !schema.mode && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {translate(block.description, block.description)}
        </Typography>
      )}

      <Box>
        {fields.map((field) => {
          // Check if field should be visible
          if (!isFieldVisible(field)) {
            return null
          }

          // Special handling for mapping field
          if (field.type === 'mapping') {
            return (
              <Box key={field.name}>
                {renderMappingField(
                  field,
                  compositeValues[field.name] as Record<string, string> | undefined,
                  handleFieldChange,
                  (field.options || []).map((option) => ({
                    label: String(option.label ?? option.value ?? ''),
                    value: String(option.value ?? '')
                  })),
                  selectedGroups,
                  translate
                )}
              </Box>
            )
          }

          // Special handling for multiselect fields (Hybrid: Chips + Cards)
          // Apply to both 'individual' and 'groups' fields
          if ((field.name === 'individual' || field.name === 'groups') && field.type === 'multiselect') {
            const currentValue = Array.isArray(compositeValues[field.name])
              ? (compositeValues[field.name] as Array<string>)
              : []
            const availableOptions = (field.options || []) as Array<CompositeOption | string>

            // Filter options based on search
            const filteredOptions = availableOptions.filter((opt) => {
              const label = getOptionLabel(opt)
              return label.toLowerCase().includes(searchTerm.toLowerCase())
            })

            // Get selected and unselected options
            const selectedOptions = availableOptions.filter((opt) => {
              const value = getOptionValue(opt)
              return currentValue.includes(value)
            })
            const unselectedOptions = filteredOptions.filter((opt) => {
              const value = getOptionValue(opt)
              return !currentValue.includes(value)
            })

            return (
              <Box key={field.name} sx={{ mb: 2 }}>
                {/* Only show label if it's not the same as block label */}
                {field.label !== block.label && (
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    {translate(field.label ?? field.name, field.label ?? field.name)}
                  </Typography>
                )}
                {field.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {translate(field.description, field.description)}
                  </Typography>
                )}

                {/* Chips: Selected Targets */}
                {selectedOptions.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      {t('common.selected', { count: selectedOptions.length, defaultValue: `Selected (${selectedOptions.length}):` })}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedOptions.map((opt) => {
                        const value = getOptionValue(opt)
                        const label = getOptionLabel(opt)
                        return (
                          <Chip
                            key={value}
                            label={label}
                            onDelete={() => {
                              const newValue = currentValue.filter((v) => v !== value)
                              handleFieldChange(field.name, newValue)
                            }}
                            color="primary"
                            variant="outlined"
                          />
                        )
                      })}
                    </Box>
                  </Box>
                )}

                {/* Autocomplete: Neue Targets hinzufügen (nur für individual field) */}
                {/* Generic targets selection - platform-specific mapping handled by backend */}
                {field.name === 'individual' && (
                  <Autocomplete
                    freeSolo
                    options={unselectedOptions.map((opt) => getOptionValue(opt))}
                    value={searchTerm}
                    onInputChange={(_, newInputValue) => {
                      setSearchTerm(newInputValue)
                    }}
                    onChange={async (_, newValue) => {
                      if (newValue && typeof newValue === 'string' && newValue.trim()) {
                        const newTarget = newValue.trim()
                        
                        // Check if it's a new target (not in options)
                        const existingTargets = availableOptions.map((opt) => getOptionValue(opt))
                        const isNewTarget = !existingTargets.includes(newTarget)
                        
                        // Save new target to backend
                        // ✅ GENERIC: Use endpoint from schema dataEndpoints
                        // Generic: field.source defines the endpoint key (e.g., 'targets', 'groups', etc.)
                        // Backend knows what field name to use based on platform
                        if (isNewTarget) {
                          try {
                            // Get endpoint from dataEndpoints using field.source
                            const endpointKey = field.source // Generic endpoint key from schema
                            const endpointPath = endpointKey ? dataEndpoints[endpointKey] : undefined // Endpoint path from schema
                            
                            if (!endpointPath) {
                              throw new Error(`No endpoint defined for source: ${endpointKey}`)
                            }
                            
                            // Build full URL (replace :platformId if present)
                            const fullEndpoint = endpointPath.replace(':platformId', platform || '')
                            
                            // Send payload - backend API expects platform-specific field name
                            // For email platform: 'email', for other platforms: platform-specific field
                            await axios.post(getApiUrl(fullEndpoint), { 
                              email: newTarget
                            })
                            console.log(`Added new target: ${newTarget}`)
                            setReloadTrigger(prev => prev + 1)
                          } catch (err: unknown) {
                            console.error('Failed to add target', { target: newTarget, error: err })
                            const message = err instanceof Error ? err.message : t('common.unknownError')
                            alert(translate('common.errorAdding', `Error adding: ${message}`))
                            return
                          }
                        }
                        
                        // Add to selection
                        if (!currentValue.includes(newTarget)) {
                          handleFieldChange(field.name, [...currentValue, newTarget])
                        }
                        setSearchTerm('')
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={t(field.description || 'common.addNew', { defaultValue: field.description || 'Add new selection...' })}
                        variant="outlined"
                        size="small"
                      />
                    )}
                    sx={{ mb: 2 }}
                  />
                )}

                {/* Cards: Available Options */}
                {unselectedOptions.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      {t('common.available', { count: unselectedOptions.length, defaultValue: `Available (${unselectedOptions.length}):` })}
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
                      {unselectedOptions.map((opt) => {
                        const value = getOptionValue(opt)
                        const label = getOptionLabel(opt)
                        return (
                          <Card
                            key={value}
                            sx={{
                              mb: 1,
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'action.hover'
                              }
                            }}
                            onClick={() => {
                              handleFieldChange(field.name, [...currentValue, value])
                            }}
                          >
                            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                              <FormControlLabel
                                control={<Checkbox checked={false} />}
                                label={label}
                                sx={{ m: 0 }}
                              />
                            </CardContent>
                          </Card>
                        )
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            )
          }

          // Regular field rendering
          return (
            <Box key={field.name} sx={{ mb: 2 }}>
              <SchemaRenderer
                fields={[field]}
                values={{ [field.name]: compositeValues[field.name] || field.default || '' }}
                onChange={(fieldName, fieldValue) => {
                  handleFieldChange(fieldName, fieldValue)
                }}
                errors={{}}
              />
            </Box>
          )
        })}
      </Box>

      {/* Summary */}
      {(() => {
        const mode = compositeValues.mode || 'all'
        let summaryText = ''
        
        if (mode === 'all') {
          summaryText = t('common.allSelected')
        } else if (mode === 'groups' && selectedGroups.length > 0) {
          summaryText = t('common.groupsSelected', { count: selectedGroups.length, defaultValue: `${selectedGroups.length} group(s) selected` })
        } else if (mode === 'individual' && selectedIndividuals.length > 0) {
          summaryText = t('common.itemsSelected', { count: selectedIndividuals.length, defaultValue: `${selectedIndividuals.length} item(s) selected` })
        }
        
        return summaryText ? (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              {summaryText}
            </Typography>
          </Box>
        ) : null
      })()}
    </Paper>
  )
}

export default CompositeRenderer
