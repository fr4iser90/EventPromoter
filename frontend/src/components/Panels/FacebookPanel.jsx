import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'
import useStore from '../../store'

function FacebookPanel() {
  const { platformSettings, setPlatformSettings } = useStore()
  const [selectedPage, setSelectedPage] = useState('')
  const [postingType, setPostingType] = useState('post')
  const [schedulePost, setSchedulePost] = useState(false)
  const [privacy, setPrivacy] = useState('public')

  // Mock Facebook pages - in real app this would come from API
  const availablePages = [
    { id: 'page1', name: 'My Business Page', followers: 1250 },
    { id: 'page2', name: 'Events & Promotions', followers: 890 },
    { id: 'page3', name: 'Personal Profile', followers: null }
  ]

  // Panel settings are now managed by backend
  // No localStorage persistence needed

  return (
    <Paper elevation={3} sx={{
      p: 2,
      width: { xs: '100%', sm: 280 },
      maxWidth: { xs: '100%', sm: 280 },
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FacebookIcon sx={{ mr: 1, color: '#1877F2' }} />
        <Typography variant="h6">
          Facebook Settings
        </Typography>
      </Box>

      {/* Page Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Facebook Page</InputLabel>
        <Select
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          label="Facebook Page"
        >
          {availablePages.map(page => (
            <MenuItem key={page.id} value={page.id}>
              {page.name} {page.followers && `(${page.followers} followers)`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Posting Type */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Posting Type</InputLabel>
        <Select
          value={postingType}
          onChange={(e) => setPostingType(e.target.value)}
          label="Posting Type"
        >
          <MenuItem value="post">Regular Post</MenuItem>
          <MenuItem value="event">Event</MenuItem>
          <MenuItem value="photo">Photo Post</MenuItem>
          <MenuItem value="video">Video Post</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Options */}
      <Typography variant="subtitle2" gutterBottom>
        Options
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={schedulePost}
              onChange={(e) => setSchedulePost(e.target.checked)}
              size="small"
            />
          }
          label="Post planen (nicht sofort)"
        />
      </Box>

      {/* Privacy Settings */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Privacy</InputLabel>
        <Select
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value)}
          label="Privacy"
          size="small"
        >
          <MenuItem value="public">Öffentlich</MenuItem>
          <MenuItem value="friends">Freunde</MenuItem>
          <MenuItem value="only_me">Nur ich</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Warnings */}
      <Alert severity="warning" size="small" sx={{ mb: 1 }}>
        Facebook API ist eingeschränkt. Playwright wird für zuverlässiges Posting verwendet.
      </Alert>

      {postingType === 'event' && (
        <Alert severity="info" size="small">
          Event-Posting erfordert zusätzliche Berechtigungen.
        </Alert>
      )}
    </Paper>
  )
}

export default FacebookPanel
