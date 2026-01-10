import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material'
import ReactMarkdown from 'react-markdown'
import { usePlatformSchema, usePlatformMetadata } from '../../hooks/usePlatformSchema'
import config from '../../config'

function PlatformPreview({ platform, content, isActive }) {
  const { t } = useTranslation()
  const theme = useTheme()
  // Use usePlatformSchema to get resolved schema with darkMode (tokens already resolved!)
  const { schema, loading: schemaLoading, error: schemaError } = usePlatformSchema(platform)
  // Use usePlatformMetadata for platform metadata (name, icon, color)
  const { platform: platformData, loading: metadataLoading, error: metadataError } = usePlatformMetadata(platform)
  
  const loading = schemaLoading || metadataLoading
  const error = schemaError || metadataError

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

  // Get preview schema from resolved schema (tokens already resolved by backend!)
  const previewSchema = schema?.preview
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
      case 'markdown':
        return (
          <Box 
            sx={{ 
              mb: 1,
              '& p': { mb: 1 },
              '& ul, & ol': { mb: 1, pl: 2 },
              '& li': { mb: 0.5 },
              '& strong': { fontWeight: 'bold' },
              '& em': { fontStyle: 'italic' },
              '& code': { 
                bgcolor: 'background.default', 
                px: 0.5, 
                borderRadius: 0.5,
                fontFamily: 'monospace',
                fontSize: '0.9em'
              },
              '& pre': {
                bgcolor: 'background.default',
                p: 1,
                borderRadius: 1,
                overflow: 'auto',
                mb: 1
              },
              '& pre code': {
                bgcolor: 'transparent',
                px: 0
              },
              '& a': { color: platformColor },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                fontWeight: 'bold',
                mb: 1,
                mt: 2
              },
              '& h1': { fontSize: '1.5em' },
              '& h2': { fontSize: '1.3em' },
              '& h3': { fontSize: '1.1em' },
              '& blockquote': {
                borderLeft: `3px solid ${platformColor}`,
                pl: 2,
                ml: 0,
                fontStyle: 'italic',
                color: 'text.secondary'
              }
            }} 
            className={className}
          >
            <ReactMarkdown>{fieldValue}</ReactMarkdown>
          </Box>
        )
      case 'html':
        // Remove <style> tags and inline styles from HTML to respect dark mode
        const cleanHtml = (() => {
          if (typeof fieldValue !== 'string') return fieldValue
          
          // Create a temporary DOM element to parse HTML
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = fieldValue
          
          // Remove all <style> tags
          const styleTags = tempDiv.querySelectorAll('style')
          styleTags.forEach(tag => tag.remove())
          
          // Remove style="" attributes from all elements
          const elementsWithStyle = tempDiv.querySelectorAll('[style]')
          elementsWithStyle.forEach(el => el.removeAttribute('style'))
          
          return tempDiv.innerHTML
        })()
        
        return (
          <Box 
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
            className={className}
            sx={{ 
              '& img': { maxWidth: '100%', height: 'auto', display: 'block', marginBottom: 1 },
              '& a': { color: platformColor },
              // Ensure all elements inherit theme colors
              '& *': {
                color: 'inherit !important'
              },
              // Override any remaining background colors
              '& [class*="container"], & [class*="header"], & [class*="footer"], & div, & p, & span': {
                backgroundColor: 'transparent !important',
                background: 'transparent !important'
              }
            }}
          />
        )
      case 'image':
        // Handle both single image URL and array of images
        const imageUrls = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
        return (
          <Box sx={{ mb: 1 }} className={className}>
            {imageUrls.map((url, idx) => (
              <img 
                key={idx}
                src={url} 
                alt={mapping.label || `Preview ${idx + 1}`} 
                style={{ maxWidth: '100%', height: 'auto', marginBottom: idx < imageUrls.length - 1 ? 1 : 0 }} 
              />
            ))}
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
          <Box component="pre" sx={{ bgcolor: 'background.default', p: 1, borderRadius: 1, overflow: 'auto', mb: 1 }} className={className}>
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
      // Use resolved backgroundColor from schema (backend resolved tokens)
      bgcolor: previewSchema?.styling?.backgroundColor || 'background.paper',
      border: `2px solid ${isActive ? platformColor : theme.palette.divider}`
    }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: platformColor }}>
        {platformIcon} {platformName} {t('preview.preview')}
      </Typography>

      <Box sx={{ 
        p: 2, 
        // Use resolved backgroundColor from schema (backend resolved tokens)
        bgcolor: previewSchema?.styling?.backgroundColor || 'background.default', 
        borderRadius: 2, 
        border: `1px solid ${theme.palette.divider}`,
        // Use resolved textColor from schema (backend resolved tokens)
        color: previewSchema?.styling?.textColor || 'text.primary',
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
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
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
