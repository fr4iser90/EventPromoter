import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import TwitterIcon from '@mui/icons-material/Twitter'
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import RedditIcon from '@mui/icons-material/Reddit'
import EmailIcon from '@mui/icons-material/Email'
import useStore from '../../store'

const PLATFORMS = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: TwitterIcon,
    color: '#1DA1F2',
    settings: ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: InstagramIcon,
    color: '#E4405F',
    settings: ['username', 'password', 'twoFactorEnabled']
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: FacebookIcon,
    color: '#1877F2',
    settings: ['pageId', 'pageName', 'accessToken']
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: LinkedInIcon,
    color: '#0A66C2',
    settings: ['profileId', 'companyId', 'accessToken']
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: RedditIcon,
    color: '#FF4500',
    settings: ['subreddit', 'username', 'password', 'flair']
  },
  {
    id: 'email',
    name: 'Email',
    icon: EmailIcon,
    color: '#EA4335',
    settings: ['recipients', 'subject', 'smtpServer']
  }
]

function PlatformSelector() {
  const { selectedPlatforms, setSelectedPlatforms, platformSettings, setPlatformSettings } = useStore()
  const [settingsDialog, setSettingsDialog] = useState({ open: false, platform: null })

  // Ensure selectedPlatforms is always an array
  const safeSelectedPlatforms = Array.isArray(selectedPlatforms) ? selectedPlatforms : []


  const handlePlatformToggle = (platformId) => {
    const newSelection = safeSelectedPlatforms.includes(platformId)
      ? safeSelectedPlatforms.filter(id => id !== platformId)
      : [...safeSelectedPlatforms, platformId]
    setSelectedPlatforms(newSelection)
  }

  const handleSettingsOpen = (platform) => {
    setSettingsDialog({ open: true, platform })
  }

  const handleSettingsClose = () => {
    setSettingsDialog({ open: false, platform: null })
  }

  const handleSettingChange = (platformId, settingKey, value) => {
    setPlatformSettings(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        [settingKey]: value
      }
    }))
  }

  const saveSettings = () => {
    // Here you would typically save to localStorage or send to backend
    console.log('Saving settings:', platformSettings)
    handleSettingsClose()
  }

  const getPlatformSettings = (platform) => {
    return platformSettings[platform.id] || {}
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🌐 Platform Selection
      </Typography>

      <Grid container spacing={2}>
        {PLATFORMS.map((platform) => {
          const IconComponent = platform.icon
          const isSelected = safeSelectedPlatforms.includes(platform.id)

          return (
            <Grid item xs={12} sm={6} md={4} key={platform.id}>
              <Card
                sx={{
                  border: isSelected ? `2px solid ${platform.color}` : '2px solid transparent',
                  transition: 'border-color 0.2s ease-in-out'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handlePlatformToggle(platform.id)}
                          sx={{
                            color: platform.color,
                            '&.Mui-checked': {
                              color: platform.color,
                            },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconComponent sx={{ mr: 1, color: platform.color }} />
                          <Typography variant="subtitle1">
                            {platform.name}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      size="small"
                      startIcon={<SettingsIcon />}
                      onClick={() => handleSettingsOpen(platform)}
                      variant="outlined"
                      sx={{ minWidth: 'auto' }}
                    >
                      Settings
                    </Button>
                  </Box>

                  {isSelected && (
                    <Typography variant="caption" color="text.secondary">
                      Platform enabled • {platform.settings.length} settings configured
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Selected Platforms: {safeSelectedPlatforms.length}
        </Typography>
        {safeSelectedPlatforms.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 2 }}>
            {safeSelectedPlatforms.map(platformId => {
              const platform = PLATFORMS.find(p => p.id === platformId)
              return (
                <Typography key={platformId} variant="body2" sx={{ color: platform.color }}>
                  {platform.name}
                </Typography>
              )
            })}
          </Box>
        )}
      </Box>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialog.open}
        onClose={handleSettingsClose}
        maxWidth="sm"
        fullWidth
      >
        {settingsDialog.platform && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <settingsDialog.platform.icon sx={{ mr: 1, color: settingsDialog.platform.color }} />
                {settingsDialog.platform.name} Settings
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 1 }}>
                {settingsDialog.platform.settings.map((setting) => (
                  <Box key={setting} sx={{ mb: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>{setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</InputLabel>
                      {setting === 'subreddit' ? (
                        <Select
                          value={getPlatformSettings(settingsDialog.platform)[setting] || ''}
                          onChange={(e) => handleSettingChange(settingsDialog.platform.id, setting, e.target.value)}
                          label={setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        >
                          <MenuItem value="r/djsets">r/djsets</MenuItem>
                          <MenuItem value="r/electronicmusic">r/electronicmusic</MenuItem>
                          <MenuItem value="r/techno">r/techno</MenuItem>
                          <MenuItem value="r/house">r/house</MenuItem>
                          <MenuItem value="custom">Custom...</MenuItem>
                        </Select>
                      ) : (
                        <TextField
                          fullWidth
                          type={setting.includes('password') || setting.includes('secret') || setting.includes('token') ? 'password' : 'text'}
                          value={getPlatformSettings(settingsDialog.platform)[setting] || ''}
                          onChange={(e) => handleSettingChange(settingsDialog.platform.id, setting, e.target.value)}
                          placeholder={`Enter ${setting}`}
                        />
                      )}
                    </FormControl>
                  </Box>
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleSettingsClose}>Cancel</Button>
              <Button onClick={saveSettings} variant="contained">
                Save Settings
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  )
}

export default PlatformSelector
