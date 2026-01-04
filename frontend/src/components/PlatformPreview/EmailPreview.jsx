import React from 'react'
import {
  Paper,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material'

function EmailPreview({ content }) {
  const subject = content?.subject || ''
  const html = content?.html || ''
  const recipients = content?.recipients || []
  const hashtags = content?.hashtags || []

  return (
    <Paper
      sx={{
        p: 2,
        maxWidth: 600,
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        backgroundColor: '#fff'
      }}
    >
      {/* Email Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          📧 Email Preview
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Subject:
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            {subject || '(No subject)'}
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            To:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {recipients.length > 0 ? (
              recipients.map((email) => (
                <Chip
                  key={email}
                  label={email}
                  size="small"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                (No recipients selected)
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />
      </Box>

      {/* Email Content */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Content:
        </Typography>

        {html ? (
          <Box
            sx={{
              p: 2,
              border: '1px solid #f0f0f0',
              borderRadius: 1,
              backgroundColor: '#fafafa',
              maxHeight: 300,
              overflow: 'auto'
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <Box
            sx={{
              p: 2,
              border: '1px solid #f0f0f0',
              borderRadius: 1,
              backgroundColor: '#fafafa',
              color: 'text.secondary',
              fontStyle: 'italic'
            }}
          >
            (No content)
          </Box>
        )}

        {hashtags.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Hashtags:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {hashtags.map((hashtag) => (
                <Typography
                  key={hashtag}
                  variant="body2"
                  sx={{ color: '#EA4335', fontWeight: 'bold' }}
                >
                  {hashtag}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ pt: 1, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="caption" color="text.secondary">
          This email will be sent through your configured SMTP server.
        </Typography>
      </Box>
    </Paper>
  )
}

export default EmailPreview
