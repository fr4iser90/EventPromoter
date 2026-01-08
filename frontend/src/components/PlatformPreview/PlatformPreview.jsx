import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box
} from '@mui/material'

function PlatformPreview({ platform, content, isActive }) {
  const { t } = useTranslation()

  const getPlatformConfig = (platform) => {
    const configs = {
      twitter: { icon: '🐦', color: '#1DA1F2', name: t('platforms.twitter.title') },
      instagram: { icon: '📸', color: '#E4405F', name: t('platforms.instagram.title') },
      facebook: { icon: '👥', color: '#1877F2', name: t('platforms.facebook.title') },
      linkedin: { icon: '💼', color: '#0A66C2', name: t('platforms.linkedin.title') },
      email: { icon: '📧', color: '#EA4335', name: t('preview.email') }
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
        {config.icon} {config.name} {t('preview.preview')}
      </Typography>

      <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        {platform === 'twitter' && (
          <Typography variant="body2">
            {content.text || t('preview.noContent')}
          </Typography>
        )}

        {platform === 'instagram' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📸 {t('preview.eventImage')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {content.caption || t('preview.noCaption')}
            </Typography>
          </>
        )}

        {platform === 'facebook' && (
          <Typography variant="body2">
            {content.text || t('preview.noContent')}
          </Typography>
        )}

        {platform === 'linkedin' && (
          <Typography variant="body2">
            {content.text || t('preview.noLinkedInContent')}
          </Typography>
        )}

        {platform === 'reddit' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('preview.title')}: {content.title || t('preview.noTitle')}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1 }}>
              {content.body || t('preview.noBodyContent')}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {t('preview.subreddit')}: {content.subreddit || 'r/events'}
            </Typography>
          </>
        )}

        {platform === 'email' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('preview.subject')}: {content.subject || t('preview.noSubject')}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {content.html ? t('preview.htmlEmailContent') : t('preview.noContent')}
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  )
}

export default PlatformPreview
