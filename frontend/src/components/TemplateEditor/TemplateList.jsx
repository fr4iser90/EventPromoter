import React, { useState } from 'react'
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
import { useTemplates } from '../../hooks/useTemplates'

const TemplateList = ({ platform, onSelectTemplate }) => {
  const { templates, categories, loading, error, createTemplate, updateTemplate, deleteTemplate } = useTemplates(platform)
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
    if (window.confirm('Are you sure you want to delete this template?')) {
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

  // Get default template structure based on platform
  const getDefaultTemplateStructure = (platform) => {
    switch (platform) {
      case 'email':
        return {
          subject: 'New Event: {eventTitle}',
          html: '<h1>{eventTitle}</h1><p>{description}</p>'
        }
      default:
        return {
          text: '{eventTitle} - {description}'
        }
    }
  }

  // Extract variables from template content
  const extractVariablesFromTemplate = (template) => {
    const content = platform === 'email' ?
      `${template.subject || ''} ${template.html || ''}` :
      template.text || ''

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
          New Template
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
            No templates yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Create your first template to get started
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Template
          </Button>
        </Box>
      ) : (
        Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <Box key={category} mb={3}>
            <Typography variant="h6" sx={{ mb: 1, textTransform: 'capitalize' }}>
              {category.replace('-', ' ')}
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
                          <Chip label="Default" size="small" color="primary" variant="outlined" />
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
                      title="Use Template"
                    >
                      ✓
                    </IconButton>
                    {!template.isDefault && (
                      <>
                        <IconButton
                          edge="end"
                          onClick={() => handleEdit(template)}
                          title="Edit Template"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(template.id)}
                          title="Delete Template"
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
          {editingTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Template Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
              multiline
              rows={2}
            />

            <TextField
              select
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              sx={{ mb: 2 }}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Platform-specific template editor */}
            {platform === 'email' ? (
              <>
                <TextField
                  fullWidth
                  label="Email Subject"
                  value={formData.template.subject || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    template: { ...prev.template, subject: e.target.value }
                  }))}
                  sx={{ mb: 2 }}
                  placeholder="Use {variable} for dynamic content"
                />
                <TextField
                  fullWidth
                  label="Email HTML Content"
                  value={formData.template.html || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    template: { ...prev.template, html: e.target.value }
                  }))}
                  multiline
                  rows={6}
                  placeholder="Use {variable} for dynamic content"
                />
              </>
            ) : (
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !formData.name.trim() || !formData.category}
          >
            {saving ? <CircularProgress size={20} /> : (editingTemplate ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default TemplateList
