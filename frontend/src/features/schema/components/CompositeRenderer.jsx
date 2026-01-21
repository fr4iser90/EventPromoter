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

import React, { useState, useEffect } from 'react'
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
import axios from 'axios'

/**
 * Render a mapping field (group → template mapping)
 */
function renderMappingField(field, value, onChange, options, groups) {
  if (!groups || groups.length === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {field.label}: No groups selected
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
              onChange={(fieldName, newValue) => {
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
function CompositeRenderer({ block, value, onChange, platform }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({})
  const [compositeValues, setCompositeValues] = useState(value || {})
  const [searchTerm, setSearchTerm] = useState('')
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const rendering = block.rendering || {}
  const schema = rendering.schema || {}
  const dataEndpoints = rendering.dataEndpoints || {}

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

        const loadedData = {}
        
        // Load data from each endpoint
        for (const [key, endpoint] of Object.entries(dataEndpoints)) {
          try {
            const url = getApiUrl(endpoint.replace(':platformId', platform))
            const response = await axios.get(url)
            
            if (response.data.success) {
              // Extract options from response
              loadedData[key] = response.data.options || response.data[key] || []
            } else {
              console.warn(`[CompositeRenderer] Endpoint ${key} returned success=false:`, response.data.error)
              loadedData[key] = []
            }
          } catch (err) {
            console.error(`[CompositeRenderer] Failed to load data for ${key} from ${endpoint}:`, err)
            console.error(`[CompositeRenderer] Error details:`, err.response?.data || err.message)
            loadedData[key] = []
          }
        }

        setData(loadedData)
      } catch (err) {
        console.error('Composite renderer data load error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [platform, JSON.stringify(dataEndpoints), reloadTrigger]) // Reload when trigger changes

  // Sync compositeValues with value prop (when value changes from outside, e.g., template applied)
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const valueStr = JSON.stringify(value)
      const currentStr = JSON.stringify(compositeValues)
      if (valueStr !== currentStr) {
        setCompositeValues(value)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleFieldChange = (fieldKey, fieldValue) => {
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
        <Typography variant="body2" sx={{ mt: 1 }}>Loading...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load data: {error}
      </Alert>
    )
  }

  // Convert schema to fields for SchemaRenderer
  const fields = Object.entries(schema).map(([fieldKey, fieldSchema]) => {
    const sourceData = data[fieldSchema.source] || []
    
    return {
      name: fieldKey,
      type: fieldSchema.fieldType === 'mapping' ? 'mapping' : fieldSchema.fieldType,
      label: fieldSchema.label,
      description: fieldSchema.description,
      required: fieldSchema.required,
      default: fieldSchema.default,
      visibleWhen: fieldSchema.visibleWhen, // Support for conditional visibility
      source: fieldSchema.source, // Keep source for endpoint lookup
      options: sourceData.map(item => ({
        label: item.label || item.name || item,
        value: item.value || item.id || item
      }))
    }
  })

  // Helper function to check if field should be visible
  const isFieldVisible = (field) => {
    if (!field.visibleWhen) return true
    
    const { field: watchField, value: watchValue } = field.visibleWhen
    const currentValue = compositeValues[watchField]
    return currentValue === watchValue
  }

  // Get selected groups for mapping field
  const selectedGroups = compositeValues.groups || []
  const selectedIndividuals = compositeValues.individual || []

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
      {/* Block label and description - only show if not already shown by fields */}
      {block.label && !schema.mode && (
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {block.label}
        </Typography>
      )}
      
      {block.description && !schema.mode && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {block.description}
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
                  compositeValues[field.name],
                  handleFieldChange,
                  field.options,
                  selectedGroups
                )}
              </Box>
            )
          }

          // Special handling for multiselect fields (Hybrid: Chips + Cards)
          // Apply to both 'individual' and 'groups' fields
          if ((field.name === 'individual' || field.name === 'groups') && field.type === 'multiselect') {
            const currentValue = compositeValues[field.name] || []
            const availableOptions = field.options || []

            // Filter options based on search
            const filteredOptions = availableOptions.filter(opt => {
              const label = opt.label || opt.value || opt
              return label.toLowerCase().includes(searchTerm.toLowerCase())
            })

            // Get selected and unselected options
            const selectedOptions = availableOptions.filter(opt => {
              const value = opt.value || opt.label || opt
              return currentValue.includes(value)
            })
            const unselectedOptions = filteredOptions.filter(opt => {
              const value = opt.value || opt.label || opt
              return !currentValue.includes(value)
            })

            return (
              <Box key={field.name} sx={{ mb: 2 }}>
                {/* Only show label if it's not the same as block label */}
                {field.label !== block.label && (
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    {field.label}
                  </Typography>
                )}
                {field.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {field.description}
                  </Typography>
                )}

                {/* Chips: Ausgewählte Targets */}
                {selectedOptions.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Ausgewählt ({selectedOptions.length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedOptions.map((opt) => {
                        const value = opt.value || opt.label || opt
                        const label = opt.label || opt.value || opt
                        return (
                          <Chip
                            key={value}
                            label={label}
                            onDelete={() => {
                              const newValue = currentValue.filter(v => v !== value)
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
                    options={unselectedOptions.map(opt => opt.value || opt.label || opt)}
                    value={searchTerm}
                    onInputChange={(event, newInputValue) => {
                      setSearchTerm(newInputValue)
                    }}
                    onChange={async (event, newValue) => {
                      if (newValue && typeof newValue === 'string' && newValue.trim()) {
                        const newTarget = newValue.trim()
                        
                        // Check if it's a new target (not in options)
                        const existingTargets = availableOptions.map(opt => opt.value || opt.label || opt)
                        const isNewTarget = !existingTargets.includes(newTarget)
                        
                        // Save new target to backend
                        // ✅ GENERIC: Use endpoint from schema dataEndpoints
                        // Generic: field.source defines the endpoint key (e.g., 'targets', 'groups', etc.)
                        // Backend knows what field name to use based on platform
                        if (isNewTarget) {
                          try {
                            // Get endpoint from dataEndpoints using field.source
                            const endpointKey = field.source // Generic endpoint key from schema
                            const endpointPath = dataEndpoints[endpointKey] // Endpoint path from schema
                            
                            if (!endpointPath) {
                              throw new Error(`No endpoint defined for source: ${endpointKey}`)
                            }
                            
                            // Build full URL (replace :platformId if present)
                            const fullEndpoint = endpointPath.replace(':platformId', platform)
                            
                            // Send payload - backend API expects platform-specific field name
                            // For email platform: 'email', for other platforms: platform-specific field
                            await axios.post(getApiUrl(fullEndpoint), { 
                              email: newTarget
                            })
                            console.log(`Added new target: ${newTarget}`)
                            setReloadTrigger(prev => prev + 1)
                          } catch (err) {
                            console.error(`Failed to add target ${newTarget}:`, err)
                            alert(`Fehler beim Hinzufügen: ${err.response?.data?.error || err.message}`)
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
                        placeholder={field.description || "Neue Auswahl hinzufügen..."}
                        variant="outlined"
                        size="small"
                      />
                    )}
                    sx={{ mb: 2 }}
                  />
                )}

                {/* Cards: Liste zum Auswählen */}
                {unselectedOptions.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Verfügbar ({unselectedOptions.length}):
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
                      {unselectedOptions.map((opt) => {
                        const value = opt.value || opt.label || opt
                        const label = opt.label || opt.value || opt
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
                onChange={handleFieldChange}
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
          summaryText = 'Alle Empfänger'
        } else if (mode === 'groups' && selectedGroups.length > 0) {
          summaryText = `${selectedGroups.length} Gruppe(n) ausgewählt`
        } else if (mode === 'individual' && selectedIndividuals.length > 0) {
          summaryText = `${selectedIndividuals.length} Empfänger ausgewählt`
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
