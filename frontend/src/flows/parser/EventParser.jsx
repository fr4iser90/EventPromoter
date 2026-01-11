import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SaveIcon from '@mui/icons-material/Save'
import RefreshIcon from '@mui/icons-material/Refresh'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import useStore from '../../store'
import { Editor as GenericPlatformEditor } from '../../features/platform'
import { Preview as PlatformPreview } from '../../features/platform'
import { usePlatforms } from '../../features/platform/hooks/usePlatformSchema'
import config from '../../config'

// Platform Preview Component - GENERIC
function PlatformPreviewComponent({ platform, content, isActive }) {
  return (
    <PlatformPreview
      platform={platform}
      content={content}
      isActive={isActive}
    />
  )
}

// Platform Editor Component - GENERIC
function PlatformEditorComponent({ platform, content, onChange, onCopy, isActive, onSelect }) {
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
  const { t } = useTranslation()
  const {
    uploadedFileRefs,
    currentEvent,
    parsingStatus,
    selectedPlatforms,
    platformContent,
    setPlatformContent,
    resetPlatformContent
  } = useStore()

  const [activeTab, setActiveTab] = useState(0)
  const [parsedData, setParsedData] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [editedData, setEditedData] = useState(null)
  const [activePlatform, setActivePlatform] = useState(null)
  const { platforms, loading: platformsLoading } = usePlatforms()

  // Set first platform as active when platforms are loaded
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !activePlatform) {
      setActivePlatform(selectedPlatforms[0])
    }
  }, [selectedPlatforms, activePlatform])

  // Get platform info from backend - GENERIC
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

  // Handle data editing
  const handleDataChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleVenueChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      venue: {
        ...prev.venue,
        [field]: value
      }
    }))
  }

  const handlePlatformContentChange = (platform, field, value) => {
    const currentContent = platformContent[platform] || {}
    setPlatformContent(platform, {
      ...currentContent,
      [field]: value
    })
  }

  const copyContent = (fromPlatform, toPlatform) => {
    if (!fromPlatform || !toPlatform || fromPlatform === toPlatform) return

    const sourceContent = platformContent[fromPlatform] || {}
    const targetContent = platformContent[toPlatform] || {}

    // Copy text content (generic approach)
    const textFields = ['text', 'caption', 'body', 'html']
    textFields.forEach(field => {
      if (sourceContent[field]) {
        setPlatformContent(toPlatform, {
          ...targetContent,
          [field]: sourceContent[field]
        })
      }
    })
  }

  const resetContent = () => {
    resetPlatformContent()
    setEditedData(null)
    setParsedData(null)
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
          value={selectedPlatforms.indexOf(activePlatform)}
          onChange={(e, newValue) => setActivePlatform(selectedPlatforms[newValue])}
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
