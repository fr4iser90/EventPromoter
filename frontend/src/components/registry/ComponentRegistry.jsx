// Component Registry for Dynamic UI Generation
// Maps component names from backend to React components

import React from 'react'
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useStore from '../../store'

// Import existing components that can be reused
import EmailPanel from '../Panels/EmailPanel'

// Basic form components
function TextInput({ label, value, onChange, required, placeholder, type = 'text', ...props }) {
  return (
    <TextField
      fullWidth
      type={type}
      label={label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      variant="outlined"
      {...props}
    />
  )
}

function NumberInput({ label, value, onChange, required, placeholder, ...props }) {
  return (
    <TextField
      fullWidth
      type="number"
      label={label}
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={placeholder}
      required={required}
      variant="outlined"
      {...props}
    />
  )
}

function PasswordInput({ label, value, onChange, required, placeholder, ...props }) {
  return (
    <TextField
      fullWidth
      type="password"
      label={label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      variant="outlined"
      {...props}
    />
  )
}

function EmailInput({ label, value, onChange, required, placeholder, ...props }) {
  return (
    <TextField
      fullWidth
      type="email"
      label={label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      variant="outlined"
      {...props}
    />
  )
}

function SelectField({ label, value, onChange, options = [], required, ...props }) {
  return (
    <FormControl fullWidth variant="outlined" {...props}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        label={label}
        required={required}
      >
        {options.map((option) => (
          <MenuItem key={option.value || option} value={option.value || option}>
            {option.label || option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

function MultiselectField({ label, value, onChange, options = [], required, ...props }) {
  return (
    <FormControl fullWidth variant="outlined" {...props}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={Array.isArray(value) ? value : []}
        onChange={(e) => onChange(e.target.value)}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(Array.isArray(selected) ? selected : []).map((item) => (
              <Chip key={item} label={item} size="small" />
            ))}
          </Box>
        )}
        label={label}
        required={required}
      >
        {options.map((option) => (
          <MenuItem key={option.value || option} value={option.value || option}>
            {option.label || option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

function SwitchField({ label, value, onChange, ...props }) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          {...props}
        />
      }
      label={label}
    />
  )
}

// Complex components
function SettingsForm({ fields, values = {}, onChange }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {fields.map((field) => {
        const FieldComponent = COMPONENT_REGISTRY[field.type] || TextInput

        return (
          <FieldComponent
            key={field.name}
            label={field.label}
            value={values[field.name] || field.default || ''}
            onChange={(value) => onChange(field.name, value)}
            required={field.required}
            placeholder={field.placeholder}
            options={field.options}
            {...(field.props || {})}
          />
        )
      })}
    </Box>
  )
}

function RecipientSelector({ source, multiple = true, allowCustom = true, value, onChange }) {
  const [availableRecipients, setAvailableRecipients] = React.useState([])
  const [customRecipient, setCustomRecipient] = React.useState('')

  React.useEffect(() => {
    // Load recipients based on source
    if (source === 'email-list') {
      // This would load from backend
      setAvailableRecipients([
        'user1@example.com',
        'user2@example.com',
        'admin@company.com'
      ])
    }
  }, [source])

  const handleAddCustom = () => {
    if (customRecipient && allowCustom) {
      const current = Array.isArray(value) ? value : []
      onChange([...current, customRecipient])
      setCustomRecipient('')
    }
  }

  const handleRemove = (recipient) => {
    const current = Array.isArray(value) ? value : []
    onChange(current.filter(r => r !== recipient))
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Selected Recipients
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {(Array.isArray(value) ? value : []).map((recipient) => (
          <Chip
            key={recipient}
            label={recipient}
            onDelete={() => handleRemove(recipient)}
            size="small"
          />
        ))}
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Add Recipient</InputLabel>
        <Select
          value=""
          onChange={(e) => {
            const current = Array.isArray(value) ? value : []
            if (!current.includes(e.target.value)) {
              onChange([...current, e.target.value])
            }
          }}
          label="Add Recipient"
        >
          {availableRecipients.map((recipient) => (
            <MenuItem key={recipient} value={recipient}>
              {recipient}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {allowCustom && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            type="email"
            placeholder="Add custom email..."
            value={customRecipient}
            onChange={(e) => setCustomRecipient(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={handleAddCustom}
            disabled={!customRecipient}
          >
            Add
          </Button>
        </Box>
      )}
    </Box>
  )
}

function EmailContentEditor({ showSubject = true, showHtml = true, showPreview = true, maxLength, value, onChange }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {showSubject && (
        <TextField
          fullWidth
          label="Subject"
          value={value?.subject || ''}
          onChange={(e) => onChange('subject', e.target.value)}
          required
        />
      )}

      {showHtml && (
        <TextField
          fullWidth
          multiline
          rows={8}
          label="HTML Content"
          value={value?.html || ''}
          onChange={(e) => onChange('html', e.target.value)}
          placeholder="Enter your email HTML content..."
          inputProps={{ maxLength }}
        />
      )}

      {showPreview && value?.html && (
        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle2" gutterBottom>
            Preview:
          </Typography>
          <div dangerouslySetInnerHTML={{ __html: value.html }} />
        </Paper>
      )}
    </Box>
  )
}

// Special case: Use existing EmailPanel for email platform
function EmailPanelComponent(props) {
  return <EmailPanel {...props} />
}

// Component Registry
export const COMPONENT_REGISTRY = {
  // Basic form components
  'text': TextInput,
  'number': NumberInput,
  'password': PasswordInput,
  'email': EmailInput,
  'select': SelectField,
  'multiselect': MultiselectField,
  'switch': SwitchField,

  // Complex components
  'settings-form': SettingsForm,
  'recipient-selector': RecipientSelector,
  'email-content-editor': EmailContentEditor,

  // Special platform components
  'email-panel': EmailPanelComponent,

  // Placeholder for unknown components
  'unknown': ({ component }) => (
    <Alert severity="warning">
      Unknown component: {component}
    </Alert>
  )
}

// Dynamic Section Renderer
export function DynamicSection({ section, values = {}, onChange }) {
  const Component = COMPONENT_REGISTRY[section.component] || COMPONENT_REGISTRY.unknown

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {section.title}
      </Typography>
      <Component
        {...section.props}
        value={values[section.id]}
        values={values}
        onChange={(field, value) => onChange(section.id, { ...values[section.id], [field]: value })}
      />
    </Box>
  )
}

// Dynamic Panel Renderer
export function DynamicPanel({ config, values = {}, onChange }) {
  if (!config?.sections) {
    return <Alert severity="error">No panel configuration provided</Alert>
  }

  return (
    <Paper sx={{ p: 3 }}>
      {config.title && (
        <Typography variant="h5" gutterBottom>
          {config.title}
        </Typography>
      )}

      {config.sections.map((section) => (
        <DynamicSection
          key={section.id}
          section={section}
          values={values}
          onChange={onChange}
        />
      ))}
    </Paper>
  )
}

export default COMPONENT_REGISTRY
