import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Description as TemplateIcon
} from '@mui/icons-material'
import { useTemplates } from '../hooks/useTemplates'
import { usePlatformSchema } from '../../platform/hooks/usePlatformSchema'
import SchemaRenderer from '../../schema/components/Renderer'
import config from '../../../config'

const TemplateList = ({ platform, onSelectTemplate }) => {
  const { t } = useTranslation()
  const { templates, categories, loading, error, createTemplate, updateTemplate, deleteTemplate } = useTemplates(platform)
  const { schema, loading: schemaLoading } = usePlatformSchema(platform)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    template: {}
  })
  const [saving, setSaving] = useState(false)

  // Handle create new template
  const handleCreate = () => {
    setEditingTemplate(null)
    setFormData({
      name: '',
      description: '',
      category: '',
      template: getDefaultTemplateStructure(platform)
    })
    setDialogOpen(true)
  }

  // Handle edit template
  const handleEdit = (template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      template: { ...template.template }
    })
    setDialogOpen(true)
  }

  // Handle delete template
  const handleDelete = async (templateId) => {
    if (window.confirm(t('template.deleteConfirm', { defaultValue: 'Are you sure you want to delete this template?' }))) {
      await deleteTemplate(templateId)
    }
  }

  // Handle save template
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category) {
      return
    }

    setSaving(true)
    try {
      const templateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        template: formData.template,
        variables: extractVariablesFromTemplate(formData.template)
      }

      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData)
      } else {
        await createTemplate(templateData)
      }

      setDialogOpen(false)
      setFormData({ name: '', description: '', category: '', template: {} })
      setEditingTemplate(null)
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setSaving(false)
    }
  }

  // ✅ SCHEMA-DRIVEN: Get default template structure from schema
  const getDefaultTemplateStructure = (platform) => {
    const templateSchema = schema?.template
    if (!templateSchema?.defaultStructure) {
      // Fallback if no schema
      return { text: '{title} - {description}' }
    }

    // Build default structure from schema
    const defaultStructure = {}
    Object.entries(templateSchema.defaultStructure).forEach(([key, field]) => {
      defaultStructure[key] = field.default || ''
    })
    return defaultStructure
  }

  // Extract variables from template content
  const extractVariablesFromTemplate = (template) => {
    // Get all template fields (subject, html, text, etc.) and combine them
    const content = Object.values(template).filter(v => typeof v === 'string').join(' ')

    const variableMatches = content.match(/\{([^}]+)\}/g) || []
    return [...new Set(variableMatches.map(match => match.slice(1, -1)))]
  }

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'general'
    if (!acc[category]) acc[category] = []
    acc[category].push(template)
    return acc
  }, {})

  // Create mapping from category ID to translated name
  const categoryNameMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name
    return acc
  }, {})

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          📝 {platform.charAt(0).toUpperCase() + platform.slice(1)} Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          {t('template.newTemplate')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {Object.keys(groupedTemplates).length === 0 ? (
        <Box textAlign="center" py={4}>
          <TemplateIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {t('template.noTemplates')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('template.createFirstTemplate')}
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreate}>
            {t('template.createTemplate')}
          </Button>
        </Box>
      ) : (
        Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <Box key={category} mb={3}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {categoryNameMap[category] || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}
            </Typography>
            <List>
              {categoryTemplates.map((template) => (
                <ListItem
                  key={template.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">{template.name}</Typography>
                        {template.isDefault && (
                          <Chip label={t('template.default')} size="small" color="primary" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {template.description || 'No description'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Variables: {template.variables.join(', ') || 'none'}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => onSelectTemplate && onSelectTemplate(template)}
                      title={t('template.useTemplate')}
                    >
                      ✓
                    </IconButton>
                    {!template.isDefault && (
                      <>
                        <IconButton
                          edge="end"
                          onClick={() => handleEdit(template)}
                          title={t('template.editTemplate')}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(template.id)}
                          title={t('template.delete')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            {Object.keys(groupedTemplates).length > 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))
      )}

      {/* Create/Edit Template Dialog */}
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? t('template.editTemplate') : t('template.createTemplate')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label={t('template.templateName')}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label={t('template.description')}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
              multiline
              rows={2}
            />

            <TextField
              select
              fullWidth
              label={t('template.category')}
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              sx={{ mb: 2 }}
              required
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

            {/* ✅ SCHEMA-DRIVEN: Template fields from schema.template.defaultStructure */}
            {schema?.template?.defaultStructure ? (
              <SchemaRenderer
                fields={Object.entries(schema.template.defaultStructure).map(([key, field]) => ({
                  name: key,
                  type: field.type === 'html' ? 'textarea' : field.type === 'rich' ? 'textarea' : field.type,
                  label: field.label,
                  description: field.description,
                  placeholder: field.placeholder || `Use {variable} for dynamic content`,
                  required: field.required,
                  default: field.default,
                  ui: { width: 12 }
                }))}
                values={formData.template}
                onChange={(fieldName, value) => setFormData(prev => ({
                  ...prev,
                  template: { ...prev.template, [fieldName]: value }
                }))}
                errors={{}}
              />
            ) : (
              /* Fallback if no template schema */
              <TextField
                fullWidth
                label="Text Content"
                value={formData.template.text || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  template: { ...prev.template, text: e.target.value }
                }))}
                multiline
                rows={4}
                placeholder="Use {variable} for dynamic content"
              />
            )}

            {/* Show available variables if defined in schema */}
            {schema?.template?.variables && schema.template.variables.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {t('template.availableVariables')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {schema.template.variables.map((variable) => (
                    <Chip
                      key={variable.name}
                      label={`{${variable.name}}`}
                      size="small"
                      variant="outlined"
                      title={variable.description || variable.label}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !formData.name.trim() || !formData.category}
          >
            {saving ? <CircularProgress size={20} /> : (editingTemplate ? t('common.update', { defaultValue: 'Update' }) : t('template.create'))}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default TemplateList
