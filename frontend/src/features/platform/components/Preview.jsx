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
  useTheme,
  Tabs,
  Tab
} from '@mui/material'
import { usePlatformMetadata } from '../hooks/usePlatformSchema'
import { getApiUrl } from '../../../shared/utils/api'

function PlatformPreview({ platform, content, isActive }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [previewHtml, setPreviewHtml] = useState(null)
  const [previewDimensions, setPreviewDimensions] = useState(null)
  const [multiPreviews, setMultiPreviews] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Use usePlatformMetadata for platform metadata (name, icon, color)
  const { platform: platformData, loading: metadataLoading, error: metadataError } = usePlatformMetadata(platform)

  // ✅ GENERIC: Fetch preview HTML from backend
  // Backend decides if multi-preview is needed based on content
  // Use JSON.stringify to detect deep changes in content object
  const contentKey = content ? JSON.stringify(content) : null
  
  useEffect(() => {
    if (!platform || !content) {
      setPreviewHtml(null)
      setMultiPreviews(null)
      setLoading(false)
      return
    }

    const fetchPreview = async () => {
      setLoading(true)
      setError(null)

      try {
        const darkMode = theme.palette.mode === 'dark'
        
        // ✅ GENERIC: Try multi-preview first (backend decides if it's needed)
        // If platform doesn't support multi-preview, backend returns single preview
        const endpoint = getApiUrl(`platforms/${platform}/multi-preview?mode=desktop&darkMode=${darkMode}`)
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            content
            // Backend extracts targets from content if needed (platform-specific)
          })
        })

        if (!response.ok) {
          // If multi-preview fails, fallback to single preview
          const fallbackEndpoint = getApiUrl(`platforms/${platform}/preview?mode=desktop&darkMode=${darkMode}`)
          const fallbackResponse = await fetch(fallbackEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
          })

          if (!fallbackResponse.ok) {
            throw new Error(`Failed to render preview: ${fallbackResponse.statusText}`)
          }

          const fallbackData = await fallbackResponse.json()
          if (fallbackData.success && fallbackData.html) {
            setPreviewHtml(fallbackData.html)
            setPreviewDimensions(fallbackData.dimensions || null)
            setMultiPreviews(null)
          } else {
            throw new Error(fallbackData.error || 'Failed to render preview')
          }
          return
        }

        const data = await response.json()
        
        if (data.success && data.previews && Array.isArray(data.previews) && data.previews.length > 0) {
          // Multi-preview response
          setMultiPreviews(data.previews)
          setPreviewHtml(null)
        } else if (data.success && data.html) {
          // Single preview response (backend returned single preview even from multi-preview endpoint)
          setPreviewHtml(data.html)
          setPreviewDimensions(data.dimensions || null)
          setMultiPreviews(null)
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
  }, [platform, contentKey, theme.palette.mode])

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
        {multiPreviews && multiPreviews.length > 0 ? (
          // Multi-preview with tabs
          <Box>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollable="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {multiPreviews.map((preview, index) => {
                const recipientCount = preview.metadata?.recipients?.length || preview.recipients?.length || 0
                const groupName = preview.group || preview.target || 'Alle'
                
                return (
                  <Tab
                    key={index}
                    label={
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {groupName}
                        </Typography>
                        {preview.templateId && (
                          <Typography variant="caption" color="text.secondary">
                            {preview.templateId}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {recipientCount} Empfänger
                        </Typography>
                      </Box>
                    }
                  />
                )
              })}
            </Tabs>
            {multiPreviews[activeTab] && (
              <Box
                sx={{
                  width: '100%',
                  height: multiPreviews[activeTab].dimensions?.height || 'auto',
                  minHeight: multiPreviews[activeTab].dimensions?.height || 400,
                  overflow: 'auto'
                }}
              >
                <iframe
                  srcDoc={multiPreviews[activeTab].html}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    minHeight: multiPreviews[activeTab].dimensions?.height || 400
                  }}
                  title={`${platformName} Preview - ${multiPreviews[activeTab].group || 'Alle'}`}
                />
              </Box>
            )}
          </Box>
        ) : previewHtml ? (
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
