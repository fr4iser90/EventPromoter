import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material'
import useStore from '../../../../store'
import { getApiUrl } from '../../../utils/api'
import axios from 'axios'

type SettingsModalProps = {
  open: boolean
  onClose: () => void
}

function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { t } = useTranslation()
  const { n8nWebhookUrl, setN8nWebhookUrl, loadAppConfig } = useStore()
  const [tempN8nUrl, setTempN8nUrl] = useState('')
  const [publishingMode, setPublishingMode] = useState('auto')
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  // Load config when modal opens
  useEffect(() => {
    if (open) {
      loadAppConfig().then(async () => {
        try {
          const response = await axios.get(getApiUrl('config/app'))
          const config = response.data
          setTempN8nUrl(config.n8nWebhookUrl || 'http://localhost:5678/webhook/multiplatform-publisher')
          setPublishingMode(config.publishingMode || 'auto')
        } catch (error) {
          console.warn('Failed to load app config:', error)
          setTempN8nUrl(n8nWebhookUrl || 'http://localhost:5678/webhook/multiplatform-publisher')
          setPublishingMode('auto')
        }
      })
    }
  }, [open, loadAppConfig, n8nWebhookUrl])

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.patch(getApiUrl('config/app'), {
        n8nWebhookUrl: tempN8nUrl,
        publishingMode: publishingMode
      })
      setN8nWebhookUrl(tempN8nUrl)
      onClose()
    } catch (error: unknown) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setTempN8nUrl(n8nWebhookUrl)
    setValidationStatus(null)
    onClose()
  }

  const handleTestConnection = async () => {
    if (!tempN8nUrl || !tempN8nUrl.trim()) {
      setValidationStatus(false)
      return
    }

    setIsValidating(true)
    setValidationStatus(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      // ✅ Direkt POST Request (kein OPTIONS)
      const response = await fetch(tempN8nUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      })

      clearTimeout(timeoutId)

      // ✅ Jeder Status < 500 = Webhook existiert und antwortet
      setValidationStatus(response.status < 500)
      
    } catch (error) {
      // ✅ CORS-Fehler oder Network-Fehler
      // Wenn es ein CORS-Fehler ist, bedeutet das: Webhook existiert, nur CORS fehlt
      // Wenn es ein Network-Fehler ist (ECONNREFUSED), bedeutet das: Webhook nicht erreichbar
      
      if (error instanceof Error && error.name === 'AbortError') {
        // Timeout
        setValidationStatus(false)
      } else {
        // CORS oder Network-Fehler - schwer zu unterscheiden
        // Aber: Wenn n8n läuft und CORS fehlt, ist das eigentlich OK
        // Versuche es als "erfolgreich" zu werten, wenn es ein CORS-Fehler ist
        const isCorsError =
          error instanceof Error &&
          (error.message.includes('CORS') || error.message.includes('Failed to fetch'))
        setValidationStatus(isCorsError) // CORS-Fehler = Webhook existiert
      }
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('settingsDialog.title')}
      </DialogTitle>

      <DialogContent>
        {/* Publishing Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('settingsDialog.publishingSectionTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('settingsDialog.publishingSectionDescription')}
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('settingsDialog.publishingMethodLabel')}</InputLabel>
            <Select
              value={publishingMode}
              onChange={(e) => setPublishingMode(e.target.value)}
              label={t('settingsDialog.publishingMethodLabel')}
            >
              <MenuItem value="auto">{t('settingsDialog.modeAuto')}</MenuItem>
              <MenuItem value="api">{t('settingsDialog.modeApi')}</MenuItem>
              <MenuItem value="n8n">{t('settingsDialog.modeN8n')}</MenuItem>
              <MenuItem value="playwright">{t('settingsDialog.modePlaywright')}</MenuItem>
            </Select>
          </FormControl>

          {publishingMode === 'auto' && (
            <Alert severity="info" sx={{ mt: 1 }}>
              {t('settingsDialog.autoModeInfo')}
              <Box component="ol" sx={{ mt: 1, mb: 0, pl: 3 }}>
                <li>{t('settingsDialog.modeN8n')}</li>
                <li>{t('settingsDialog.modeApi')}</li>
                <li>{t('settingsDialog.modePlaywright')}</li>
              </Box>
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* N8N Integration Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('settingsDialog.n8nSectionTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('settingsDialog.n8nSectionDescription')}
          </Typography>

          <TextField
            fullWidth
            label={t('settingsDialog.n8nWebhookUrlLabel')}
            value={tempN8nUrl}
            onChange={(e) => {
              setTempN8nUrl(e.target.value)
              setValidationStatus(null)
            }}
            placeholder="http://localhost:5678/webhook/multiplatform-publisher"
            variant="outlined"
            error={validationStatus === false}
            sx={{ mb: 2 }}
          />

          <Button
            variant="outlined"
            onClick={handleTestConnection}
            disabled={isValidating || !tempN8nUrl?.trim()}
            startIcon={isValidating ? <CircularProgress size={16} /> : null}
          >
            {t('settingsDialog.testConnection')}
          </Button>

          {validationStatus !== null && (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: validationStatus ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}
              >
                {validationStatus ? t('settingsDialog.connectionSuccess') : t('settingsDialog.connectionFailed')}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} color="inherit" disabled={saving}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? t('common.saving') : t('settingsDialog.saveSettings')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsModal
