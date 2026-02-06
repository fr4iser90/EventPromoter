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
  Tab,
  Tooltip
} from '@mui/material'
import { usePlatformMetadata, usePlatformSchema } from '../hooks/usePlatformSchema'
import { getApiUrl } from '../../../shared/utils/api'
import { getUserLocale, getValidLocale } from '../../../shared/utils/localeUtils'
import { resolveTargetsLocale, resolveGroupsLocale } from '../../../shared/utils/targetUtils'
import { PreviewFrame } from '../../../shared/components/PreviewFrame'

function PlatformPreview({ platform, content, isActive }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [previewHtml, setPreviewHtml] = useState(null)
  const [previewCss, setPreviewCss] = useState(null)
  const [previewDimensions, setPreviewDimensions] = useState(null)
  const [multiPreviews, setMultiPreviews] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Use usePlatformMetadata for platform metadata (name, icon, color)
  const { platform: platformData, loading: metadataLoading, error: metadataError } = usePlatformMetadata(platform)
  
  // ✅ Get schema for locale resolution (same as Selector.jsx)
  const { schema } = usePlatformSchema(platform)
  
  // ✅ Resolve locale: Priority: templateLocale (from content) > Target Locale > User Language
  const [previewLocale, setPreviewLocale] = useState(() => getUserLocale(i18n))

  // ✅ GENERIC: Fetch preview HTML from backend
  // Backend decides if multi-preview is needed based on content
  // Use JSON.stringify to detect deep changes in content object
  const contentKey = content ? JSON.stringify(content) : null
  
  // ✅ Resolve locale from content (same logic as Modal Preview)
  useEffect(() => {
    if (!platform || !content || !schema) {
      setPreviewLocale(getUserLocale(i18n))
      return
    }

    const resolveLocale = async () => {
      let locale = getUserLocale(i18n) // Default: User Language
      
      // Get targets block from schema
      const targetsBlock = schema?.editor?.blocks?.find(block => block.type === 'targets')
      if (!targetsBlock) {
        setPreviewLocale(locale)
        return
      }
      
      // ✅ Priority 1: Check _templates array for templateLocale (new format)
      const templates = content._templates || []
      if (templates.length > 0) {
        // Use templateLocale from first template (for single preview)
        // Multi-preview will use locale per template in backend
        const firstTemplate = templates[0]
        if (firstTemplate.targets?.templateLocale) {
          locale = getValidLocale(firstTemplate.targets.templateLocale)
          setPreviewLocale(locale)
          return
        }
      }
      
      // Get targets value from content (fallback for old format)
      const targetsValue = content[targetsBlock.id]
      if (!targetsValue) {
        setPreviewLocale(locale)
        return
      }
      
      // Priority 2: Use templateLocale from content if explicitly set
      if (targetsValue.templateLocale) {
        locale = getValidLocale(targetsValue.templateLocale)
      } else {
        // Priority 2: Try to resolve locale from targets
        const dataEndpoints = targetsBlock.rendering?.dataEndpoints || {}
        
        try {
          if (targetsValue.mode === 'individual' && targetsValue.individual?.length > 0) {
            const targetLocale = await resolveTargetsLocale(
              targetsValue.individual,
              platform,
              dataEndpoints.recipients || `platforms/${platform}/targets`
            )
            if (targetLocale) locale = targetLocale
          } else if (targetsValue.mode === 'groups' && targetsValue.groups?.length > 0) {
            const groupLocale = await resolveGroupsLocale(
              targetsValue.groups,
              platform,
              dataEndpoints.recipientGroups || `platforms/${platform}/target-groups`
            )
            if (groupLocale) locale = groupLocale
          }
        } catch (error) {
          console.warn('Failed to resolve target locale for preview:', error)
        }
      }
      
      setPreviewLocale(locale)
    }
    
    resolveLocale()
  }, [platform, content, schema, i18n.language])
  
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
        // ✅ No darkMode parameter needed - Frontend sets CSS Variables based on theme
        
        // ✅ GENERIC: Try multi-preview first (backend decides if it's needed)
        // If platform doesn't support multi-preview, backend returns single preview
        // ✅ Include resolved locale parameter for correct language rendering
        const endpoint = getApiUrl(`platforms/${platform}/multi-preview?mode=desktop&locale=${previewLocale}`)
        
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
          // ✅ Include resolved locale parameter for correct language rendering
          const fallbackEndpoint = getApiUrl(`platforms/${platform}/preview?mode=desktop&locale=${previewLocale}`)
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
            setPreviewCss(fallbackData.css || null)
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
          setPreviewCss(null)
        } else if (data.success && data.html) {
          // Single preview response (backend returned single preview even from multi-preview endpoint)
          setPreviewHtml(data.html)
          setPreviewCss(data.css || null)
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
  }, [platform, contentKey, theme.palette.mode, previewLocale, i18n.language])

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
              onChange={(e, newValue) => {
                setActiveTab(newValue)
              }}
              variant="scrollable"
              scrollable="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {multiPreviews.map((preview, index) => {
                const targets = preview.metadata?.targets || preview.targets || []
                const targetCount = targets.length
                const groupName =
                  preview.group ||
                  preview.target ||
                  (targetCount === 0 ? 'Keine Targets' : 'Individual')
                
                // Build tooltip content
                const tooltipContent = (
                  <Box>
                    {targetCount === 0 ? (
                      <Typography variant="body2">Keine Targets ausgewählt</Typography>
                    ) : null}
                    {preview.group ? (
                      <>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          Gruppe: {groupName}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Targets in Gruppe ({targetCount}):
                        </Typography>
                      </>
                    ) : (
                      targetCount > 0 ? (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Targets ({targetCount}):
                        </Typography>
                      ) : null
                    )}
                    {targetCount > 0 ? (
                      <Box component="ul" sx={{ m: 0, pl: 2, maxHeight: '200px', overflow: 'auto' }}>
                        {targets.map((target, targetIndex) => (
                          <li key={targetIndex}>
                            <Typography variant="caption">{target}</Typography>
                          </li>
                        ))}
                      </Box>
                    ) : null}
                    {preview.templateId && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Template: {preview.templateId}
                      </Typography>
                    )}
                  </Box>
                )
                
                return (
                  <Tooltip
                    key={index}
                    title={tooltipContent}
                    arrow
                    placement="top"
                  >
                    <Tab
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
                          {targetCount > 0 ? (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {targetCount} Targets
                            </Typography>
                          ) : null}
                        </Box>
                      }
                    />
                  </Tooltip>
                )
              })}
            </Tabs>
            {multiPreviews[activeTab] && (() => {
              const currentPreview = multiPreviews[activeTab]
              return (
                <PreviewFrame
                  document={{
                    html: currentPreview.html,
                    css: currentPreview.css,
                    meta: {
                      title: `${platformName} Preview - ${currentPreview.group || 'Alle'}`
                    }
                  }}
                  dimensions={currentPreview.dimensions}
                />
              )
            })()}
          </Box>
        ) : previewHtml ? (
          // ✅ Generic PreviewFrame: Hostet Content-HTML vom Backend
          <PreviewFrame
            document={{
              html: previewHtml,
              css: previewCss,
              meta: {
                title: `${platformName} Preview`
              }
            }}
            dimensions={previewDimensions}
            />
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
