/**
 * Schema Renderer Component
 * 
 * Generic form renderer that dynamically renders form fields based on schema definitions.
 * Supports all field types defined in the platform schema system.
 * 
 * @module components/SchemaRenderer/SchemaRenderer
 */

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
  Alert,
  Chip
} from '@mui/material'
import {
  Send as ApiIcon,
  SmartToy as PlaywrightIcon,
  Link as N8nIcon,
  SettingsInputComponent as CustomIcon
} from '@mui/icons-material'
import TargetList from './TargetList'
import HelperIcon from '../../../shared/components/ui/HelperIcon'
import type { FieldGroup, SchemaErrors, SchemaField, SchemaValues } from '../types'

type TranslationFn = (
  key: string,
  optionsOrFallback?: string | { defaultValue?: string; [key: string]: unknown }
) => string
type OnFieldChange = (fieldName: string, value: unknown) => void

/**
 * Render a single field based on schema definition
 */
function renderField(
  field: SchemaField & { name: string },
  value: unknown,
  onChange: OnFieldChange,
  error: string | null | undefined,
  platformId: string | null = null,
  formValues: SchemaValues = {},
  allFields: Array<SchemaField & { name: string }> = [],
  onButtonAction: ((action: string, field?: SchemaField, values?: SchemaValues) => void) | null = null,
  t: TranslationFn | null = null
) {
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
    onChange: (e: { target: { value: string } }) => onChange(field.name, e.target.value),
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
              onChange(field.name, typeof numVal === 'number' && !Number.isNaN(numVal) ? numVal : undefined)
            }
          }}
          inputProps={{
            min: field.validation?.find((r) => r.type === 'min')?.value,
            max: field.validation?.find((r) => r.type === 'max')?.value
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
              checked={Boolean(value)}
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
            helperText={t ? t('common.noOptionsAvailable') : 'No options available'}
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
                key={String(option.value)}
                value={option.value == null ? '' : (typeof option.value === 'boolean' ? String(option.value) : option.value)}
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
              values={formValues as Record<string, string>}
            />
          ) : (
            <Alert severity="warning">
              {t ? t('schema.platformIdRequiredTargetList') : 'Platform ID is required for target-list field'}
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
function validateField(field: SchemaField & { name: string }, value: unknown, t: TranslationFn | null = null) {
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
        if (typeof value === 'string' && typeof rule.value === 'number' && value.length < rule.value) {
          return rule.message || (t ? t('validation.minLength', { field: translatedLabel, value: rule.value, defaultValue: `${translatedLabel} must be at least ${rule.value} characters` }) : `${translatedLabel} must be at least ${rule.value} characters`)
        }
        break

      case 'maxLength':
        if (typeof value === 'string' && typeof rule.value === 'number' && value.length > rule.value) {
          return rule.message || (t ? t('validation.maxLength', { field: translatedLabel, value: rule.value, defaultValue: `${translatedLabel} must be at most ${rule.value} characters` }) : `${translatedLabel} must be at most ${rule.value} characters`)
        }
        break

      case 'min':
        if (value !== null && value !== undefined && typeof rule.value === 'number' && Number(value) < rule.value) {
          return rule.message || (t ? t('validation.min', { field: translatedLabel, value: rule.value, defaultValue: `${translatedLabel} must be at least ${rule.value}` }) : `${translatedLabel} must be at least ${rule.value}`)
        }
        break

      case 'max':
        if (value !== null && value !== undefined && typeof rule.value === 'number' && Number(value) > rule.value) {
          return rule.message || (t ? t('validation.max', { field: translatedLabel, value: rule.value, defaultValue: `${translatedLabel} must be at most ${rule.value}` }) : `${translatedLabel} must be at most ${rule.value}`)
        }
        break

      case 'pattern':
        if (typeof value === 'string' && rule.value !== undefined && !new RegExp(String(rule.value)).test(value)) {
          return rule.message || (t ? t('validation.invalidFormat', { field: translatedLabel, defaultValue: `${translatedLabel} format is invalid` }) : `${translatedLabel} format is invalid`)
        }
        break

      case 'url':
        if (typeof value === 'string' && value && !/^https?:\/\/.+/.test(value)) {
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
function SchemaRenderer({
  fields = [],
  values = {},
  onChange,
  errors = {},
  groups = [],
  platformId = null,
  onButtonAction = null
}: {
  fields?: Array<SchemaField & { name: string }>
  values?: SchemaValues
  onChange: OnFieldChange
  errors?: SchemaErrors
  groups?: FieldGroup[]
  platformId?: string | null
  onButtonAction?: ((action: string, field?: SchemaField, values?: SchemaValues) => void) | null
}) {
  const { t } = useTranslation()
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {group.title && (
                  <Typography variant="h6">
                    {translate(group.title, group.title)}
                  </Typography>
                )}
                {group.method === 'api' && (
                  <Chip 
                    icon={<ApiIcon sx={{ fontSize: '1rem !important' }} />} 
                    label="API" 
                    size="small" 
                    color="info" 
                    variant="outlined" 
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                {group.method === 'playwright' && (
                  <Chip 
                    icon={<PlaywrightIcon sx={{ fontSize: '1rem !important' }} />} 
                    label="PLAYWRIGHT" 
                    size="small" 
                    color="warning" 
                    variant="outlined" 
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                {group.method === 'n8n' && (
                  <Chip 
                    icon={<N8nIcon sx={{ fontSize: '1rem !important' }} />} 
                    label="N8N" 
                    size="small" 
                    color="secondary" 
                    variant="outlined" 
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                {group.method === 'custom' && (
                  <Chip 
                    icon={<CustomIcon sx={{ fontSize: '1rem !important' }} />} 
                    label="CUSTOM" 
                    size="small" 
                    variant="outlined" 
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
              {group.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {translate(group.description, group.description)}
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
                            {translate(field.label ?? field.name, field.label ?? field.name)}
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
                        translate
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
                  {translate(field.label ?? field.name, field.label ?? field.name)}
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
              translate
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
export function validateSchema(fields: Array<SchemaField & { name: string }>, values: SchemaValues) {
  const errors: Record<string, string> = {}
  let isValid = true
  fields.forEach((field) => {
    const error = validateField(field, values[field.name], null)
    if (error) {
      errors[field.name] = error
      isValid = false
    }
  })

  return { isValid, errors }
}

export default SchemaRenderer

