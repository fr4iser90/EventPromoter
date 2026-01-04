import React, { useState, useEffect } from 'react'
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
  const { platformSettings, setPlatformSettings } = useStore()
  const [postType, setPostType] = useState('text')
  const [targetAudience, setTargetAudience] = useState('connections')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [includeArticle, setIncludeArticle] = useState(false)
  const [professionalTone, setProfessionalTone] = useState(true)

  // Mock company pages - in real app this would come from API
  const availableCompanies = [
    { id: 'company1', name: 'My Company GmbH', followers: 2500 },
    { id: 'company2', name: 'Tech Startup AG', followers: 1200 },
    { id: 'personal', name: 'Persönliches Profil', followers: null }
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
          LinkedIn Settings
        </Typography>
      </Box>

      {/* Post Type */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Post Type</InputLabel>
        <Select
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          label="Post Type"
        >
          <MenuItem value="text">Text Post</MenuItem>
          <MenuItem value="article">Artikel</MenuItem>
          <MenuItem value="poll">Umfrage</MenuItem>
          <MenuItem value="document">Dokument</MenuItem>
        </Select>
      </FormControl>

      {/* Company/Page Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Post als</InputLabel>
        <Select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          label="Post als"
        >
          {availableCompanies.map(company => (
            <MenuItem key={company.id} value={company.id}>
              {company.name} {company.followers && `(${company.followers} followers)`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Target Audience */}
      <Typography variant="subtitle2" gutterBottom>
        Zielgruppe
      </Typography>
      <RadioGroup
        value={targetAudience}
        onChange={(e) => setTargetAudience(e.target.value)}
        sx={{ mb: 2 }}
      >
        <RadioLabel value="connections" control={<Radio size="small" />} label="Nur Connections" />
        <RadioLabel value="anyone" control={<Radio size="small" />} label="Jeder (Anyone)" />
        <RadioLabel value="custom" control={<Radio size="small" />} label="Benutzerdefinierte Zielgruppe" />
      </RadioGroup>

      <Divider sx={{ my: 2 }} />

      {/* Options */}
      <Typography variant="subtitle2" gutterBottom>
        Optionen
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
          label="Artikel-Link hinzufügen"
        />
        <FormControlLabel
          control={
            <Switch
              checked={professionalTone}
              onChange={(e) => setProfessionalTone(e.target.checked)}
              size="small"
            />
          }
          label="Professioneller Ton"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Info */}
      <Alert severity="info" size="small" sx={{ mb: 1 }}>
        LinkedIn API ist sehr zuverlässig für professionelle Inhalte.
      </Alert>

      {postType === 'article' && (
        <Alert severity="info" size="small">
          Artikel-Posts werden als LinkedIn-Artikel veröffentlicht.
        </Alert>
      )}

      {targetAudience === 'anyone' && (
        <Alert severity="warning" size="small">
          "Anyone" kann zu weniger Interaktion führen.
        </Alert>
      )}
    </Paper>
  )
}

export default LinkedInPanel
