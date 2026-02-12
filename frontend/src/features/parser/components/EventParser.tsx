import { useState, useEffect } from 'react'
import { Paper, Typography, Box, Button, Grid, CircularProgress, Tabs, Tab } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import useStore from '../../../store'
import { PlatformEditor as GenericPlatformEditor, PlatformPreview } from '../../platform'
import { usePlatforms } from '../../platform/hooks/usePlatformSchema'

// Platform Preview Component - GENERIC
function PlatformPreviewComponent({
  platform,
  content,
  isActive
}: {
  platform: string
  content: Record<string, unknown>
  isActive: boolean
}) {
  return (
    <PlatformPreview
      platform={platform}
      content={content}
      isActive={isActive}
    />
  )
}

// Platform Editor Component - GENERIC
function PlatformEditorComponent({
  platform,
  content,
  onChange,
  onCopy,
  isActive,
  onSelect
}: {
  platform: string
  content: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
  onCopy: () => void
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <GenericPlatformEditor
      platform={platform}
      content={content}
      onChange={onChange}
      onCopy={onCopy}
      isActive={isActive}
      onSelect={onSelect}
    />
  )
}

function EventParser() {
  const { selectedPlatforms, platformContent, setPlatformContent, resetPlatformContent } = useStore() as unknown as {
    selectedPlatforms: string[]
    platformContent: Record<string, Record<string, unknown>>
    setPlatformContent: (platform: string, content: Record<string, unknown>) => void
    resetPlatformContent: () => void
  }
  const [activePlatform, setActivePlatform] = useState<string | null>(null)
  const { platforms, loading: platformsLoading } = usePlatforms() as unknown as {
    platforms: Array<{
      id: string
      name?: string
      icon?: string
      color?: string
      metadata?: { displayName?: string; icon?: string; color?: string }
    }>
    loading: boolean
  }

  // Set first platform as active when platforms are loaded
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !activePlatform) {
      setActivePlatform(selectedPlatforms[0])
    }
  }, [selectedPlatforms, activePlatform])

  // Get platform info from backend - GENERIC
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

  const handlePlatformContentChange = (platform: string, field: string, value: unknown) => {
    const currentContent = platformContent[platform] || {}
    setPlatformContent(platform, {
      ...currentContent,
      [field]: value
    })
  }

  const copyContent = (fromPlatform: string, toPlatform: string) => {
    if (!fromPlatform || !toPlatform || fromPlatform === toPlatform) return

    const sourceContent = platformContent[fromPlatform] || {}
    const targetContent = platformContent[toPlatform] || {}

    // Generic copy: move non-internal fields without platform-specific assumptions.
    const copiedFields = Object.entries(sourceContent).reduce<Record<string, unknown>>((acc, [key, value]) => {
      if (!key.startsWith('_') && value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {})

        setPlatformContent(toPlatform, {
          ...targetContent,
      ...copiedFields
    })
  }

  const resetContent = () => {
    resetPlatformContent()
  }

  if (platformsLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Loading platforms...</Typography>
      </Paper>
    )
  }

  if (selectedPlatforms.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No platforms selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please select platforms to start creating content.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        📝 Content Creation
      </Typography>

      {/* Platform Tabs - GENERIC */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activePlatform ? selectedPlatforms.indexOf(activePlatform) : 0}
          onChange={(_, newValue: number) => setActivePlatform(selectedPlatforms[newValue] || null)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {selectedPlatforms.map((platformId) => {
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
                  textTransform: 'none',
                  color: info.color
                }}
              />
            )
          })}
        </Tabs>
      </Box>

      {/* Active Platform Editor and Preview - GENERIC */}
      {activePlatform && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              ✏️ Editor
            </Typography>
            <PlatformEditorComponent
              platform={activePlatform}
              content={platformContent[activePlatform] || {}}
              onChange={(field, value) => handlePlatformContentChange(activePlatform, field, value)}
              onCopy={() => copyContent(activePlatform, activePlatform)}
              isActive={true}
              onSelect={() => {}}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              👁️ Preview
            </Typography>
            <PlatformPreviewComponent
              platform={activePlatform}
              content={platformContent[activePlatform] || {}}
              isActive={true}
            />
          </Grid>
        </Grid>
      )}

      {/* Content Controls */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={resetContent}>
          Reset All
        </Button>
        <Button variant="outlined" startIcon={<ContentCopyIcon />}>
          Copy Between Platforms
        </Button>
      </Box>
    </Paper>
  )
}

export default EventParser
