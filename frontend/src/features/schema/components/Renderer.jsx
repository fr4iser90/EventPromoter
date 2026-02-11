/**
 * Schema Renderer Component
 * 
 * Generic form renderer that dynamically renders form fields based on schema definitions.
 * Supports all field types defined in the platform schema system.
 * 
 * @module components/SchemaRenderer/SchemaRenderer
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
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
function renderField(field, value, onChange, error, platformId = null, formValues = {}, allFields = [], onButtonAction = null, t = null) {
  const translatedLabel = field.label && t ? t(field.label, field.label) : field.label
  const translatedDescription = field.description && t ? t(field.description, field.description) : field.description
  const translatedPlaceholder = field.placeholder && t ? t(field.placeholder, field.placeholder) : field.placeholder
  
  const commonProps = {
    fullWidth: true,
    label: translatedLabel,
    placeholder: translatedPlaceholder,
    required: field.required,
    error: !!error,
    helperText: error || translatedDescription,
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
          value={value !== undefined && value !== null && value !== '' ? value : (field.default !== undefined ? field.default : '')}
          onChange={(e) => {
            const val = e.target.value
            // Convert empty string to undefined, otherwise convert to number
            if (val === '' || val === null) {
              onChange(field.name, field.default !== undefined ? field.default : undefined)
            } else {
              const numVal = val === '' ? undefined : Number(val)
              onChange(field.name, isNaN(numVal) ? undefined : numVal)
            }
          }}
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
          label={translatedLabel}
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
          <InputLabel>{translatedLabel}</InputLabel>
          <Select
            value={selectValue}
            onChange={(e) => onChange(field.name, e.target.value)}
            multiple={field.type === 'multiselect'}
            disabled={field.ui?.disabled}
            label={translatedLabel}
          >
            {field.options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label && t ? t(option.label, option.label) : option.label}
              </MenuItem>
            ))}
          </Select>
          {(error || translatedDescription) && (
            <FormHelperText>{error || translatedDescription}</FormHelperText>
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
              onUpdate={() => onButtonAction && onButtonAction('reload')} // Trigger reload on update
              allFields={allFields}
              values={formValues}
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
            onClick={() => {
              // Handle button action if defined
              if (field.action && platformId) {
                // ALWAYS delegate to parent - parent handles ALL actions based on backend schema
                if (onButtonAction) {
                  onButtonAction(field.action, field, formValues)
                }
              }
            }}
            disabled={field.ui?.disabled}
          >
            {translatedLabel}
          </MuiButton>
          {translatedDescription && (
            <FormHelperText>{translatedDescription}</FormHelperText>
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
function validateField(field, value, t = null) {
  if (!field.validation || !field.validation.length) {
    return null
  }

  const translatedLabel = field.label && t ? t(field.label, field.label) : field.label

  for (const rule of field.validation) {
    switch (rule.type) {
      case 'required':
        if (field.required && (!value || value === '')) {
          return rule.message || (t ? t('validation.required', { field: translatedLabel, defaultValue: `${translatedLabel} is required` }) : `${translatedLabel} is required`)
        }
        break

      case 'minLength':
        if (value && value.length < rule.value) {
          return rule.message || (t ? t('validation.minLength', { field: translatedLabel, value: rule.value, defaultValue: `${translatedLabel} must be at least ${rule.value} characters` }) : `${translatedLabel} must be at least ${rule.value} characters`)
        }
        break

      case 'maxLength':
        if (value && value.length > rule.value) {
          return rule.message || (t ? t('validation.maxLength', { field: translatedLabel, value: rule.value, defaultValue: `${translatedLabel} must be at most ${rule.value} characters` }) : `${translatedLabel} must be at most ${rule.value} characters`)
        }
        break

      case 'min':
        if (value !== null && value !== undefined && Number(value) < rule.value) {
          return rule.message || (t ? t('validation.min', { field: translatedLabel, value: rule.value, defaultValue: `${translatedLabel} must be at least ${rule.value}` }) : `${translatedLabel} must be at least ${rule.value}`)
        }
        break

      case 'max':
        if (value !== null && value !== undefined && Number(value) > rule.value) {
          return rule.message || (t ? t('validation.max', { field: translatedLabel, value: rule.value, defaultValue: `${translatedLabel} must be at most ${rule.value}` }) : `${translatedLabel} must be at most ${rule.value}`)
        }
        break

      case 'pattern':
        if (value && !new RegExp(rule.value).test(value)) {
          return rule.message || (t ? t('validation.invalidFormat', { field: translatedLabel, defaultValue: `${translatedLabel} format is invalid` }) : `${translatedLabel} format is invalid`)
        }
        break

      case 'url':
        if (value && !/^https?:\/\/.+/.test(value)) {
          return rule.message || (t ? t('validation.invalidUrl', { field: translatedLabel, defaultValue: `${translatedLabel} must be a valid URL` }) : `${translatedLabel} must be a valid URL`)
        }
        break

      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value)
          if (result !== true) {
            return typeof result === 'string' ? result : rule.message || (t ? t('validation.invalid', { field: translatedLabel, defaultValue: `${translatedLabel} is invalid` }) : `${translatedLabel} is invalid`)
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
  const { t } = useTranslation()
  
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
                            {translatedLabel}
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
                        fields,
                        onButtonAction
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
                  {translatedLabel}
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
              fields,
              onButtonAction,
              t
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

  const { t } = useTranslation()
  fields.forEach((field) => {
    const error = validateField(field, values[field.name], t)
    if (error) {
      errors[field.name] = error
      isValid = false
    }
  })

  return { isValid, errors }
}

export default SchemaRenderer

