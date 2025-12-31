import React from 'react'
import {
  Paper,
  Typography,
  Box
} from '@mui/material'

function PlatformPreview({ platform, content, isActive }) {
  const getPlatformConfig = (platform) => {
    const configs = {
      twitter: { icon: '🐦', color: '#1DA1F2', name: 'Twitter' },
      instagram: { icon: '📸', color: '#E4405F', name: 'Instagram' },
      facebook: { icon: '👥', color: '#1877F2', name: 'Facebook' },
      linkedin: { icon: '💼', color: '#0A66C2', name: 'LinkedIn' },
      email: { icon: '📧', color: '#EA4335', name: 'Email' }
    }
    return configs[platform] || { icon: '📝', color: '#666', name: platform }
  }

  const config = getPlatformConfig(platform)

  return (
    <Paper sx={{
      p: 2,
      mb: 2,
      bgcolor: '#f8f9fa',
      border: `2px solid ${isActive ? config.color : '#e0e0e0'}`
    }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: config.color }}>
        {config.icon} {config.name} Preview
      </Typography>

      <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        {platform === 'twitter' && (
          <Typography variant="body2">
            {content.text || 'No content yet...'}
          </Typography>
        )}

        {platform === 'instagram' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📸 Event Image
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {content.caption || 'No caption yet...'}
            </Typography>
          </>
        )}

        {platform === 'facebook' && (
          <Typography variant="body2">
            {content.text || 'No content yet...'}
          </Typography>
        )}

        {platform === 'linkedin' && (
          <Typography variant="body2">
            {content.text || 'No LinkedIn content yet...'}
          </Typography>
        )}

        {platform === 'reddit' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Title: {content.title || 'No title...'}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1 }}>
              {content.body || 'No body content...'}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              Subreddit: {content.subreddit || 'r/events'}
            </Typography>
          </>
        )}

        {platform === 'email' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Subject: {content.subject || 'No subject...'}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {content.html ? 'HTML Email Content...' : 'No content yet...'}
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  )
}

export default PlatformPreview
