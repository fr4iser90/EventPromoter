/**
 * DynamicPanelWrapper - Generic wrapper for platform feature panels
 * 
 * Panels display platform-specific features/options (NOT settings/credentials).
 * Settings/credentials are handled in Modals (SchemaSettingsPanel).
 * 
 * Panels show platform-specific features and settings.
 * Each platform defines its own panel structure via schema.panel.
 * 
 * @module components/Panels/DynamicPanelWrapper
 */

import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import SchemaRenderer from '../SchemaRenderer/SchemaRenderer'
import SchemaSettingsPanel from '../SchemaSettingsPanel/SchemaSettingsPanel'
import axios from 'axios'
import useStore from '../../store'
import config from '../../config'

function DynamicPanelWrapper({ platform }) {
  const { platformContent, setPlatformContent } = useStore()
  const [panelConfig, setPanelConfig] = useState(null)
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [fieldOptions, setFieldOptions] = useState({}) // Cache for dynamic field options

  // Load panel configuration when platform changes
  useEffect(() => {
    if (!platform) {
      setLoading(false)
      return
    }

    const loadPanelConfig = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to load platform with uiConfig.panel
        const platformResponse = await fetch(`${config.apiUrl || 'http://localhost:4000'}/api/platforms/${platform}`)
        if (platformResponse.ok) {
          const platformData = await platformResponse.json()
          if (platformData.success && platformData.platform) {
            // Check for uiConfig.panel (legacy) or schema.panel (new)
            const panel = platformData.platform.uiConfig?.panel || 
                        platformData.platform.schema?.panel ||
                        null
            
            if (panel) {
              setPanelConfig(panel)
              // loadExistingValues wird durch useEffect ausgelöst
              return
            }
          }
        }

        // If no panel config available, that's okay - panel just won't show much
        // Only log in development mode to reduce console noise
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DynamicPanelWrapper] No panel config found for ${platform}`)
        }
        setPanelConfig(null)
      } catch (err) {
        console.error('Failed to load panel config:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPanelConfig()
  }, [platform])

  // Load existing panel values and dynamic field options when panelConfig changes
  useEffect(() => {
    if (panelConfig && platform) {
      loadExistingValues(platform)
    }
  }, [panelConfig, platform])

  // Load existing panel values and dynamic field options (GENERIC - no hardcoded logic)
  const loadExistingValues = async (platformId) => {
    if (!panelConfig) return

    // Load values from store
    const storedValues = platformContent[platformId] || {}
    setValues(storedValues)

    // ✅ GENERIC: Load dynamic field options from API based on schema.optionsSource
    const optionsMap = {}
    for (const section of panelConfig.sections || []) {
      for (const field of section.fields || []) {
        // If field has optionsSource, load options dynamically
        if (field.optionsSource) {
          try {
            const endpoint = field.optionsSource.endpoint.replace(':platformId', platformId)
            const url = `${config.apiUrl || 'http://localhost:4000'}${endpoint}`
            
            const response = await axios({
              method: field.optionsSource.method || 'GET',
              url
            })

            // Extract data from response using responsePath
            let data = response.data
            if (field.optionsSource.responsePath) {
              const paths = field.optionsSource.responsePath.split('.')
              for (const path of paths) {
                data = data?.[path]
              }
            }

            // Transform data based on transform type
            let transformedOptions = []
            if (Array.isArray(data)) {
              if (typeof field.optionsSource.transform === 'function') {
                transformedOptions = data.map(field.optionsSource.transform)
              } else {
                // Default: assume array of {label, value} objects
                transformedOptions = data
              }
            }

            optionsMap[field.name] = transformedOptions
          } catch (err) {
            console.error(`Failed to load options for field ${field.name}:`, err)
          }
        }
      }
    }
    setFieldOptions(optionsMap)
  }

  // Handle field value change (GENERIC - no hardcoded logic)
  const handleFieldChange = async (sectionId, fieldName, value) => {
    // Find field definition to check for actions
    let fieldDef = null
    for (const section of panelConfig?.sections || []) {
      fieldDef = section.fields?.find(f => f.name === fieldName)
      if (fieldDef) break
    }

    // Update local state
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }))

    // Update store for platform content
    const current = platformContent[platform] || {}
    setPlatformContent(platform, {
      ...current,
      [fieldName]: value
    })

    // ✅ GENERIC: Execute field action if defined and trigger condition met
    if (fieldDef?.action && value) {
      // Only execute if trigger is 'change' (default) or not specified
      // 'submit' and 'blur' triggers are handled separately
      const trigger = fieldDef.action.trigger || 'change'
      if (trigger !== 'change') {
        // Store action for later execution (on submit/blur)
        return
      }
      try {
        const endpoint = fieldDef.action.endpoint.replace(':platformId', platform)
        const url = `${config.apiUrl || 'http://localhost:4000'}${endpoint}`
        
        // Build request body from bodyMapping
        let body = {}
        if (fieldDef.action.bodyMapping) {
          Object.entries(fieldDef.action.bodyMapping).forEach(([key, source]) => {
            if (source === 'value') {
              body[key] = value
            } else {
              body[key] = values[source] || value
            }
          })
        } else {
          // Default: send value as 'value'
          body = { value }
        }

        const response = await axios({
          method: fieldDef.action.method,
          url,
          data: body
        })

        if (response.data.success) {
          // Handle onSuccess actions
          if (fieldDef.action.onSuccess === 'clear') {
            setValues(prev => ({
              ...prev,
              [fieldName]: ''
            }))
          } else if (fieldDef.action.onSuccess === 'reload' || fieldDef.action.reloadOptions) {
            // Reload options for fields with optionsSource
            await loadExistingValues(platform)
          }
        }
      } catch (err) {
        console.error(`Failed to execute action for field ${fieldName}:`, err)
      }
    }
  }

  // Handle settings button click (opens modal)
  const handleOpenSettings = () => {
    setSettingsOpen(true)
  }

  if (!platform) {
    return null
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading {platform} panel...
        </Typography>
      </Paper>
    )
  }

  return (
    <>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {panelConfig?.title || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Options`}
          </Typography>
          <Button
            size="small"
            startIcon={<SettingsIcon />}
            onClick={handleOpenSettings}
            variant="outlined"
          >
            Settings
          </Button>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!panelConfig ? (
          <Alert severity="info">
            No panel configuration available for {platform}. Use the Settings button to configure credentials.
          </Alert>
        ) : (
          <Box>
            {panelConfig.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {panelConfig.description}
              </Typography>
            )}

            {/* Render panel sections if available - Schema-driven rendering */}
            {panelConfig.sections && panelConfig.sections.length > 0 ? (
              <Box>
                {panelConfig.sections.map((section) => {
                  // Merge dynamic options into fields
                  const fieldsWithOptions = (section.fields || []).map(field => {
                    if (fieldOptions[field.name]) {
                      return {
                        ...field,
                        options: fieldOptions[field.name]
                      }
                    }
                    return field
                  })

                  return (
                    <Box key={section.id} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {section.title}
                      </Typography>
                      {section.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {section.description}
                        </Typography>
                      )}
                      <SchemaRenderer
                        fields={fieldsWithOptions}
                        values={values}
                        onChange={(fieldName, value) => handleFieldChange(section.id, fieldName, value)}
                        errors={{}}
                      />
                    </Box>
                  )
                })}
              </Box>
            ) : (
              <Alert severity="info">
                Panel configuration available but no sections defined.
              </Alert>
            )}
          </Box>
        )}
      </Paper>

      {/* Settings Modal - for credentials/API keys */}
      <SchemaSettingsPanel
        platformId={platform}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={(platformId, values) => {
          console.log('Settings saved for', platformId, values)
          setSettingsOpen(false)
        }}
      />
    </>
  )
}

export default DynamicPanelWrapper
