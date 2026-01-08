import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  TextField,
  Typography,
  Alert
} from '@mui/material'
import HashtagSelector from '../HashtagSelector/HashtagSelector'
import TemplateSelector from '../TemplateEditor/TemplateSelector'

function InstagramEditor({ content, onChange }) {
  const { t } = useTranslation()
  const textLength = (content?.caption || '').length
  const maxLength = 2200

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ color: '#E4405F', fontWeight: 'bold' }}>
        📸 {t('platforms.instagram.title')}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TemplateSelector
          platform="instagram"
          onSelectTemplate={(template, filledContent) => {
            onChange({ ...content, caption: filledContent })
          }}
          currentContent={content?.caption || ''}
        />
      </Box>

      <TextField
        fullWidth
        multiline
        rows={6}
        label={t('platforms.instagram.contentLabel')}
        value={content?.caption || ''}
        onChange={(e) => onChange({ ...content, caption: e.target.value })}
        placeholder={t('platforms.instagram.placeholder')}
        inputProps={{ maxLength }}
        helperText={`${textLength}/${maxLength} ${t('common.characters')}`}
        error={textLength > maxLength}
      />

      <HashtagSelector
        value={content?.hashtags || []}
        onChange={(hashtags) => onChange({ ...content, hashtags })}
        maxHashtags={30}
      />

      <Alert severity="info">
        <strong>{t('platforms.instagram.bestPractices.title')}</strong><br />
        {t('platforms.instagram.bestPractices.points', { returnObjects: true }).map((point, index) => (
          <React.Fragment key={index}>
            • {point}<br />
          </React.Fragment>
        ))}
      </Alert>

      <Typography variant="body2" color="text.secondary">
        {t('platforms.instagram.footer')}
      </Typography>
    </Box>
  )
}

export default InstagramEditor
