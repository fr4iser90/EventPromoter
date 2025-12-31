import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

function PlatformEditor({ platform, content, onChange, onCopy, isActive, onSelect }) {
  const [availableRecipients, setAvailableRecipients] = useState([])

  // Load platform-specific settings from backend
  useEffect(() => {
    const loadPlatformSettings = async () => {
      try {
        if (platform === 'email') {
          // Load email recipients
          const response = await fetch('http://localhost:4000/api/config/emails')
          const config = await response.json()
          setAvailableRecipients(config.recipients || [])
        } else if (platform === 'reddit') {
          // Load available subreddits
          const response = await fetch('http://localhost:4000/api/config/reddit')
          const config = await response.json()
          setAvailableRecipients(config.availableSubreddits || []) 
        } else if (platform === 'twitter') {
          // Load available Twitter accounts (TODO: add to twitter.json)
          setAvailableRecipients([]) // Placeholder - needs config
        } else if (platform === 'facebook') {
          // Load available Facebook pages (TODO: add to facebook.json)
          setAvailableRecipients([]) // Placeholder - needs config
        } else if (platform === 'linkedin') {
          // Load available LinkedIn accounts (TODO: add to linkedin.json)
          setAvailableRecipients([]) // Placeholder - needs config
        } else if (platform === 'instagram') {
          // Load available Instagram accounts (TODO: add to instagram.json)
          setAvailableRecipients([]) // Placeholder - needs config
        }
      } catch (error) {
        console.error(`Failed to load ${platform} settings:`, error)
        setAvailableRecipients([])
      }
    }

    loadPlatformSettings()
  }, [platform])
  const getPlatformConfig = (platform) => {
    const configs = {
      twitter: { icon: '🐦', color: '#1DA1F2', name: 'Twitter', limit: 280 },
      instagram: { icon: '📸', color: '#E4405F', name: 'Instagram', limit: 2200 },
      facebook: { icon: '👥', color: '#1877F2', name: 'Facebook', limit: 63206 },
      linkedin: { icon: '💼', color: '#0A66C2', name: 'LinkedIn', limit: 3000 },
      email: { icon: '📧', color: '#EA4335', name: 'Email', limit: null }
    }
    return configs[platform] || { icon: '📝', color: '#666', name: platform, limit: null }
  }

  const config = getPlatformConfig(platform)
  const textLength = content.text?.length || content.caption?.length || 0
  const isValid = config.limit ? textLength <= config.limit : textLength > 0

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        border: `2px solid ${isActive ? config.color : '#e0e0e0'}`,
        cursor: 'pointer'
      }}
      onClick={onSelect}
    >
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: config.color }}>
        {config.icon} {config.name} Editor
      </Typography>

      {platform === 'twitter' && (
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Tweet Text"
          value={content.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          helperText={`Tweet text for Twitter`}
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {platform === 'instagram' && (
        <TextField
          fullWidth
          multiline
          rows={6}
          label="Instagram Caption"
          value={content.caption || ''}
          onChange={(e) => onChange('caption', e.target.value)}
          helperText="Caption for Instagram post"
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {platform === 'facebook' && (
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Facebook Post"
          value={content.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          helperText="Post text for Facebook"
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {platform === 'linkedin' && (
        <TextField
          fullWidth
          multiline
          rows={6}
          label="LinkedIn Post"
          value={content.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          helperText="Professional post content for LinkedIn"
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {platform === 'reddit' && (
        <>
          <TextField
            fullWidth
            label="Reddit Title"
            value={content.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            helperText="Post title for Reddit"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reddit Body"
            value={content.body || ''}
            onChange={(e) => onChange('body', e.target.value)}
            helperText="Post body content for Reddit"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Select Subreddit</InputLabel>
            <Select
              value={content.subreddit || ''}
              onChange={(e) => onChange('subreddit', e.target.value)}
              label="Select Subreddit"
            >
              {availableRecipients.map((subreddit) => (
                <MenuItem key={subreddit} value={subreddit}>
                  r/{subreddit}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      {platform === 'email' && (
        <>
          {/* Email Recipients Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              📧 Email Recipients
            </Typography>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Select Recipients</InputLabel>
              <Select
                multiple
                value={Array.isArray(content.recipients) ? content.recipients : []}
                onChange={(e) => {
                  const selectedValues = e.target.value
                  console.log('Email recipients changed:', selectedValues);
                  onChange('recipients', Array.isArray(selectedValues) ? selectedValues : [selectedValues]);
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(Array.isArray(selected) ? selected : []).map((email) => (
                      <Chip key={email} label={email} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableRecipients.map((email) => (
                  <MenuItem key={email} value={email}>
                    {email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            label="Email Subject"
            value={content.subject || ''}
            onChange={(e) => onChange('subject', e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Email HTML Content"
            value={content.html || ''}
            onChange={(e) => onChange('html', e.target.value)}
            helperText="HTML content for email"
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {config.limit && (
          <Typography variant="body2" color={textLength > config.limit ? "error" : "text.secondary"}>
            Characters: {textLength}/{config.limit}
          </Typography>
        )}
        <Chip
          size="small"
          color={isValid ? "success" : "warning"}
          label={isValid ? "Ready" : "Draft"}
        />
      </Box>
    </Paper>
  )
}

export default PlatformEditor
