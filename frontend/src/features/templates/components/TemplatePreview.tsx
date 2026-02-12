import React, { useState, useEffect, useMemo } from 'react'
import {
  Typography,
  Box,
  TextField,
  Divider,
  Chip,
  Button
} from '@mui/material'
import {
  Edit as EditIcon
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useTemplateCategories } from '../hooks/useTemplateCategories'
import { usePlatformSchema } from '../../platform/hooks/usePlatformSchema'
import { PlatformPreview } from '../../platform'
import { replaceTemplateVariables } from '../../../shared/utils/templateUtils'
import { getUserLocale } from '../../../shared/utils/localeUtils'
import PageToolbar from '../../../shared/components/layout/PageToolbar'
import SectionPanel from '../../../shared/components/layout/SectionPanel'
import type { TemplatePreviewPlatformSchema as PlatformSchema, TemplatePreviewProps } from '../types'

function TemplatePreview({ template, platform, onEdit }: TemplatePreviewProps) {
  const { t, i18n } = useTranslation()
  const { categories } = useTemplateCategories()
  const { schema } = usePlatformSchema(platform) as { schema?: PlatformSchema }
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({})
  const [previewContent, setPreviewContent] = useState<Record<string, unknown> | null>(null)
  const sampleData = useMemo(() => ({
    title: t('template.sample.title'),
    eventTitle: t('template.sample.title'),
    name: t('template.sample.name'),
    date: '2025-07-15',
    time: '20:00',
    venue: t('template.sample.venue'),
    city: t('template.sample.city'),
    description: t('template.sample.description'),
    lineup: t('template.sample.lineup'),
    genre: t('template.sample.genre'),
    price: t('template.sample.price'),
    organizer: t('template.sample.organizer'),
    website: t('template.sample.website'),
    ticketInfo: t('template.sample.ticketInfo'),
    email: 'john@example.com',
    link: 'https://example.com/event',
    img1: 'https://example.com/image.jpg',
    image1: 'https://example.com/image.jpg'
  }), [t])

  // Get variable label from schema
  const getVariableLabel = (variableName: string) => {
    if (!schema?.template?.variables) {
      return variableName
    }
    const variable = schema.template.variables.find((v) => v.name === variableName)
    return variable?.label || variableName
  }

  // Create content from template (EXACTLY like main page)
  useEffect(() => {
    if (!template || !platform) {
      setPreviewContent(null)
      return
    }

    // Get locale from i18n
    const previewLocale = getUserLocale(i18n)

    // Select correct template content based on resolved locale
    let templateContent = template.template || {}
    if (previewLocale !== 'en' && template.translations?.[previewLocale]) {
      templateContent = template.translations[previewLocale] as Record<string, string>
    }

    // Generate preview content using sample data + custom variables
    const templateVariables = { ...sampleData, ...customVariables }

    // Create content object like main page (bodyText, subject, etc.)
    const content: Record<string, unknown> = {}
    
    if (templateContent.html) {
      content.bodyText = replaceTemplateVariables(templateContent.html as string, templateVariables as Record<string, string>)
    } else if (templateContent.text) {
      content.text = replaceTemplateVariables(templateContent.text as string, templateVariables as Record<string, string>)
    }
    
    if (templateContent.subject) {
      content.subject = replaceTemplateVariables(templateContent.subject as string, templateVariables as Record<string, string>)
    }

    setPreviewContent(content)
  }, [template, platform, customVariables, i18n.language, sampleData])

  const handleVariableChange = (variable: string, value: string) => {
    setCustomVariables(prev => ({
      ...prev,
      [variable]: value
    }))
  }

  if (!template) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Typography variant="h6" gutterBottom>
          👁️ {t('template.preview')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('template.selectTemplate')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <PageToolbar sx={{ bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            👁️ {template.name}
          </Typography>
          {onEdit && (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={onEdit}
            >
              {t('template.editTemplate')}
            </Button>
          )}
        </Box>
      </PageToolbar>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Template Info */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Unknown'} 
              color="primary" 
              size="small" 
            />
            <Chip 
              label={
                categories?.find(cat => cat.id === template.category)?.name || 
                (template.category
                  ? template.category.charAt(0).toUpperCase() + template.category.slice(1).replace(/-/g, ' ')
                  : 'General')
              } 
              variant="outlined" 
              size="small" 
            />
            {template.isDefault && (
              <Chip 
                label={t('template.default')} 
                color="secondary" 
                size="small" 
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            {template.description || t('template.noDescription')}
          </Typography>

          {/* Variables with translated labels */}
          {template.variables && template.variables.length > 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                📋 {t('template.availableVariables')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {(template.variables || []).map((variable: string) => (
                  <Chip
                    key={variable}
                    label={`{${variable}}`}
                    size="small"
                    variant="outlined"
                    color="info"
                    title={getVariableLabel(variable)}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Custom Variables Input with translated labels */}
        {template.variables && template.variables.length > 0 && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              🎛️ {t('template.customizePreviewVariables')}
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
              gap: 2, 
              mb: 3 
            }}>
              {(template.variables || []).map((variable: string) => (
                <TextField
                  key={variable}
                  label={getVariableLabel(variable)}
                  size="small"
                  value={customVariables[variable] || (sampleData as Record<string, string>)[variable] || ''}
                  onChange={(e) => handleVariableChange(variable, e.target.value)}
                  placeholder={getVariableLabel(variable)}
                />
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Preview Content - Use PlatformPreview like main page */}
        <Typography variant="subtitle2" gutterBottom>
          📄 {t('template.previewResult')}
        </Typography>

        {previewContent && (
          <SectionPanel sx={{ p: 0, overflow: 'hidden', mb: 2, minHeight: 400 }}>
            <PlatformPreview
              platform={platform}
              content={previewContent}
              isActive={true}
            />
          </SectionPanel>
        )}

        {/* Actions */}
        {onEdit && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEdit}
              fullWidth
            >
              {t('template.editTemplate')}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default TemplatePreview
