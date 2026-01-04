import React from 'react'
import {
  Paper,
  Box,
  Typography,
  Avatar,
  Chip
} from '@mui/material'

function TwitterPreview({ content, platformSettings }) {
  const text = content?.text || ''
  const hashtags = content?.hashtags || []
  const postingMode = content?.postingMode || 'single'
  const includeThread = content?.includeThread || false

  // Simulate Twitter-like formatting
  const formatTweet = (tweetText) => {
    return tweetText
      .replace(/#(\w+)/g, '<span style="color: #1DA1F2">#$1</span>')
      .replace(/@(\w+)/g, '<span style="color: #1DA1F2">@$1</span>')
  }

  return (
    <Paper
      sx={{
        p: 2,
        maxWidth: 500,
        border: '1px solid #e1e8ed',
        borderRadius: 3,
        backgroundColor: '#fff'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
        <Avatar
          sx={{ width: 40, height: 40, mr: 1 }}
          src="/api/placeholder/40/40"
        >
          U
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            @youraccount
          </Typography>
        </Box>
      </Box>

      {/* Tweet Content */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{ __html: formatTweet(text) }}
          sx={{ lineHeight: 1.4 }}
        />
        {hashtags.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {hashtags.map((hashtag) => (
              <Typography
                key={hashtag}
                variant="body2"
                sx={{ color: '#1DA1F2', fontWeight: 'bold' }}
              >
                {hashtag}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      {/* Thread indicator */}
      {postingMode === 'thread' && (
        <Box sx={{ mb: 1 }}>
          <Chip
            label="Thread"
            size="small"
            sx={{
              backgroundColor: '#1DA1F2',
              color: 'white',
              fontSize: '0.7rem'
            }}
          />
        </Box>
      )}

      {/* Footer */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pt: 1,
        borderTop: '1px solid #e1e8ed'
      }}>
        <Typography variant="caption" color="text.secondary">
          {new Date().toLocaleTimeString()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            💬 0
          </Typography>
          <Typography variant="caption" color="text.secondary">
            🔄 0
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ❤️ 0
          </Typography>
        </Box>
      </Box>

      {includeThread && (
        <Box sx={{ mt: 1, p: 1, backgroundColor: '#f7f9fa', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            ↳ This tweet is part of a thread
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

export default TwitterPreview
