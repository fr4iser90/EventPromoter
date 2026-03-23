import React, { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  CardActions,
  Tooltip
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Description as TemplateIcon,
  Visibility as VisibilityIcon,
  ContentCopy as DuplicateIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material'

import { useTemplates } from '../hooks/useTemplates'
import { useTemplateCategories } from '../hooks/useTemplateCategories'
import type { TemplateListProps, TemplateRecord } from '../types'

const TemplateList = ({
  platform,
  searchQuery = '',
  selectedCategory = 'all',
  selectedTemplate = null,
  onSelectTemplate,
  onEditTemplate
}: TemplateListProps) => {
  const { t } = useTranslation()
  const { templates, categories, loading, error, deleteTemplate, createTemplate } = useTemplates(platform)
  const { categories: allCategories } = useTemplateCategories()

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        (template.description && template.description.toLowerCase().includes(query)) ||
        (template.variables || []).some((v: string) => v.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    return filtered
  }, [templates, searchQuery, selectedCategory])

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    return filteredTemplates.reduce<Record<string, TemplateRecord[]>>((acc, template) => {
      const category = template.category || 'general'
      if (!acc[category]) acc[category] = []
      acc[category].push(template)
      return acc
    }, {})
  }, [filteredTemplates])

  // Create mapping from category ID to translated name
  const categoryNameMap = useMemo(() => {
    return (allCategories || categories || []).reduce<Record<string, string>>((acc, cat) => {
      if (cat.id) acc[cat.id] = cat.name
      return acc
    }, {})
  }, [allCategories, categories])

  const handleDelete = async (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (window.confirm(t('template.deleteConfirm'))) {
      await deleteTemplate(templateId)
    }
  }

  const handleDuplicate = async (template: TemplateRecord, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      const templateData = {
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category || 'general',
        template: { ...template.template },
        variables: template.variables || []
      }
      await createTemplate(templateData)
    } catch (err) {
      console.error('Error duplicating template:', err)
    }
  }

  const handleCardClick = (template: TemplateRecord) => {
    if (onSelectTemplate) {
      onSelectTemplate(template)
    }
  }

  const handleEdit = (template: TemplateRecord, event: React.MouseEvent) => {
    event.stopPropagation()
    if (onEditTemplate) {
      onEditTemplate(template)
    }
  }

  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = (template: TemplateRecord, event: React.MouseEvent) => {
    event.stopPropagation()
    const payload = {
      name: template.name,
      description: template.description,
      category: template.category || 'general',
      template: template.template || {},
      variables: template.variables || [],
      variableDefinitions: template.variableDefinitions
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `template-${(template.name || 'export').replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    setImportError(null)
    setImportSuccess(false)
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImportError(null)
    setImportSuccess(false)
    try {
      const text = await file.text()
      const data = JSON.parse(text) as Record<string, unknown>
      if (typeof data.name !== 'string' || !data.name.trim()) {
        setImportError(t('template.importInvalidFile', { defaultValue: 'Invalid file: missing or invalid "name".' }))
        return
      }
      if (typeof data.category !== 'string' || !data.category.trim()) {
        setImportError(t('template.importInvalidFile', { defaultValue: 'Invalid file: missing or invalid "category".' }))
        return
      }
      if (!data.template || typeof data.template !== 'object' || Array.isArray(data.template)) {
        setImportError(t('template.importInvalidFile', { defaultValue: 'Invalid file: "template" must be an object.' }))
        return
      }
      const variables = Array.isArray(data.variables) ? data.variables : []
      const result = await createTemplate({
        name: String(data.name).trim(),
        description: data.description != null ? String(data.description) : undefined,
        category: String(data.category).trim(),
        template: data.template as Record<string, string>,
        variables: variables.map(String),
        variableDefinitions: data.variableDefinitions as TemplateRecord['variableDefinitions']
      })
      if (result.success) {
        setImportSuccess(true)
        setTimeout(() => setImportSuccess(false), 3000)
      } else {
        setImportError(result.error || t('template.importError', { defaultValue: 'Import failed.' }))
      }
    } catch (err) {
      setImportError(t('template.importInvalidFile', { defaultValue: 'Invalid JSON or file format.' }))
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  if (filteredTemplates.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <TemplateIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          {searchQuery || selectedCategory !== 'all' 
            ? t('template.noTemplatesFound')
            : t('template.noTemplates')}
        </Typography>
        {!searchQuery && selectedCategory === 'all' && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('template.createFirstTemplate')}
          </Typography>
        )}
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={handleImportClick}
        >
          {t('template.import', { defaultValue: 'Import template' })}
        </Button>
        {importSuccess && (
          <Typography variant="caption" color="success.main">
            {t('template.importSuccess', { defaultValue: 'Template imported.' })}
          </Typography>
        )}
        {importError && (
          <Typography variant="caption" color="error.main">
            {importError}
          </Typography>
        )}
      </Box>
      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <Box key={category} mb={3}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            {categoryNameMap[category] || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' },
            gap: 2 
          }}>
            {(categoryTemplates as TemplateRecord[]).map((template) => {
              const isSelected = selectedTemplate?.id === template.id
              
              return (
                <Card
                  key={template.id}
                  onClick={() => handleCardClick(template)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? 'action.selected' : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 2,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', flex: 1, mr: 1 }}>
                        <Typography variant="h6" component="h3">
                          {template.name}
                        </Typography>
                        {template.id === 'blank' && (
                          <Chip label={t('template.emptyTemplate')} size="small" color="secondary" variant="outlined" sx={{ ml: 1, fontSize: '0.7rem' }} />
                        )}
                      </Box>
                      {template.isDefault && (
                        <Chip 
                          label={t('template.default')} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>

                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 2, minHeight: 40 }}
                    >
                      {template.description || t('template.noDescription')}
                    </Typography>

                    {template.variables && template.variables.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {t('template.availableVariables')}:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(template.variables || []).slice(0, 5).map((variable: string) => (
                            <Chip
                              key={variable}
                              label={`{${variable}}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                          {template.variables.length > 5 && (
                            <Chip
                              label={`+${template.variables.length - 5}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={t('template.preview')}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCardClick(template)
                          }}
                          color={isSelected ? 'primary' : 'default'}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={t('template.editTemplate')}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleEdit(template, e)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={t('template.export', { defaultValue: 'Export' })}>
                        <IconButton size="small" onClick={(e) => handleExport(template, e)}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('template.duplicate')}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleDuplicate(template, e)}
                        >
                          <DuplicateIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!template.isDefault && (
                        <Tooltip title={t('template.delete')}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleDelete(template.id, e)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              )
            })}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default TemplateList
