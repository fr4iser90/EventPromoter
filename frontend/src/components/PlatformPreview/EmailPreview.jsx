import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material'

function EmailPreview({ content }) {
  const { t } = useTranslation()
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
          📧 {t('preview.email')} {t('preview.preview')}
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {t('preview.subject')}:
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            {subject || `(${t('preview.noSubject')})`}
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {t('email.to')}:
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
                ({t('email.noRecipientsSelected')})
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />
      </Box>

      {/* Email Content */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {t('email.content')}:
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
            ({t('preview.noContent')})
          </Box>
        )}

        {hashtags.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {t('hashtags.title')}:
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
          {t('email.footer')}
        </Typography>
      </Box>
    </Paper>
  )
}

export default EmailPreview
