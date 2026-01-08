// Component Registry for Dynamic UI Generation
// Maps component names from backend to React components

import React from 'react'
import { useTranslation } from 'react-i18next'
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
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import ImportExportIcon from '@mui/icons-material/ImportExport'
import EmailIcon from '@mui/icons-material/Email'
import GroupIcon from '@mui/icons-material/Group'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import useStore from '../../store'

// Dynamic Section Renderer
export function DynamicSection({ section, values = {}, onChange }) {
  const { t } = useTranslation()
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
        t={t}
      />
    </Box>
  )
}

// Dynamic Panel Renderer
export function DynamicPanel({ config, values = {}, onChange }) {
  const { t } = useTranslation()
  if (!config?.sections) {
    return <Alert severity="error">{t('registry.noPanelConfiguration')}</Alert>
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

// Component Registry - Only basic reusable components
export const COMPONENT_REGISTRY = {
  // Basic form components (reusable for any platform)
  'text': TextInput,
  'select': SelectField,

  // Complex reusable components
  'settings-form': SettingsForm,

  // Unknown component handler
  'unknown': ({ component, t }) => (
    <Alert severity="warning">
      {t ? t('registry.unknownComponent') : 'Unknown component'}: {component}
    </Alert>
  )
}

export default COMPONENT_REGISTRY
