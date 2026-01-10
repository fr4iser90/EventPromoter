import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material'
import { usePlatformMetadata } from '../../hooks/usePlatformSchema'
import config from '../../config'

function PlatformPreview({ platform, content, isActive }) {
  const { t } = useTranslation()
  const { platform: platformData, loading, error } = usePlatformMetadata(platform)

  if (loading) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={24} />
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">
          Failed to load {platform} preview: {error}
        </Alert>
      </Paper>
    )
  }

  // Use platform metadata from backend - NO HARDCODED VALUES
  const platformColor = platformData?.color || platformData?.metadata?.color || '#666'
  const platformName = platformData?.name || platformData?.metadata?.displayName || platform
  const platformIcon = platformData?.icon || platformData?.metadata?.icon || '📝'

  // Get preview schema if available
  const previewSchema = platformData?.schema?.preview
  const contentMapping = previewSchema?.contentMapping || []

  // ✅ SCHEMA-DRIVEN: Render content based on contentMapping
  const renderContentField = (mapping) => {
    const fieldValue = content?.[mapping.field]
    if (!fieldValue) return null

    const renderAs = mapping.renderAs || 'text'
    const className = mapping.className || ''

    switch (renderAs) {
      case 'heading':
        return (
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }} className={className}>
            {fieldValue}
          </Typography>
        )
      case 'paragraph':
        return (
          <Typography variant="body2" sx={{ mb: 1 }} className={className}>
            {fieldValue}
          </Typography>
        )
      case 'html':
        return (
          <Box 
            dangerouslySetInnerHTML={{ __html: fieldValue }}
            className={className}
            sx={{ 
              '& img': { maxWidth: '100%', height: 'auto' },
              '& a': { color: platformColor }
            }}
          />
        )
      case 'image':
        return (
          <Box sx={{ mb: 1 }} className={className}>
            <img src={fieldValue} alt={mapping.label || 'Preview'} style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>
        )
      case 'link':
        return (
          <Typography variant="body2" sx={{ mb: 1 }} className={className}>
            <a href={fieldValue} target="_blank" rel="noopener noreferrer" style={{ color: platformColor }}>
              {mapping.label || fieldValue}
            </a>
          </Typography>
        )
      case 'quote':
        return (
          <Box sx={{ borderLeft: '3px solid', borderColor: platformColor, pl: 2, mb: 1, fontStyle: 'italic' }} className={className}>
            <Typography variant="body2">
              {fieldValue}
            </Typography>
          </Box>
        )
      case 'code':
        return (
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, overflow: 'auto', mb: 1 }} className={className}>
            <Typography variant="body2" component="code">
              {fieldValue}
            </Typography>
          </Box>
        )
      case 'text':
      default:
        return (
          <Typography variant="body2" sx={{ mb: 1 }} className={className}>
            {fieldValue}
          </Typography>
        )
    }
  }

  return (
    <Paper sx={{
      p: 2,
      mb: 2,
      bgcolor: previewSchema?.styling?.backgroundColor || '#f8f9fa',
      border: `2px solid ${isActive ? platformColor : '#e0e0e0'}`
    }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: platformColor }}>
        {platformIcon} {platformName} {t('preview.preview')}
      </Typography>

      <Box sx={{ 
        p: 2, 
        bgcolor: previewSchema?.styling?.backgroundColor || 'white', 
        borderRadius: 2, 
        border: '1px solid #e0e0e0',
        color: previewSchema?.styling?.textColor || 'inherit',
        fontFamily: previewSchema?.styling?.fontFamily || 'inherit'
      }}>
        {/* ✅ SCHEMA-DRIVEN: Render content based on contentMapping */}
        {contentMapping.length > 0 ? (
          <>
            {contentMapping
              .filter(mapping => mapping.show !== false)
              .sort((a, b) => (a.order || 999) - (b.order || 999))
              .map((mapping) => (
                <Box key={mapping.field}>
                  {mapping.label && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {mapping.label}:
                    </Typography>
                  )}
                  {renderContentField(mapping)}
                </Box>
              ))}
            {contentMapping.every(m => !content?.[m.field]) && (
              <Typography variant="body2" color="text.secondary">
                {t('preview.noContent')}
              </Typography>
            )}
          </>
        ) : (
          /* Fallback: Render all content fields if no mapping defined */
          <>
            {Object.entries(content || {}).map(([key, value]) => (
              value && (
                <Typography key={key} variant="body2" sx={{ mb: 1 }}>
                  <strong>{key}:</strong> {String(value)}
                </Typography>
              )
            ))}
            {!content || Object.keys(content).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                {t('preview.noContent')}
              </Typography>
            )}
          </>
        )}

        {/* Show metadata if preview schema requests it */}
        {previewSchema?.options?.showMetadata && platformData && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="caption" color="text.secondary">
              Platform: {platformName} | Version: {platformData?.version || platformData?.metadata?.version || 'N/A'}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default PlatformPreview
