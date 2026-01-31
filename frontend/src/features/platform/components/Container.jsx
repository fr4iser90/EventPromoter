import React, { useState, useEffect } from 'react'
import {
  Paper,
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton
} from '@mui/material'
import {
  AutoAwesome as TemplateIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import Editor from './Editor'
import Preview from './Preview'
import BulkApplier from '../../templates/components/BulkApplier'
import { usePlatforms } from '../hooks/usePlatformSchema'
import { useTemplateCategories } from '../../templates/hooks/useTemplateCategories'
import SettingsModal from './SettingsModal'

function ContentEditor({ selectedPlatforms, platformContent, onPlatformContentChange, disabled = false }) {
  const [activeTab, setActiveTab] = useState(0)
  const [bulkApplierOpen, setBulkApplierOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [currentPlatformForSettings, setCurrentPlatformForSettings] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const { platforms, loading, error } = usePlatforms()
  const { categories, loading: categoriesLoading } = useTemplateCategories()

  // Get available platforms - show all selected platforms, even if backend hasn't loaded yet
  // This ensures email and other platforms are always visible
  const availablePlatforms = selectedPlatforms || []

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
    // Use a ref to track the latest content to avoid stale closures
    const onChange = (field, value) => {
      // Get fresh content from platformContent to avoid stale state
      const currentContent = platformContent[platformId] || {}
      onPlatformContentChange(platformId, { ...currentContent, [field]: value })
    }
    
    // Batch change handler - sets entire content object at once (for template application)
    const onBatchChange = (newContent) => {
      onPlatformContentChange(platformId, newContent)
    }

    return (
      <Editor
        platform={platformId}
        content={content}
        onChange={onChange}
        onBatchChange={onBatchChange}
        isActive={true}
        onSelect={() => {}}
      />
    )
  }

  // Get preview component - always use generic
  const getPreviewComponent = (platformId) => {
    const content = platformContent[platformId] || {}

    return (
      <Preview
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

  const handleBulkApply = (platformId, newContent) => {
    onPlatformContentChange(platformId, newContent)
  }

  const handleOpenBulkApplier = () => {
    setBulkApplierOpen(true)
  }

  const handleOpenSettings = (platformId) => {
    setCurrentPlatformForSettings(platformId)
    setSettingsModalOpen(true)
  }

  return (
    <Paper sx={{ p: 0 }}>
      {/* Tabs Header with Bulk Apply Button */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ flex: 1 }}
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
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenSettings(platformId)
                        }}
                        sx={{ 
                          ml: 0.5, 
                          p: 0.5, 
                          display: 'flex', 
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'action.hover',
                            borderRadius: '50%'
                          }
                        }}
                      >
                        <SettingsIcon fontSize="inherit" />
                      </Box>
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
          
          {/* Bulk Apply Entry Point */}
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<TemplateIcon />}
              onClick={handleOpenBulkApplier}
              disabled={disabled || availablePlatforms.length === 0}
              size="small"
            >
              Apply Templates
            </Button>
          </Box>
        </Box>
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

      {/* Bulk Template Applier Modal */}
      <BulkApplier
        open={bulkApplierOpen}
        onClose={() => setBulkApplierOpen(false)}
        selectedPlatforms={availablePlatforms}
        platformContent={platformContent}
        onApply={handleBulkApply}
      />

      {/* Platform Settings Modal */}
      <SettingsModal
        platformId={currentPlatformForSettings}
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </Paper>
  )
}

export default ContentEditor
