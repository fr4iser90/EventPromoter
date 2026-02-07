import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import { useTemplates } from '../hooks/useTemplates'
import { usePlatformSchema } from '../../platform/hooks/usePlatformSchema'
import SchemaRenderer from '../../schema/components/Renderer'
import { useTemplateCategories } from '../hooks/useTemplateCategories'

function TemplateEditor({ template, platform, onCancel, onSave }) {
  const { t } = useTranslation()
  const { categories } = useTemplateCategories()
  const { schema, loading: schemaLoading } = usePlatformSchema(platform)
  const { updateTemplate, createTemplate } = useTemplates(platform)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    template: {}
  })
  const [isDirty, setIsDirty] = useState(false)

  // Initialize form data from template
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        category: template.category || '',
        template: { ...template.template }
      })
      setIsDirty(false)
    }
  }, [template])

  // Mark as dirty when form changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleTemplateFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      template: { ...prev.template, [fieldName]: value }
    }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category) {
      setError(t('template.validationError', { defaultValue: 'Name and category are required' }))
      return
    }

    setSaving(true)
    setError(null)

    try {
      const templateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        template: formData.template,
        variables: extractVariablesFromTemplate(formData.template)
      }

      const result = template.isDefault
        ? await createTemplate(templateData) // Create new from default
        : await updateTemplate(template.id, templateData)

      if (result.success) {
        setIsDirty(false)
        onSave && onSave()
      } else {
        setError(result.error || t('template.saveError', { defaultValue: 'Failed to save template' }))
      }
    } catch (err) {
      console.error('Error saving template:', err)
      setError(err.message || t('template.saveError', { defaultValue: 'Failed to save template' }))
    } finally {
      setSaving(false)
    }
  }

  // Extract variables from template content
  const extractVariablesFromTemplate = (template) => {
    const content = Object.values(template).filter(v => typeof v === 'string').join(' ')
    const variableMatches = content.match(/\{([^}]+)\}/g) || []
    return [...new Set(variableMatches.map(match => match.slice(1, -1)))]
  }

  if (!template) {
    return null
  }

  const templateSchema = schema?.template

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">
            ✏️ {t('template.editTemplate')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving || !isDirty || !formData.name.trim() || !formData.category}
            >
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </Box>
        </Box>
        {isDirty && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {t('template.unsavedChanges', { defaultValue: 'You have unsaved changes' })}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Form Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Basic Info */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('template.basicInfo', { defaultValue: 'Basic Information' })}
          </Typography>
          
          <TextField
            fullWidth
            label={t('template.templateName')}
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            sx={{ mb: 2 }}
            required
            disabled={template.isDefault}
            helperText={template.isDefault ? t('template.defaultCannotEdit', { defaultValue: 'Default templates cannot be edited. Create a copy to edit.' }) : ''}
          />

          <TextField
            fullWidth
            label={t('template.description')}
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            sx={{ mb: 2 }}
            multiline
            rows={2}
            disabled={template.isDefault}
          />

          <TextField
            select
            fullWidth
            label={t('template.category')}
            value={formData.category}
            onChange={(e) => handleFormChange('category', e.target.value)}
            required
            disabled={template.isDefault}
          >
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>{t('template.loadingCategories')}</MenuItem>
            )}
          </TextField>
        </Paper>

        {/* Template Content */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('template.templateContent', { defaultValue: 'Template Content' })}
          </Typography>

          {schemaLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : templateSchema?.defaultStructure ? (
            <SchemaRenderer
              fields={Object.entries(templateSchema.defaultStructure).map(([key, field]) => ({
                name: key,
                type: field.type === 'html' ? 'textarea' : field.type === 'rich' ? 'textarea' : field.type,
                label: field.label,
                description: field.description,
                placeholder: field.placeholder || t('template.variablePlaceholder'),
                required: field.required,
                default: field.default,
                ui: { width: 12 }
              }))}
              values={formData.template}
              onChange={handleTemplateFieldChange}
              errors={{}}
            />
          ) : (
            <TextField
              fullWidth
              label={t('template.textContent')}
              value={formData.template.text || ''}
              onChange={(e) => handleTemplateFieldChange('text', e.target.value)}
              multiline
              rows={6}
              placeholder={t('template.variablePlaceholder')}
            />
          )}
        </Paper>

        {/* Variables Info */}
        {templateSchema?.variables && templateSchema.variables.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('template.availableVariables')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {templateSchema.variables.map((variable) => (
                <Chip
                  key={variable.name}
                  label={`{${variable.name}}`}
                  size="small"
                  variant="outlined"
                  title={variable.description || variable.label}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('template.variablesHint', { defaultValue: 'Use variables in curly braces, e.g., {title}, {date}' })}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  )
}

export default TemplateEditor
