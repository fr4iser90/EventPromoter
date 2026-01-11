/**
 * Schema Settings Panel Component
 * 
 * Generic settings panel that renders platform settings based on schema.
 * Loads settings schema from API and uses SchemaRenderer for form rendering.
 * 
 * @module components/SchemaSettingsPanel/SchemaSettingsPanel
 */

import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import SchemaRenderer, { validateSchema } from '../../schema/components/Renderer'
import config from '../../../config'

function SchemaSettingsPanel({ platformId, open, onClose, onSave }) {
  const [schema, setSchema] = useState(null)
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Load schema when platform changes
  useEffect(() => {
    if (!platformId || !open) return

    const loadSchema = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to load schema from new endpoint
        const schemaResponse = await fetch(`${config.apiUrl}/api/platforms/${platformId}/schema`)
        if (schemaResponse.ok) {
          const schemaData = await schemaResponse.json()
          if (schemaData.success && schemaData.schema?.settings) {
            setSchema(schemaData.schema.settings)
            // Load existing settings values
            await loadExistingSettings(platformId)
            return
          }
        }

        // Fallback: try to load from platform endpoint
        const platformResponse = await fetch(`${config.apiUrl}/api/platforms/${platformId}`)
        if (platformResponse.ok) {
          const platformData = await platformResponse.json()
          if (platformData.success && platformData.platform?.schema?.settings) {
            setSchema(platformData.platform.schema.settings)
            await loadExistingSettings(platformId)
            return
          }
        }

        // If no schema available, show error
        setError('Settings schema not available for this platform')
      } catch (err) {
        console.error('Failed to load settings schema:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSchema()
  }, [platformId, open])

  // Load existing settings
  const loadExistingSettings = async (platformId) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/platforms/${platformId}/settings`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings) {
          // Extract values from settings (may need to adjust based on actual API response)
          setValues(data.settings.config || {})
        }
      }
    } catch (err) {
      console.error('Failed to load existing settings:', err)
      // Continue with empty values
    }
  }

  // Handle field value change
  const handleFieldChange = (fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  // Handle form submission
  const handleSave = async () => {
    if (!schema) return

    // Validate all fields
    const validation = validateSchema(schema.fields, values)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Save settings via API
      const response = await fetch(`${config.apiUrl}/api/platforms/${platformId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: values })
      })

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        // Call onSave callback if provided
        if (onSave) {
          onSave(platformId, values)
        }
        onClose()
      } else {
        throw new Error(data.error || 'Failed to save settings')
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {schema?.title || `${platformId} Settings`}
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {schema && !loading && (
          <Box>
            {schema.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {schema.description}
              </Typography>
            )}

            <SchemaRenderer
              fields={schema.fields}
              values={values}
              onChange={handleFieldChange}
              errors={errors}
              groups={schema.groups}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || saving || !schema}
        >
          {saving ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SchemaSettingsPanel

