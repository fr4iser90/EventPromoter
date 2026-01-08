import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  FormControlLabel as RadioLabel
} from '@mui/material'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import useStore from '../../store'

function LinkedInPanel() {
  const { t } = useTranslation()
  const { platformSettings, setPlatformSettings } = useStore()
  const [postType, setPostType] = useState('text')
  const [targetAudience, setTargetAudience] = useState('connections')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [includeArticle, setIncludeArticle] = useState(false)
  const [professionalTone, setProfessionalTone] = useState(true)

  // Mock company pages - in real app this would come from API
  const availableCompanies = [
    { id: 'company1', name: t('panels.linkedin.companies.company1'), followers: 2500 },
    { id: 'company2', name: t('panels.linkedin.companies.company2'), followers: 1200 },
    { id: 'personal', name: t('panels.linkedin.companies.personal'), followers: null }
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
        <LinkedInIcon sx={{ mr: 1, color: '#0A66C2' }} />
        <Typography variant="h6">
          {t('panels.linkedin.title')}
        </Typography>
      </Box>

      {/* Post Type */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t('panels.linkedin.postType.label')}</InputLabel>
        <Select
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          label={t('panels.linkedin.postType.label')}
        >
          <MenuItem value="text">{t('panels.linkedin.postType.text')}</MenuItem>
          <MenuItem value="article">{t('panels.linkedin.postType.article')}</MenuItem>
          <MenuItem value="poll">{t('panels.linkedin.postType.poll')}</MenuItem>
          <MenuItem value="document">{t('panels.linkedin.postType.document')}</MenuItem>
        </Select>
      </FormControl>

      {/* Company/Page Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t('panels.linkedin.postAs.label')}</InputLabel>
        <Select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          label={t('panels.linkedin.postAs.label')}
        >
          {availableCompanies.map(company => (
            <MenuItem key={company.id} value={company.id}>
              {company.name} {company.followers && `(${company.followers} ${t('panels.linkedin.followers')})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Target Audience */}
      <Typography variant="subtitle2" gutterBottom>
        {t('panels.linkedin.targetAudience.title')}
      </Typography>
      <RadioGroup
        value={targetAudience}
        onChange={(e) => setTargetAudience(e.target.value)}
        sx={{ mb: 2 }}
      >
        <RadioLabel value="connections" control={<Radio size="small" />} label={t('panels.linkedin.targetAudience.connections')} />
        <RadioLabel value="anyone" control={<Radio size="small" />} label={t('panels.linkedin.targetAudience.anyone')} />
        <RadioLabel value="custom" control={<Radio size="small" />} label={t('panels.linkedin.targetAudience.custom')} />
      </RadioGroup>

      <Divider sx={{ my: 2 }} />

      {/* Options */}
      <Typography variant="subtitle2" gutterBottom>
        {t('panels.linkedin.options.title')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={includeArticle}
              onChange={(e) => setIncludeArticle(e.target.checked)}
              size="small"
            />
          }
          label={t('panels.linkedin.options.includeArticle')}
        />
        <FormControlLabel
          control={
            <Switch
              checked={professionalTone}
              onChange={(e) => setProfessionalTone(e.target.checked)}
              size="small"
            />
          }
          label={t('panels.linkedin.options.professionalTone')}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Info */}
      <Alert severity="info" size="small" sx={{ mb: 1 }}>
        {t('panels.linkedin.info.api')}
      </Alert>

      {postType === 'article' && (
        <Alert severity="info" size="small">
          {t('panels.linkedin.warnings.article')}
        </Alert>
      )}

      {targetAudience === 'anyone' && (
        <Alert severity="warning" size="small">
          {t('panels.linkedin.warnings.anyone')}
        </Alert>
      )}
    </Paper>
  )
}

export default LinkedInPanel
