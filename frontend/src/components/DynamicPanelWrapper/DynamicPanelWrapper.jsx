import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material'
import { DynamicPanel } from '../registry/ComponentRegistry'
import useStore from '../../store'

function DynamicPanelWrapper({ platform }) {
  const [uiConfig, setUiConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { platformSettings, setPlatformSettings } = useStore()

  // Load UI configuration from backend
  useEffect(() => {
    const loadUIConfig = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:4000/api/platforms/${platform}`)
        if (!response.ok) {
          throw new Error(`Failed to load UI config: ${response.status}`)
        }
        const data = await response.json()
        setUiConfig(data.platform.uiConfig)
        setError(null)
      } catch (err) {
        console.error(`Failed to load UI config for ${platform}:`, err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (platform) {
      loadUIConfig()
    }
  }, [platform])

  // Handle setting changes
  const handleSettingChange = (sectionId, sectionData) => {
    setPlatformSettings(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [sectionId]: sectionData
      }
    }))
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Loading {platform} configuration...</Typography>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load {platform} configuration: {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Using fallback configuration...
        </Typography>
      </Paper>
    )
  }

  if (!uiConfig?.panel) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="warning">
          No panel configuration available for {platform}
        </Alert>
      </Paper>
    )
  }

  const currentValues = platformSettings[platform] || {}

  return (
    <DynamicPanel
      config={uiConfig.panel}
      values={currentValues}
      onChange={handleSettingChange}
    />
  )
}

export default DynamicPanelWrapper
