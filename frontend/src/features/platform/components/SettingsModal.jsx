/**
 * Platform Settings Modal Component
 * 
 * Generic settings modal that renders platform settings and credentials based on schema.
 * Contains two tabs: "Settings" (formerly Panel) and "Credentials".
 * 
 * @module features/platform/components/SettingsModal
 */

import React, { useState, useEffect } from 'react'
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import KeyIcon from '@mui/icons-material/VpnKey'
import SchemaRenderer from '../../schema/components/Renderer'
import { getApiUrl } from '../../../shared/utils/api'

function SettingsModal({ platformId, open, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState(0)
  const [schema, setSchema] = useState(null)
  const [credentialsValues, setCredentialsValues] = useState({})
  const [settingsValues, setSettingsValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})

  // Load schema and data when platform changes or modal opens
  useEffect(() => {
    if (!platformId || !open) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load schema
        const schemaResponse = await fetch(getApiUrl(`platforms/${platformId}/schema`))
        if (!schemaResponse.ok) throw new Error('Failed to load schema')
        const schemaData = await schemaResponse.json()
        
        // Load enriched settings schema if available
        let enrichedSettings = schemaData.schema.settings
        if (enrichedSettings) {
          const settingsResponse = await fetch(getApiUrl(`platforms/${platformId}/schemas/settings`))
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json()
            if (settingsData.success) {
              enrichedSettings = settingsData.schema
            }
          }
        }

        // Load enriched credentials schema if available
        let enrichedCredentials = schemaData.schema.credentials
        if (enrichedCredentials) {
          const credsSchemaResponse = await fetch(getApiUrl(`platforms/${platformId}/schemas/credentials`))
          if (credsSchemaResponse.ok) {
            const credsSchemaData = await credsSchemaResponse.json()
            if (credsSchemaData.success) {
              enrichedCredentials = credsSchemaData.schema
            }
          }
        }

        setSchema({
          ...schemaData.schema,
          settings: enrichedSettings,
          credentials: enrichedCredentials
        })

        // Load credentials values
        const credsResponse = await fetch(getApiUrl(`platforms/${platformId}/settings`))
        if (credsResponse.ok) {
          const credsData = await credsResponse.json()
          if (credsData.success && credsData.settings) {
            setCredentialsValues(credsData.settings.values || {})
          }
        }
      } catch (err) {
        console.error('Failed to load platform data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [platformId, open])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Save credentials (only tab 1 for now, as tab 0 targets are usually saved via individual actions)
      const response = await fetch(getApiUrl(`platforms/${platformId}/settings`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: credentialsValues })
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.errors) setErrors(data.errors)
        throw new Error(data.error || 'Failed to save credentials')
      }

      if (onSave) onSave(platformId, credentialsValues)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h6">
            {platformId?.charAt(0).toUpperCase() + platformId?.slice(1)} Configuration
          </Typography>
        </Box>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SettingsIcon />} label="Settings" iconPosition="start" />
          <Tab icon={<KeyIcon />} label="Credentials" iconPosition="start" />
        </Tabs>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box>
            {activeTab === 0 && (
              <Box>
                {schema?.settings ? (
                  schema.settings.sections.map(section => (
                    <Box key={section.id} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {section.title}
                      </Typography>
                      <SchemaRenderer
                        fields={section.fields}
                        values={settingsValues}
                        onChange={(f, v) => setSettingsValues(prev => ({ ...prev, [f]: v }))}
                        platformId={platformId}
                      />
                    </Box>
                  ))
                ) : (
                  <Alert severity="info">No settings available for this platform.</Alert>
                )}
              </Box>
            )}
            {activeTab === 1 && (
              <Box>
                {schema?.credentials ? (
                  <SchemaRenderer
                    fields={schema.credentials.fields}
                    values={credentialsValues}
                    onChange={(f, v) => setCredentialsValues(prev => ({ ...prev, [f]: v }))}
                    errors={errors}
                    groups={schema.credentials.groups}
                  />
                ) : (
                  <Alert severity="info">No credentials available for this platform.</Alert>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading || saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsModal
