/**
 * Composite Renderer Component
 * 
 * Renders composite blocks that consist of multiple fields.
 * Completely generic - no platform-specific logic.
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
  Divider
} from '@mui/material'
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
            const url = getApiUrl(endpoint.replace('/api/', '').replace(':platformId', platform))
            const response = await axios.get(url)
            
            if (response.data.success) {
              // Extract options from response
              loadedData[key] = response.data.options || response.data[key] || []
            } else {
              console.warn(`Failed to load data for ${key}:`, response.data.error)
              loadedData[key] = []
            }
          } catch (err) {
            console.error(`Error loading data for ${key}:`, err)
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
  }, [platform, JSON.stringify(dataEndpoints)])

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
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
        {block.label || 'Composite Block'}
      </Typography>
      
      {block.description && (
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
