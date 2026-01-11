/**
 * Platform Preview Component
 * 
 * ✅ 100% GENERIC: Frontend renders NOTHING except final HTML from backend
 * 
 * Architecture:
 * - Backend renders HTML based on schema (slots) + platform renderer
 * - Frontend only displays: <iframe srcDoc={html} /> or dangerouslySetInnerHTML
 * - Zero knowledge of platforms, render types, or rendering logic
 * 
 * @module components/PlatformPreview
 */

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
import { usePlatformMetadata } from '../../hooks/usePlatformSchema'
import config from '../../config'

function PlatformPreview({ platform, content, isActive }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [previewHtml, setPreviewHtml] = useState(null)
  const [previewDimensions, setPreviewDimensions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use usePlatformMetadata for platform metadata (name, icon, color)
  const { platform: platformData, loading: metadataLoading, error: metadataError } = usePlatformMetadata(platform)

  // ✅ GENERIC: Fetch preview HTML from backend
  useEffect(() => {
    if (!platform || !content) {
      setPreviewHtml(null)
      setLoading(false)
      return
    }

    const fetchPreview = async () => {
      setLoading(true)
      setError(null)

      try {
        const darkMode = theme.palette.mode === 'dark'
        const response = await fetch(`${config.apiUrl}/platforms/${platform}/preview?mode=desktop&darkMode=${darkMode}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        })

        if (!response.ok) {
          throw new Error(`Failed to render preview: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (data.success && data.html) {
          setPreviewHtml(data.html)
          setPreviewDimensions(data.dimensions || null)
        } else {
          throw new Error(data.error || 'Failed to render preview')
        }
      } catch (err) {
        console.error('Preview render error:', err)
        setError(err.message || 'Failed to load preview')
      } finally {
        setLoading(false)
      }
    }

    fetchPreview()
  }, [platform, content, theme.palette.mode])

  // Use platform metadata from backend - NO HARDCODED VALUES
  const platformColor = platformData?.color || platformData?.metadata?.color || '#666'
  const platformName = platformData?.name || platformData?.metadata?.displayName || platform
  const platformIcon = platformData?.icon || platformData?.metadata?.icon || '📝'

  if (metadataLoading || loading) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={24} />
      </Paper>
    )
  }

  if (metadataError || error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">
          Failed to load {platform} preview: {error || metadataError}
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper sx={{
      p: 2,
      mb: 2,
      border: `2px solid ${isActive ? platformColor : theme.palette.divider}`
    }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: platformColor }}>
        {platformIcon} {platformName} {t('preview.preview')}
      </Typography>

      <Box sx={{ 
        mt: 2,
        borderRadius: 2, 
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        bgcolor: 'background.default'
      }}>
        {previewHtml ? (
          // ✅ ZERO LOGIC: Just display HTML from backend
          // Backend has already rendered everything based on schema
          <Box
            sx={{
              width: '100%',
              height: previewDimensions?.height || 'auto',
              minHeight: previewDimensions?.height || 400,
              overflow: 'auto'
            }}
          >
            <iframe
              srcDoc={previewHtml}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                minHeight: previewDimensions?.height || 400
              }}
              title={`${platformName} Preview`}
            />
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('preview.noContent')}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default PlatformPreview
