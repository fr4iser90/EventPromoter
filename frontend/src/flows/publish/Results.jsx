import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material'
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Link as LinkIcon,
  Schedule as TimeIcon
} from '@mui/icons-material'
import axios from 'axios'
import { usePlatforms } from '../../features/platform/hooks/usePlatformSchema'

const PublishResults = ({ open, onClose, publishSessionId }) => {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { platforms } = usePlatforms()

  useEffect(() => {
    if (open && publishSessionId) {
      loadResults()
    }
  }, [open, publishSessionId])

  const loadResults = async () => {
    if (!publishSessionId) return

    setLoading(true)
    setError(null)

    try {
      // Extract eventId from sessionId (format: publish-timestamp-random)
      const parts = publishSessionId.split('-')
      const eventId = `event-${parts[1]}`

      const response = await axios.get(`http://localhost:4000/api/publish/results/${eventId}/${publishSessionId}`)

      if (response.data.success) {
        setResults(response.data.session)
      } else {
        setError('Failed to load publish results')
      }
    } catch (err) {
      console.error('Failed to load publish results:', err)
      setError('Failed to load publish results')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`
    const seconds = Math.round(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getPlatformIcon = (platformId) => {
    // Get icon from backend platform metadata
    if (platforms && platforms.length > 0) {
      const platform = platforms.find(p => p.id === platformId)
      if (platform) {
        return platform.icon || platform.metadata?.icon || '📱'
      }
    }
    return '📱'
  }

  const renderResultItem = (result) => (
    <ListItem key={result.platform} divider>
      <ListItemIcon>
        {result.success ? (
          <SuccessIcon color="success" />
        ) : (
          <ErrorIcon color="error" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{getPlatformIcon(result.platform)}</span>
            <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
              {result.platform}
            </Typography>
            <Chip
              label={result.success ? 'Erfolgreich' : 'Fehlgeschlagen'}
              color={result.success ? 'success' : 'error'}
              size="small"
            />
          </Box>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            {!result.success && result.error && (
              <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                Fehler: {result.error}
              </Typography>
            )}

            {result.data && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {result.data.url && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinkIcon fontSize="small" />
                    <Link
                      href={result.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                    >
                      Beitrag ansehen
                    </Link>
                  </Box>
                )}

                {result.data.postId && (
                  <Typography variant="body2" color="text.secondary">
                    Post-ID: {result.data.postId}
                  </Typography>
                )}


                {result.data.sentAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Gesendet: {new Date(result.data.sentAt).toLocaleString('de-DE')}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        }
      />
    </ListItem>
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        📊 Publishing-Ergebnisse
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Lade Ergebnisse...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {results && (
          <Box>
            {/* Session Overview */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Session-Übersicht
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  label={`Gesamt: ${results.results.length} Plattformen`}
                  color="primary"
                />
                <Chip
                  label={`Erfolgreich: ${results.results.filter(r => r.success).length}`}
                  color="success"
                />
                <Chip
                  label={`Fehlgeschlagen: ${results.results.filter(r => !r.success).length}`}
                  color={results.results.some(r => !r.success) ? 'error' : 'default'}
                />
                <Chip
                  label={`Dauer: ${formatDuration(results.totalDuration)}`}
                  color="info"
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Session-ID: {results.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestartet: {new Date(results.timestamp).toLocaleString('de-DE')}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Results List */}
            <Typography variant="h6" gutterBottom>
              Plattform-Ergebnisse
            </Typography>

            <List>
              {results.results.map(renderResultItem)}
            </List>

            {/* Overall Status */}
            <Box sx={{ mt: 3 }}>
              {results.overallSuccess ? (
                <Alert severity="success">
                  🎉 Alle Plattformen erfolgreich veröffentlicht!
                </Alert>
              ) : (
                <Alert severity="warning">
                  ⚠️ Einige Plattformen sind fehlgeschlagen. Überprüfe die Ergebnisse oben.
                </Alert>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PublishResults
