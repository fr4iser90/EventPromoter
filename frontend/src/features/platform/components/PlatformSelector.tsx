import { useState, useEffect } from 'react'
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
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import ErrorIcon from '@mui/icons-material/Error'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'

import useStore from '../../../store'
import SettingsModal from './SettingsModal'
import config from '../../../config'
import { getApiUrl } from '../../../shared/utils/api'

import type {
  PlatformItem,
  PlatformMetadata,
  PlatformStatus,
  SettingsDialogState
} from '../types'

/**
 * Generic Icon Component
 * Handles icon rendering from backend metadata (icon string) or uses default
 */
function PlatformIcon({ icon, color, size = 24 }: { icon?: string; color?: string; size?: number }) {
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

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message
  return fallback
}

function PlatformSelector({ disabled = false }: { disabled?: boolean }) {
  const { t } = useTranslation()
  const {
    selectedPlatforms, 
    setSelectedPlatforms, 
    globalPublishingMode, 
    platformOverrides, 
    setPlatformOverride 
  } = useStore() as {
    selectedPlatforms: string[]
    setSelectedPlatforms: (platforms: string[]) => void
    globalPublishingMode: string
    platformOverrides: Record<string, string>
    setPlatformOverride: (platformId: string, route: string) => void
  }
  const [settingsDialog, setSettingsDialog] = useState<SettingsDialogState>({ open: false, platform: null })
  const [platforms, setPlatforms] = useState<PlatformItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [platformModes, setPlatformModes] = useState<Record<string, string[]>>({}) // Store available modes per platform

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
        const enhancedPlatforms = (data.platforms as PlatformItem[]).map((platform) => ({
          ...platform,
          // Use metadata from backend, no fallbacks
          icon: platform.icon || platform.metadata?.icon,
          color: platform.color || platform.metadata?.color || '#666',
          name: platform.name || platform.metadata?.displayName || platform.displayName || platform.id
        }))

        setPlatforms(enhancedPlatforms)
        
        // Load available modes for each platform
        const modesMap: Record<string, string[]> = {}
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
      } catch (err: unknown) {
        console.error('Failed to load platforms:', err)
        setError(getErrorMessage(err, 'Failed to load platforms'))
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

  const handlePlatformToggle = (platformId: string) => {
    const newSelection = safeSelectedPlatforms.includes(platformId)
      ? safeSelectedPlatforms.filter(id => id !== platformId)
      : [...safeSelectedPlatforms, platformId]
    setSelectedPlatforms(newSelection)
  }

  const handleSettingsOpen = (platform: PlatformItem) => {
    setSettingsDialog({ open: true, platform })
  }

  const handleSettingsClose = () => {
    setSettingsDialog({ open: false, platform: null })
  }

  const handleSettingsSave = (platformId: string, settings: Record<string, unknown>) => {
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
                                  disabled={false}
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

                    {/* Publishing mode status badges */}
                    <Box sx={{ mt: 1, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(() => {
                        const modes = platformModes[platform.id] || platform.availableModes || []
                        const modeStatuses = platform.publishingModeStatus || {}
                        
                        // Determine which route is active by "CUSTOM" logic (Default fallback)
                        const getBestDefaultRoute = () => {
                          const priority = ['api', 'n8n', 'playwright']
                          return priority.find(p => {
                            const status = modeStatuses[p]?.status || 'not-implemented'
                            return modes.includes(p) && status !== 'broken'
                          }) || modes[0]
                        }
                        const bestDefaultRoute = getBestDefaultRoute()
                        
                        const getModeConfig = (modeKey: string) => {
                          const statusInfo = modeStatuses[modeKey]
                          const status = statusInfo?.status || 'not-implemented'
                          const message = statusInfo?.message || ''
                          const isAvailable = modes.includes(modeKey)
                          
                          // 1. Global Mode Context
                          const isCustomMode = globalPublishingMode === 'custom'
                          const isForcedMode = ['n8n', 'api', 'playwright'].includes(globalPublishingMode)
                          const isForcedToThis = globalPublishingMode === modeKey
                          
                          // 2. Decision Layer
                          const isManualOverride = isCustomMode && platformOverrides[platform.id] === modeKey
                          const isDefaultChoice = isCustomMode && !platformOverrides[platform.id] && bestDefaultRoute === modeKey
                          
                          // 3. Activity Layer
                          const isActive = isManualOverride || isDefaultChoice || (isForcedMode && isForcedToThis)
                          
                          const configs: Record<string, { color: 'success' | 'warning' | 'default' | 'error'; icon?: JSX.Element }> = {
                            'working': { color: 'success', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
                            'partial': { color: 'warning', icon: <WarningIcon sx={{ fontSize: 14 }} /> },
                            'not-tested': { color: 'default', icon: <HelpOutlineIcon sx={{ fontSize: 14 }} /> },
                            'not-implemented': { color: 'default', icon: undefined },
                            'broken': { color: 'error', icon: <ErrorIcon sx={{ fontSize: 14 }} /> }
                          }
                          
                          const baseConfig = configs[status]
                          
                          return {
                            ...baseConfig,
                            isAvailable,
                            label: modeKey.toUpperCase(),
                            tooltip: `${modeKey.toUpperCase()}: ${message || status}${isDefaultChoice ? ' (Active via CUSTOM Default)' : ''}${isManualOverride ? ' (Manual Override)' : ''}${isForcedMode && !isForcedToThis ? ' (Disabled by Global Force)' : ''}`,
                            isActive,
                            isManualOverride,
                            isLocked: isForcedMode && !isForcedToThis,
                            status
                          }
                        }
                        
                        return ['n8n', 'api', 'playwright'].map((modeKey) => {
                          const config = getModeConfig(modeKey)
                          // Trust the metadata status: if it's not broken or not-implemented, it's selectable
                          const isSelectable = config.status !== 'broken' && config.status !== 'not-implemented'
                          const isCustomMode = globalPublishingMode === 'custom'

                          return (
                            <Tooltip key={modeKey} title={config.tooltip} arrow>
                              <Chip
                                size="small"
                                label={config.label}
                                color={config.color}
                                variant="outlined"
                                icon={config.isManualOverride ? <PersonIcon sx={{ fontSize: 14 }} /> : (config.isActive && !config.isLocked ? <AutoAwesomeIcon sx={{ fontSize: 14 }} /> : (config.isLocked ? <LockIcon sx={{ fontSize: 12 }} /> : config.icon))}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (isCustomMode && isSelectable) {
                                    setPlatformOverride(platform.id, modeKey)
                                  }
                                }}
                                sx={{ 
                                  fontSize: '0.65rem',
                                  height: '20px',
                                  cursor: (isCustomMode && isSelectable) ? 'pointer' : 'default',
                                  opacity: config.isActive ? 1 : (config.isLocked ? 0.3 : 0.4),
                                  border: config.isActive ? `2px solid` : '1px solid',
                                  borderColor: config.isActive ? 'inherit' : 'divider',
                                  transition: 'all 0.2s ease',
                                  bgcolor: 'transparent',
                                  '&:hover': {
                                    opacity: (isCustomMode && isSelectable) ? 1 : 0.4,
                                    bgcolor: (isCustomMode && isSelectable) ? 'action.hover' : 'transparent'
                                  }
                                }}
                              />
                            </Tooltip>
                          )
                        })
                      })()}
                    </Box>

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
