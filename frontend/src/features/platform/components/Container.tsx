import { useState } from 'react'
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Button
} from '@mui/material'
import {
  AutoAwesome as TemplateIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import PlatformEditor from './PlatformEditor'
import PlatformPreview from './PlatformPreview'
import BulkApplier from '../../templates/components/BulkApplier'
import { usePlatforms } from '../hooks/usePlatformSchema'
import SettingsModal from './SettingsModal'
import SectionPanel from '../../../shared/components/layout/SectionPanel'
import PageToolbar from '../../../shared/components/layout/PageToolbar'
import type { PlatformMeta } from '../types'

function ContentEditor({
  selectedPlatforms,
  platformContent,
  onPlatformContentChange,
  disabled = false
}: {
  selectedPlatforms: string[]
  platformContent: Record<string, Record<string, unknown>>
  onPlatformContentChange: (platformId: string, content: Record<string, unknown>) => void
  disabled?: boolean
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [bulkApplierOpen, setBulkApplierOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [currentPlatformForSettings, setCurrentPlatformForSettings] = useState<string | null>(null)
  const { platforms, loading, error } = usePlatforms() as unknown as { platforms: PlatformMeta[]; loading: boolean; error: string | null }

  // Get available platforms - show all selected platforms, even if backend hasn't loaded yet
  // This ensures email and other platforms are always visible
  const availablePlatforms = selectedPlatforms || []

  // Get platform metadata from backend
  const getPlatformInfo = (platformId: string) => {
    if (!platforms || platforms.length === 0) {
      return { name: platformId, icon: '📝', color: '#666' }
    }

    const platform = platforms.find((p) => p.id === platformId)
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
  const getEditorComponent = (platformId: string) => {
    const content = platformContent[platformId] || {}
    // Use a ref to track the latest content to avoid stale closures
    const onChange = (field: string, value: unknown) => {
      // Get fresh content from platformContent to avoid stale state
      const currentContent = platformContent[platformId] || {}
      onPlatformContentChange(platformId, { ...currentContent, [field]: value })
    }
    
    // Batch change handler - sets entire content object at once (for template application)
    const onBatchChange = (newContent: Record<string, unknown>) => {
      onPlatformContentChange(platformId, newContent)
    }

    return (
      <PlatformEditor
        platform={platformId}
        content={content}
        onChange={onChange}
        onCopy={() => {}}
        onBatchChange={onBatchChange}
        isActive={true}
        onSelect={() => {}}
      />
    )
  }

  // Get preview component - always use generic
  const getPreviewComponent = (platformId: string) => {
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
      <SectionPanel sx={{ textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Loading platforms...</Typography>
      </SectionPanel>
    )
  }

  if (error) {
    return (
      <SectionPanel>
        <Alert severity="error">
          Failed to load platforms: {error}
        </Alert>
      </SectionPanel>
    )
  }

  if (availablePlatforms.length === 0) {
    return (
      <SectionPanel sx={{ textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No platforms selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please select platforms above to start creating content.
        </Typography>
      </SectionPanel>
    )
  }

  const activePlatform = availablePlatforms[activeTab]

  const handleBulkApply = (platformId: string, newContent: Record<string, unknown>) => {
    onPlatformContentChange(platformId, newContent)
  }

  const handleOpenBulkApplier = () => {
    setBulkApplierOpen(true)
  }

  const handleOpenSettings = (platformId: string) => {
    setCurrentPlatformForSettings(platformId)
    setSettingsModalOpen(true)
  }

  return (
    <SectionPanel sx={{ p: 0 }}>
      {/* Tabs Header with Bulk Apply Button */}
      <PageToolbar sx={{ px: 2, pt: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue: number) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ flex: 1 }}
          >
            {availablePlatforms.map((platformId: string, index: number) => {
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
      </PageToolbar>

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
        platformId={currentPlatformForSettings || ''}
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </SectionPanel>
  )
}

export default ContentEditor
