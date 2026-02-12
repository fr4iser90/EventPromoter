import React, { useState, useMemo } from 'react'
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
  ContentCopy as DuplicateIcon
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
        template.variables.some(v => v.toLowerCase().includes(query))
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
                      <Typography variant="h6" component="h3" sx={{ flex: 1, mr: 1 }}>
                        {template.name}
                      </Typography>
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
