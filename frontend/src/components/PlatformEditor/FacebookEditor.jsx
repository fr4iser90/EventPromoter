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

function FacebookEditor({ content, onChange }) {
  const { t } = useTranslation()
  const textLength = (content?.text || '').length
  const maxLength = 63206

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ color: '#1877F2', fontWeight: 'bold' }}>
        👥 {t('platforms.facebook.title')}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TemplateSelector
          platform="facebook"
          onSelectTemplate={(template, filledContent) => {
            onChange({ ...content, text: filledContent })
          }}
          currentContent={content?.text || ''}
        />
      </Box>

      <TextField
        fullWidth
        multiline
        rows={4}
        label={t('platforms.facebook.contentLabel')}
        value={content?.text || ''}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder={t('platforms.facebook.placeholder')}
        inputProps={{ maxLength }}
        helperText={`${textLength}/${maxLength} ${t('common.characters')}`}
        error={textLength > maxLength}
      />

      <HashtagSelector
        value={content?.hashtags || []}
        onChange={(hashtags) => onChange({ ...content, hashtags })}
        maxHashtags={10}
      />

      <Alert severity="info">
        <strong>{t('platforms.facebook.bestPractices.title')}</strong><br />
        {t('platforms.facebook.bestPractices.points', { returnObjects: true }).map((point, index) => (
          <React.Fragment key={index}>
            • {point}<br />
          </React.Fragment>
        ))}
      </Alert>

      <Typography variant="body2" color="text.secondary">
        {t('platforms.facebook.footer')}
      </Typography>
    </Box>
  )
}

export default FacebookEditor
