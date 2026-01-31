/**
 * Schema Renderer Component
 * 
 * Generic form renderer that dynamically renders form fields based on schema definitions.
 * Supports all field types defined in the platform schema system.
 * 
 * @module components/SchemaRenderer/SchemaRenderer
 */

import React from 'react'
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Box,
  Typography,
  Button as MuiButton,
  Alert
} from '@mui/material'
import TargetList from './TargetList'
import HelperIcon from '../../../shared/components/ui/HelperIcon'
import { getApiUrl } from '../../../shared/utils/api'
import axios from 'axios'

/**
 * Render a single field based on schema definition
 */
function renderField(field, value, onChange, error, platformId = null, formValues = {}, allFields = []) {
  const commonProps = {
    fullWidth: true,
    label: field.label,
    placeholder: field.placeholder,
    required: field.required,
    error: !!error,
    helperText: error || field.description,
    value: value || field.default || '',
    onChange: (e) => onChange(field.name, e.target.value),
    disabled: field.ui?.disabled,
    readOnly: field.readOnly // Ensure readOnly is passed
  }

  switch (field.type) {
    case 'text':
    case 'url':
      return <TextField key={field.name} {...commonProps} type={field.type} />

    case 'textarea':
      return (
        <TextField
          key={field.name}
          {...commonProps}
          multiline
          rows={4}
        />
      )

    case 'number':
      return (
        <TextField
          key={field.name}
          {...commonProps}
          type="number"
          inputProps={{
            min: field.validation?.find(r => r.type === 'min')?.value,
            max: field.validation?.find(r => r.type === 'max')?.value
          }}
        />
      )

    case 'password':
      return <TextField key={field.name} {...commonProps} type="password" />

    case 'boolean':
      return (
        <FormControlLabel
          key={field.name}
          control={
            <Checkbox
              checked={value || false}
              onChange={(e) => onChange(field.name, e.target.checked)}
              disabled={field.ui?.disabled}
            />
          }
          label={field.label}
        />
      )

    case 'select':
    case 'multiselect':
      if (!field.options || field.options.length === 0) {
        return (
          <TextField
            key={field.name}
            {...commonProps}
            disabled
            helperText="No options available"
          />
        )
      }

      // Ensure value is array for multiselect, string for select
      const selectValue = field.type === 'multiselect' 
        ? (Array.isArray(value) ? value : (value ? [value] : []))
        : (value || field.default || '')
      
      return (
        <FormControl key={field.name} fullWidth error={!!error} required={field.required}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            value={selectValue}
            onChange={(e) => onChange(field.name, e.target.value)}
            multiple={field.type === 'multiselect'}
            disabled={field.ui?.disabled}
            label={field.label}
          >
            {field.options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error || field.description) && (
            <FormHelperText>{error || field.description}</FormHelperText>
          )}
        </FormControl>
      )

    case 'date':
      return <TextField key={field.name} {...commonProps} type="date" InputLabelProps={{ shrink: true }} />

    case 'time':
      return <TextField key={field.name} {...commonProps} type="time" InputLabelProps={{ shrink: true }} />

    case 'datetime':
      return <TextField key={field.name} {...commonProps} type="datetime-local" InputLabelProps={{ shrink: true }} />

    case 'target-list':
      return (
        <Box key={field.name} sx={{ mb: 2 }}>
          {platformId ? (
            <TargetList
              field={field}
              platformId={platformId}
              onUpdate={onChange}
              allFields={allFields} // Das neu hinzugefügte allFields-Prop
            />
          ) : (
            <Alert severity="warning">
              Platform ID is required for target-list field
            </Alert>
          )}
        </Box>
      )

    case 'button':
      return (
        <Box key={field.name} sx={{ mb: 2 }}>
          <MuiButton
            variant="contained"
            fullWidth={field.ui?.width === 12}
            onClick={async () => {
              // Handle button action if defined
              if (field.action && platformId) {
                try {
                  const endpoint = field.action.endpoint.replace(':platformId', platformId)
                  const url = getApiUrl(endpoint)
                  
                  // Build request body from bodyMapping
                  let body = {}
                  if (field.action.bodyMapping) {
                    Object.entries(field.action.bodyMapping).forEach(([key, source]) => {
                      // Get value from formValues using source field name
                      body[key] = formValues[source] || ''
                    })
                  } else {
                    // Default: send all form values
                    body = formValues
                  }

                  const response = await axios({
                    method: field.action.method || 'POST',
                    url,
                    data: body
                  })

                  if (response.data.success) {
                    // Handle onSuccess actions
                    if (field.action.onSuccess === 'clear') {
                      // Clear form values - would need callback
                      if (onButtonAction) {
                        onButtonAction('clear', field.name)
                      }
                    } else if (field.action.onSuccess === 'reload' || field.action.reloadOptions) {
                      // Reload options - use callback from parent
                      if (onButtonAction) {
                        onButtonAction('reload')
                      } else {
                        // Fallback: reload page if no callback
                        window.location.reload()
                      }
                    }
                  }
                } catch (err) {
                  console.error(`Failed to execute button action:`, err)
                  alert(`Error: ${err.message || 'Failed to execute action'}`)
                }
              }
            }}
            disabled={field.ui?.disabled}
          >
            {field.label}
          </MuiButton>
          {field.description && (
            <FormHelperText>{field.description}</FormHelperText>
          )}
        </Box>
      )

    default:
      return (
        <TextField
          key={field.name}
          {...commonProps}
          helperText={`Unsupported field type: ${field.type}`}
          disabled
        />
      )
  }
}

/**
 * Validate field value based on validation rules
 */
function validateField(field, value) {
  if (!field.validation || !field.validation.length) {
    return null
  }

  for (const rule of field.validation) {
    switch (rule.type) {
      case 'required':
        if (field.required && (!value || value === '')) {
          return rule.message || `${field.label} is required`
        }
        break

      case 'minLength':
        if (value && value.length < rule.value) {
          return rule.message || `${field.label} must be at least ${rule.value} characters`
        }
        break

      case 'maxLength':
        if (value && value.length > rule.value) {
          return rule.message || `${field.label} must be at most ${rule.value} characters`
        }
        break

      case 'min':
        if (value !== null && value !== undefined && Number(value) < rule.value) {
          return rule.message || `${field.label} must be at least ${rule.value}`
        }
        break

      case 'max':
        if (value !== null && value !== undefined && Number(value) > rule.value) {
          return rule.message || `${field.label} must be at most ${rule.value}`
        }
        break

      case 'pattern':
        if (value && !new RegExp(rule.value).test(value)) {
          return rule.message || `${field.label} format is invalid`
        }
        break

      case 'url':
        if (value && !/^https?:\/\/.+/.test(value)) {
          return rule.message || `${field.label} must be a valid URL`
        }
        break

      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value)
          if (result !== true) {
            return typeof result === 'string' ? result : rule.message || `${field.label} is invalid`
          }
        }
        break
    }
  }

  return null
}

/**
 * Schema Renderer Component
 * 
 * @param {Object} props
 * @param {Array} props.fields - Array of field definitions from schema
 * @param {Object} props.values - Current form values
 * @param {Function} props.onChange - Callback when field value changes (fieldName, value)
 * @param {Object} props.errors - Validation errors object { fieldName: errorMessage }
 * @param {Array} props.groups - Optional field groups from schema
 * @param {String} props.platformId - Platform ID (for target-list fields)
 * @param {Function} props.onButtonAction - Callback for button actions (for reload/clear)
 */
function SchemaRenderer({ fields = [], values = {}, onChange, errors = {}, groups = [], platformId = null, onButtonAction = null }) {
  // If groups are defined, render by groups
  if (groups && groups.length > 0) {
    return (
      <Box>
        {groups.map((group) => {
          const groupFields = fields.filter(f => group.fields.includes(f.name))
          const sortedFields = groupFields.sort((a, b) => {
            const orderA = a.ui?.order || 999
            const orderB = b.ui?.order || 999
            return orderA - orderB
          })

          return (
            <Box key={group.id} sx={{ mb: 3 }}>
              {group.title && (
                <Typography variant="h6" gutterBottom>
                  {group.title}
                </Typography>
              )}
              {group.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {group.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {sortedFields.map((field) => {
                  if (field.ui?.hidden) return null
                  return (
                    <Box
                      key={field.name}
                      sx={{
                        width: field.ui?.width ? `${(field.ui.width / 12) * 100}%` : '100%',
                        minWidth: '200px'
                      }}
                    >
                      {field.helper && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {field.label}
                          </Typography>
                          <HelperIcon 
                            helperId={field.helper}
                            platformId={platformId}
                            context={`field.${field.name}`}
                            size="small"
                          />
                        </Box>
                      )}
                      {renderField(
                        field,
                        values[field.name],
                        onChange,
                        errors[field.name],
                        platformId,
                        values,
                        fields // Übergabe des gesamten fields-Arrays
                      )}
                    </Box>
                  )
                })}
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  // Render fields without groups
  const sortedFields = [...fields].sort((a, b) => {
    const orderA = a.ui?.order || 999
    const orderB = b.ui?.order || 999
    return orderA - orderB
  })

  return (
    <Box>
      {sortedFields.map((field) => {
        if (field.ui?.hidden) return null
        return (
          <Box
            key={field.name}
            sx={{
              mb: 2,
              width: field.ui?.width ? `${(field.ui.width / 12) * 100}%` : '100%'
            }}
          >
            {field.helper && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {field.label}
                </Typography>
                <HelperIcon 
                  helperId={field.helper}
                  platformId={platformId}
                  context={`field.${field.name}`}
                  size="small"
                />
              </Box>
            )}
            {renderField(
              field,
              values[field.name],
              onChange,
              errors[field.name],
              platformId,
              values,
              fields // Übergabe des gesamten fields-Arrays
            )}
          </Box>
        )
      })}
    </Box>
  )
}

/**
 * Validate all fields in a schema
 */
export function validateSchema(fields, values) {
  const errors = {}
  let isValid = true

  fields.forEach((field) => {
    const error = validateField(field, values[field.name])
    if (error) {
      errors[field.name] = error
      isValid = false
    }
  })

  return { isValid, errors }
}

export default SchemaRenderer

