import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  TextField,
  Typography,
  Alert
} from '@mui/material'
import TemplateSelector from '../TemplateEditor/TemplateSelector'
import HashtagSelector from '../HashtagSelector/HashtagSelector'

function LinkedInEditor({ content, onChange }) {
  const { t } = useTranslation()
  const textLength = (content?.text || '').length
  const maxLength = 3000

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ color: '#0A66C2', fontWeight: 'bold' }}>
        💼 {t('platforms.linkedin.title')}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TemplateSelector
          platform="linkedin"
          onSelectTemplate={(template, filledContent) => {
            onChange({ ...content, text: filledContent })
          }}
          currentContent={content?.text || ''}
        />
      </Box>

      <TextField
        fullWidth
        multiline
        rows={6}
        label={t('platforms.linkedin.contentLabel')}
        value={content?.text || ''}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder={t('platforms.linkedin.placeholder')}
        inputProps={{ maxLength }}
        helperText={`${textLength}/${maxLength} ${t('common.characters')}`}
        error={textLength > maxLength}
      />

      <HashtagSelector
        value={content?.hashtags || []}
        onChange={(hashtags) => onChange({ ...content, hashtags })}
        maxHashtags={5}
      />

      <Alert severity="info">
        <strong>{t('platforms.linkedin.bestPractices.title')}</strong><br />
        {t('platforms.linkedin.bestPractices.points', { returnObjects: true }).map((point, index) => (
          <React.Fragment key={index}>
            • {point}<br />
          </React.Fragment>
        ))}
      </Alert>

      <Typography variant="body2" color="text.secondary">
        {t('platforms.linkedin.footer')}
      </Typography>
    </Box>
  )
}

export default LinkedInEditor
