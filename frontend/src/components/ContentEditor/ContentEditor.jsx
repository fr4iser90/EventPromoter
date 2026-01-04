import React, { useState } from 'react'
import {
  Paper,
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
  Alert
} from '@mui/material'

// Import all editors
import TwitterEditor from '../PlatformEditor/TwitterEditor'
import InstagramEditor from '../PlatformEditor/InstagramEditor'
import FacebookEditor from '../PlatformEditor/FacebookEditor'
import LinkedEditor from '../PlatformEditor/LinkedEditor'
import RedditEditor from '../PlatformEditor/RedditEditor'
import EmailEditor from '../PlatformEditor/EmailEditor'

// Import all previews
import TwitterPreview from '../PlatformPreview/TwitterPreview'
import EmailPreview from '../PlatformPreview/EmailPreview'

function ContentEditor({ selectedPlatforms, platformContent, onPlatformContentChange, disabled = false }) {
  const [activeTab, setActiveTab] = useState(0)

  // Get available platforms (only selected ones)
  const availablePlatforms = selectedPlatforms.filter(platform => {
    // Map platform IDs to display names
    const platformMap = {
      twitter: 'Twitter',
      instagram: 'Instagram',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      reddit: 'Reddit',
      email: 'Email'
    }
    return platformMap[platform]
  })

  // Get editor component for platform
  const getEditorComponent = (platform) => {
    const content = platformContent[platform] || {}
    const onChange = (newContent) => {
      onPlatformContentChange(platform, newContent)
    }

    switch (platform) {
      case 'twitter':
        return <TwitterEditor content={content} onChange={onChange} disabled={disabled} />
      case 'instagram':
        return <InstagramEditor content={content} onChange={onChange} disabled={disabled} />
      case 'facebook':
        return <FacebookEditor content={content} onChange={onChange} disabled={disabled} />
      case 'linkedin':
        return <LinkedEditor content={content} onChange={onChange} disabled={disabled} />
      case 'reddit':
        return <RedditEditor content={content} onChange={onChange} disabled={disabled} />
      case 'email':
        return <EmailEditor content={content} onChange={onChange} disabled={disabled} />
      default:
        return (
          <Alert severity="warning">
            No editor available for platform: {platform}
          </Alert>
        )
    }
  }

  // Get preview component for platform
  const getPreviewComponent = (platform) => {
    const content = platformContent[platform] || {}

    switch (platform) {
      case 'twitter':
        return <TwitterPreview content={content} />
      case 'email':
        return <EmailPreview content={content} />
      default:
        return (
          <Alert severity="info">
            Preview not yet implemented for {platform}
          </Alert>
        )
    }
  }

  // Get platform display info
  const getPlatformInfo = (platform) => {
    const info = {
      twitter: { name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
      instagram: { name: 'Instagram', icon: '📸', color: '#E4405F' },
      facebook: { name: 'Facebook', icon: '👥', color: '#1877F2' },
      linkedin: { name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
      reddit: { name: 'Reddit', icon: '🟠', color: '#FF4500' },
      email: { name: 'Email', icon: '📧', color: '#EA4335' }
    }
    return info[platform] || { name: platform, icon: '📝', color: '#666' }
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
          {availablePlatforms.map((platform, index) => {
            const info = getPlatformInfo(platform)
            return (
              <Tab
                key={platform}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                  </Box>
                }
                sx={{
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: activeTab === index ? 'bold' : 'normal'
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
