import React, { useState, useEffect } from 'react'
import {
  Paper,
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material'
import GenericPlatformEditor from '../GenericPlatformEditor/GenericPlatformEditor'
import PlatformPreview from '../PlatformPreview/PlatformPreview'
import { usePlatforms } from '../../hooks/usePlatformSchema'
import config from '../../config'

function ContentEditor({ selectedPlatforms, platformContent, onPlatformContentChange, disabled = false }) {
  const [activeTab, setActiveTab] = useState(0)
  const { platforms, loading, error } = usePlatforms()

  // Get available platforms with metadata from backend
  const availablePlatforms = selectedPlatforms.filter(platformId => {
    // Check if platform exists in backend data
    if (platforms && platforms.length > 0) {
      return platforms.some(p => p.id === platformId)
    }
    // If platforms not loaded yet, allow all selected
    return true
  })

  // Get platform metadata from backend
  const getPlatformInfo = (platformId) => {
    if (!platforms || platforms.length === 0) {
      return { name: platformId, icon: '📝', color: '#666' }
    }

    const platform = platforms.find(p => p.id === platformId)
    if (platform) {
      return {
        name: platform.name || platform.metadata?.displayName || platformId,
        icon: platform.icon || platform.metadata?.icon || '📝',
        color: platform.color || platform.metadata?.color || '#666'
      }
    }

    return { name: platformId, icon: '📝', color: '#666' }
  }

  // Get editor component - always use generic
  const getEditorComponent = (platformId) => {
    const content = platformContent[platformId] || {}
    const onChange = (field, value) => {
      onPlatformContentChange(platformId, { ...content, [field]: value })
    }

    return (
      <GenericPlatformEditor
        platform={platformId}
        content={content}
        onChange={onChange}
        isActive={true}
        onSelect={() => {}}
      />
    )
  }

  // Get preview component - always use generic
  const getPreviewComponent = (platformId) => {
    const content = platformContent[platformId] || {}

    return (
      <PlatformPreview
        platform={platformId}
        content={content}
        isActive={true}
      />
    )
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Loading platforms...</Typography>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load platforms: {error}
        </Alert>
      </Paper>
    )
  }

  if (availablePlatforms.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No platforms selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please select platforms above to start creating content.
        </Typography>
      </Paper>
    )
  }

  const activePlatform = availablePlatforms[activeTab]

  return (
    <Paper sx={{ p: 0 }}>
      {/* Tabs Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, pt: 1 }}
        >
          {availablePlatforms.map((platformId, index) => {
            const info = getPlatformInfo(platformId)
            return (
              <Tab
                key={platformId}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                  </Box>
                }
                sx={{
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: activeTab === index ? 'bold' : 'normal',
                  color: info.color
                }}
              />
            )
          })}
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Editor Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              ✏️ Content Editor
            </Typography>
            {getEditorComponent(activePlatform)}
          </Grid>

          {/* Preview Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              👁️ Live Preview
            </Typography>
            {getPreviewComponent(activePlatform)}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default ContentEditor
