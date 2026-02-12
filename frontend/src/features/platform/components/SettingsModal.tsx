/**
 * Platform Settings Modal Component
 * 
 * Generic settings modal that renders platform settings and credentials based on schema.
 * Contains two tabs: "Settings" (formerly Panel) and "Credentials".
 * 
 * @module features/platform/components/SettingsModal
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import EditModal from '../../../shared/components/EditModal'
import { usePlatformTranslations } from '../hooks/usePlatformTranslations'
import { getApiUrl } from '../../../shared/utils/api'
import type { SchemaField } from '../../schema/types'
import type {
  SettingsBackendErrors as BackendErrors,
  SettingsEditAction as EditAction,
  SettingsFieldConfig as FieldConfig,
  SettingsGenericValues as GenericValues,
  SettingsPlatformSchema as PlatformSchema,
  SettingsSectionConfig as SectionConfig
} from '../types'

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message
  return fallback
}

function SettingsModal({
  platformId,
  open,
  onClose,
  onSave
}: {
  platformId: string
  open: boolean
  onClose: () => void
  onSave?: (platformId: string, values: GenericValues) => void
}) {
  const { t, i18n } = useTranslation()
  usePlatformTranslations(platformId, i18n.language)
  const translate = (key?: string, fallback?: string) => {
    if (!key) return fallback || ''
    return t(key, { defaultValue: fallback || key })
  }
  const [activeTab, setActiveTab] = useState(0)
  const [schema, setSchema] = useState<PlatformSchema | null>(null)
  const [credentialsValues, setCredentialsValues] = useState<GenericValues>({})
  const [settingsValues, setSettingsValues] = useState<GenericValues>({})
  const [hasCredentials, setHasCredentials] = useState(false) // Track if credentials are configured
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dataLoaded, setDataLoaded] = useState(false) // Track if data was loaded for this modal instance
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentEditAction, setCurrentEditAction] = useState<EditAction | null>(null)

  // Convert backend errors (arrays) to strings for SchemaRenderer
  const formatErrors = (backendErrors?: BackendErrors) => {
    if (!backendErrors) return {}
    const formatted: Record<string, string> = {}
    Object.keys(backendErrors).forEach((field) => {
      const fieldErrors = backendErrors[field]
      if (Array.isArray(fieldErrors)) {
        formatted[field] = fieldErrors.join(', ')
      } else if (typeof fieldErrors === 'string') {
        formatted[field] = fieldErrors
      }
    })
    return formatted
  }

  // Load schema and data when platform changes or modal opens (ONLY ONCE per open)
  useEffect(() => {
    if (!platformId || !open) {
      // Reset when modal closes
      if (!open) {
        setDataLoaded(false)
        setCredentialsValues({})
        setSettingsValues({})
        setHasCredentials(false)
        setError(null)
        setErrors({})
      }
      return
    }

    // Only load if not already loaded for this modal instance
    if (dataLoaded) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load schema
        const schemaResponse = await fetch(getApiUrl(`platforms/${platformId}/schema`))
        if (!schemaResponse.ok) throw new Error(t('platform.failedToLoadSchema'))
        const schemaData = await schemaResponse.json() as { schema: PlatformSchema }
        
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

        // Load credentials status (no values sent for security)
        const credsResponse = await fetch(getApiUrl(`platforms/${platformId}/settings`))
        const initialValues: GenericValues = {}
        
        // Set defaults from schema first
        if (enrichedCredentials && enrichedCredentials.fields) {
          enrichedCredentials.fields.forEach((field: FieldConfig) => {
            if (field.default !== undefined) {
              initialValues[field.name] = field.type === 'number' ? Number(field.default) : field.default
            }
          })
        }
        
        if (credsResponse.ok) {
          const credsData = await credsResponse.json()
          if (credsData.success && credsData.settings) {
            // ✅ SECURITY: No credential values are sent from backend
            // Only check if credentials are configured
            setHasCredentials(credsData.settings.hasCredentials || credsData.settings.configured || false)
          }
        }
        
        setCredentialsValues(initialValues)
        setDataLoaded(true)
      } catch (err: unknown) {
        console.error('Failed to load platform data:', err)
        setError(getErrorMessage(err, t('platform.failedToLoadData')))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [platformId, open, dataLoaded])

  const handleValidate = async () => {
    try {
      setValidating(true)
      setError(null)
      setSuccessMessage(null)
      setErrors({})
      // NO CLIENT-SIDE VALIDATION - Backend validates everything!

      // Send values as-is to backend - backend will validate
      console.log(`[SettingsModal] Sending values to backend for validation:`, 
        Object.keys(credentialsValues).reduce((acc, key) => {
          acc[key] = key === 'password' ? '***' : credentialsValues[key]
          return acc
        }, {} as Record<string, unknown>)
      )

      // Backend validates - we just send the values
      const response = await fetch(getApiUrl(`platforms/${platformId}/settings`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: credentialsValues, validateOnly: true })
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error(`[SettingsModal] Backend validation failed for ${platformId}:`, data.errors)
        if (data.errors) {
          const formatted = formatErrors(data.errors)
          setErrors(formatted)
          const errorCount = Object.keys(formatted).length
          const errorFields = Object.keys(formatted).map((f) => {
            const field = schema?.credentials?.fields?.find((ff: FieldConfig) => ff.name === f)
            return field?.label || f
          }).join(', ')
          setError(t('platform.validationFailedWithFields', { count: errorCount, fields: errorFields }))
        } else {
          setError(data.error || t('platform.validationFailed'))
        }
        return false
      }

      console.log(`[SettingsModal] Backend validation passed for ${platformId}`)
      setError(null)
      setSuccessMessage(t('platform.validationPassed'))
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
      return true
    } catch (err: unknown) {
      console.error(`[SettingsModal] Validation error for ${platformId}:`, err)
      setError(getErrorMessage(err, t('platform.validationFailed')))
      return false
    } finally {
      setValidating(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setErrors({})

      console.log(`[SettingsModal] Saving ${platformId} credentials`)

      // Validate first
      const isValid = await handleValidate()
      if (!isValid) {
        console.warn(`[SettingsModal] Save aborted - validation failed for ${platformId}`)
        setSaving(false)
        return
      }

      // NO CLIENT-SIDE VALIDATION - Backend validates everything!
      // Send values as-is to backend
      const response = await fetch(getApiUrl(`platforms/${platformId}/settings`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: credentialsValues })
      })

      if (!response.ok) {
        const data = await response.json()
        console.error(`[SettingsModal] Save failed for ${platformId}:`, data)
        if (data.errors) {
          const formatted = formatErrors(data.errors)
          setErrors(formatted)
        }
        throw new Error(data.error || t('platform.failedToSaveCredentials'))
      }

      console.log(`[SettingsModal] Successfully saved ${platformId} credentials`)
      if (onSave) onSave(platformId, credentialsValues)
      onClose()
    } catch (err: unknown) {
      console.error(`[SettingsModal] Save error for ${platformId}:`, err)
      setError(getErrorMessage(err, t('platform.failedToSaveCredentials')))
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
            {t('platform.configurationFor', { platform: `${platformId?.charAt(0).toUpperCase() + platformId?.slice(1)}` })}
          </Typography>
        </Box>
        <Tabs 
          value={activeTab} 
          onChange={(_, v: number) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SettingsIcon />} label={t('platform.settings')} iconPosition="start" />
          <Tab icon={<KeyIcon />} label={t('platform.credentials')} iconPosition="start" />
        </Tabs>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}
            {activeTab === 0 && (
              <Box>
                {schema?.settings ? (
                  schema.settings.sections.map((section: SectionConfig) => (
                    <Box key={section.id} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {translate(section.title, section.title)}
                      </Typography>
                      {section.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {translate(section.description, section.description)}
                        </Typography>
                      )}
                      <SchemaRenderer
                        fields={section.fields as Array<SchemaField & { name: string }>}
                        values={settingsValues}
                        onChange={(f, v) => setSettingsValues((prev) => ({ ...prev, [f]: v }))}
                        platformId={platformId}
                        onButtonAction={(action) => {
                          // Handle button actions based on backend schema
                          const normalizedAction = typeof action === 'string'
                            ? ({ type: action } as EditAction)
                            : (action as EditAction)
                          if (normalizedAction.type === 'open-edit-modal' && normalizedAction.schemaId) {
                            setCurrentEditAction(normalizedAction)
                            setEditModalOpen(true)
                          }
                        }}
                      />
                    </Box>
                  ))
                ) : (
                  <Alert severity="info">{t('platform.noSettingsForPlatform')}</Alert>
                )}
              </Box>
            )}
            {activeTab === 1 && (
              <Box>
                {schema?.credentials ? (
                  <>
                    {/* ✅ SECURITY: Show indicator if credentials are configured */}
                    {hasCredentials && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {t('platform.credentialsConfiguredHint')}
                      </Alert>
                    )}
                    <SchemaRenderer
                      fields={schema.credentials.fields.map((field: FieldConfig) => {
                        // ✅ SECURITY: Add placeholder for sensitive fields if credentials are configured
                        const sensitiveKeywords = ['password', 'secret', 'token', 'key', 'apiKey', 'apiSecret', 'clientSecret', 'accessToken']
                        const isSensitive = sensitiveKeywords.some((keyword) =>
                          field.name.toLowerCase().includes(keyword.toLowerCase())
                        )
                        
                        if (isSensitive && hasCredentials && !field.placeholder) {
                          return {
                            ...field,
                            placeholder: t('platform.credentialsConfiguredMask')
                          }
                        }
                        return field
                      }) as Array<SchemaField & { name: string }>}
                      values={credentialsValues}
                      onChange={(f, v) => {
                        // For number fields, ensure we store the value properly
                        const field = schema.credentials?.fields.find((ff: FieldConfig) => ff.name === f)
                        let valueToStore = v
                        
                        if (field?.type === 'number') {
                          // If empty, use default or undefined
                          if (v === '' || v === null || v === undefined) {
                            valueToStore = field.default !== undefined ? field.default : undefined
                          } else {
                            // Convert to number
                            const numVal = Number(v)
                            valueToStore = isNaN(numVal) ? (field.default !== undefined ? field.default : undefined) : numVal
                          }
                        }
                        
                        setCredentialsValues((prev) => {
                          const newValues = { ...prev }
                          if (valueToStore === undefined) {
                            // Don't set undefined, but keep existing value or use default
                            if (field?.default !== undefined && prev[f] === undefined) {
                              newValues[f] = field.default
                            } else if (valueToStore === undefined && prev[f] !== undefined) {
                              // Keep existing value if new is undefined
                              return prev
                            }
                          } else {
                            newValues[f] = valueToStore
                          }
                          return newValues
                        })
                        
                        // Clear errors for this field when user types
                        if (errors[f]) {
                          setErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors[f]
                            return newErrors
                          })
                          if (error && Object.keys(errors).length === 1) {
                            setError(null)
                          }
                        }
                      }}
                      errors={errors}
                      groups={schema.credentials.groups}
                    />
                  </>
                ) : (
                  <Alert severity="info">{t('platform.noCredentialsForPlatform')}</Alert>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {/* Edit Modal for button actions */}
      {editModalOpen && currentEditAction && (
        <EditModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setCurrentEditAction(null)
          }}
          platformId={platformId}
          schemaId={currentEditAction.schemaId || ''}
          itemId={undefined}
          dataEndpoint={currentEditAction.dataEndpoint || ''}
          saveEndpoint={currentEditAction.endpoint || ''}
          method={currentEditAction.method || 'POST'}
          onSaveSuccess={() => {
            if (currentEditAction.onSuccess === 'reload') {
              // Reload settings data
              setDataLoaded(false)
            }
            setEditModalOpen(false)
            setCurrentEditAction(null)
          }}
        />
      )}

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>{t('common.cancel')}</Button>
        <Button 
          onClick={handleValidate} 
          variant="outlined" 
          disabled={loading || saving || validating}
          sx={{ mr: 1 }}
        >
          {validating ? t('platform.validating') : t('platform.validate')}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={loading || saving}>
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsModal
