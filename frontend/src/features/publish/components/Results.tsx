import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import { usePlatforms } from '../../platform/hooks/usePlatformSchema'
import { getApiUrl } from '../../../shared/utils/api'

type PlatformMeta = { id: string; icon?: string; metadata?: { icon?: string } }
type PublishResultItem = {
  platform: string
  success: boolean
  error?: string
  data?: { url?: string; postId?: string; method?: string; sentAt?: string }
}
type PublishSession = {
  id: string
  timestamp: string
  totalDuration: number
  overallSuccess: boolean
  results: PublishResultItem[]
}

const PublishResults = ({
  open,
  onClose,
  publishSessionId
}: {
  open: boolean
  onClose: () => void
  publishSessionId: string | null
}) => {
  const { t } = useTranslation()
  const [results, setResults] = useState<PublishSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { platforms } = usePlatforms() as unknown as { platforms: PlatformMeta[] }

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

      const response = await axios.get(getApiUrl(`publish/results/${eventId}/${publishSessionId}`))

      if (response.data.success) {
        setResults(response.data.session)
      } else {
        setError(t('publishResults.failedToLoad'))
      }
    } catch (err) {
      console.error('Failed to load publish results:', err)
      setError(t('publishResults.failedToLoad'))
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    const seconds = Math.round(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getPlatformIcon = (platformId: string) => {
    // Get icon from backend platform metadata
    if (platforms && platforms.length > 0) {
      const platform = platforms.find((p) => p.id === platformId)
      if (platform) {
        return platform.icon || platform.metadata?.icon || '📱'
      }
    }
    return '📱'
  }

  const renderResultItem = (result: PublishResultItem) => (
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
              label={result.success ? t('publishResults.success') : t('publishResults.failed')}
              color={result.success ? 'success' : 'error'}
              size="small"
            />
          </Box>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            {!result.success && result.error && (
              <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                {t('publishResults.error')}: {result.error}
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
                      {t('history.viewPost')}
                    </Link>
                  </Box>
                )}

                {result.data.postId && (
                  <Typography variant="body2" color="text.secondary">
                    {t('publishResults.postId')}: {result.data.postId}
                  </Typography>
                )}

                {result.data.method && (
                  <Typography variant="body2" color="text.secondary">
                    {t('publishResults.method')}: {result.data.method.toUpperCase()}
                  </Typography>
                )}

                {result.data.sentAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {t('publishResults.sentAt')}: {new Date(result.data.sentAt).toLocaleString()}
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
        {t('publishResults.title')}
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>{t('publishResults.loading')}</Typography>
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
                {t('publishResults.sessionOverview')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  label={t('publishResults.totalPlatforms', { count: results.results.length })}
                  color="primary"
                />
                <Chip
                  label={t('publishResults.totalSuccess', { count: results.results.filter((r) => r.success).length })}
                  color="success"
                />
                <Chip
                  label={t('publishResults.totalFailed', { count: results.results.filter((r) => !r.success).length })}
                  color={results.results.some((r) => !r.success) ? 'error' : 'default'}
                />
                <Chip
                  label={t('publishResults.duration', { duration: formatDuration(results.totalDuration) })}
                  color="info"
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                {t('publishResults.sessionId')}: {results.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('publishResults.startedAt')}: {new Date(results.timestamp).toLocaleString()}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Results List */}
            <Typography variant="h6" gutterBottom>
              {t('publishResults.platformResults')}
            </Typography>

            <List>
              {results.results.map(renderResultItem)}
            </List>

            {/* Overall Status */}
            <Box sx={{ mt: 3 }}>
              {results.overallSuccess ? (
                <Alert severity="success">
                  {t('publishResults.allSuccess')}
                </Alert>
              ) : (
                <Alert severity="warning">
                  {t('publishResults.someFailed')}
                </Alert>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PublishResults
