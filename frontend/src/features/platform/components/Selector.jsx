import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Tooltip
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import useStore from '../../../store'
import SettingsModal from './SettingsModal'
import config from '../../../config'
import { getApiUrl } from '../../../shared/utils/api'

/**
 * Generic Icon Component
 * Handles icon rendering from backend metadata (icon string) or uses default
 */
function PlatformIcon({ icon, color, size = 24 }) {
  // If icon is a string, we could map it to Material-UI icons
  // For now, use a generic icon component
  // In production, you might want to create an icon registry
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color || '#666',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: size * 0.6,
        fontWeight: 'bold'
      }}
    >
      {icon ? String(icon).charAt(0).toUpperCase() : '?'}
    </Box>
  )
}

function PlatformSelector({ disabled = false }) {
  const { t } = useTranslation()
  const { selectedPlatforms, setSelectedPlatforms } = useStore()
  const [settingsDialog, setSettingsDialog] = useState({ open: false, platform: null })
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [platformModes, setPlatformModes] = useState({}) // Store available modes per platform

  // Load platforms dynamically from backend - NO FALLBACKS
  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(getApiUrl('platforms'))
        if (!response.ok) {
          throw new Error(`Failed to load platforms: ${response.status}`)
        }
        const data = await response.json()

        if (!data.success || !data.platforms) {
          throw new Error('Invalid platform data received')
        }

        // Use data directly from backend - no hardcoded enhancements
        const enhancedPlatforms = data.platforms.map(platform => ({
          ...platform,
          // Use metadata from backend, no fallbacks
          icon: platform.icon || platform.metadata?.icon,
          color: platform.color || platform.metadata?.color || '#666',
          name: platform.name || platform.metadata?.displayName || platform.displayName || platform.id
        }))

        setPlatforms(enhancedPlatforms)
        
        // Load available modes for each platform
        const modesMap = {}
        for (const platform of enhancedPlatforms) {
          try {
            const modesResponse = await fetch(getApiUrl(`platforms/${platform.id}/available-modes`))
            if (modesResponse.ok) {
              const modesData = await modesResponse.json()
              if (modesData.success) {
                modesMap[platform.id] = modesData.availableModes || []
              }
            }
          } catch (err) {
            console.warn(`Failed to load modes for ${platform.id}:`, err)
            modesMap[platform.id] = []
          }
        }
        setPlatformModes(modesMap)
        setError(null)
      } catch (err) {
        console.error('Failed to load platforms:', err)
        setError(err.message)
        // NO FALLBACK - show error instead
        setPlatforms([])
      } finally {
        setLoading(false)
      }
    }

    loadPlatforms()
  }, [])

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

  const handleSettingsSave = (platformId, settings) => {
    // Settings are saved via SchemaSettingsPanel
    console.log('Settings saved for platform:', platformId, settings)
  }

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Loading platforms...</Typography>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load platforms from server: {error}
          <br />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please ensure the backend server is running and accessible.
          </Typography>
        </Alert>
      </Paper>
    )
  }

  if (platforms.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          No platforms available. Please check backend configuration.
        </Alert>
      </Paper>
    )
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          🌐 {t('platform.selection')}
        </Typography>

        <Grid container spacing={2}>
          {platforms.map((platform) => {
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
                            disabled={disabled}
                            sx={{
                              color: platform.color,
                              '&.Mui-checked': {
                                color: platform.color,
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PlatformIcon icon={platform.icon} color={platform.color} size={24} />
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
                        {t('platform.settings')}
                      </Button>
                    </Box>

                    {platform.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {platform.description}
                      </Typography>
                    )}

                    {/* Debugging badges for available publishing modes */}
                    {process.env.NODE_ENV === 'development' && (
                      <Box sx={{ mt: 1, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(() => {
                          const modes = platformModes[platform.id] || platform.availableModes || []
                          const modeStatus = {
                            n8n: { label: 'n8n', color: modes.includes('n8n') ? 'success' : 'default', 
                                   tooltip: platform.id === 'email' ? 'Working, but needs CID image improvements' : 'Available' },
                            api: { label: 'API', color: modes.includes('api') ? 'success' : 'default', 
                                   tooltip: 'Available' },
                            playwright: { label: 'Playwright', color: modes.includes('playwright') ? 'warning' : 'default',
                                         tooltip: platform.id === 'email' ? 'Not yet implemented/tested' : modes.includes('playwright') ? 'Available' : 'Not available' }
                          }
                          
                          return Object.entries(modeStatus).map(([key, status]) => {
                            const isAvailable = modes.includes(key)
                            return (
                              <Tooltip key={key} title={status.tooltip} arrow>
                                <Chip
                                  size="small"
                                  label={status.label}
                                  color={isAvailable ? status.color : 'default'}
                                  icon={isAvailable ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : undefined}
                                  sx={{ 
                                    fontSize: '0.65rem',
                                    height: '20px',
                                    opacity: isAvailable ? 1 : 0.5
                                  }}
                                />
                              </Tooltip>
                            )
                          })
                        })()}
                      </Box>
                    )}

                    {isSelected && (
                      <Typography variant="caption" color="text.secondary">
                        {t('platform.enabled')}
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
                const platform = platforms.find(p => p.id === platformId)
                return (
                  <Typography key={platformId} variant="body2" sx={{ color: platform?.color || '#666' }}>
                    {platform?.name || platformId}
                  </Typography>
                )
              })}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Settings Dialog - Uses SchemaSettingsPanel (completely generic) */}
      {settingsDialog.platform && (
        <SettingsModal
          platformId={settingsDialog.platform.id}
          open={settingsDialog.open}
          onClose={handleSettingsClose}
          onSave={handleSettingsSave}
        />
      )}
    </>
  )
}

export default PlatformSelector
