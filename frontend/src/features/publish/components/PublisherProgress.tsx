/**
 * Publisher Progress Component
 * 
 * Real-time progress display for publishing operations using Server-Sent Events (SSE)
 * Works with all publisher types (API, Playwright, etc.)
 */

import { useState, useEffect, useRef } from 'react'
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  CircularProgress,
  Chip,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Divider,
  useTheme
} from '@mui/material'
import {
  CheckCircle,
  Error as ErrorIcon,
  Info,
  PlayArrow,
  ExpandMore,
  ExpandLess,
  Refresh,
  Code,
  Sensors
} from '@mui/icons-material'
import { getApiUrl } from '../../../shared/utils/api'
import { usePlatforms } from '../../platform/hooks/usePlatformSchema'

const STEP_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ERROR: 'error'
}

type PlatformMeta = {
  id: string
  name?: string
  icon?: string
  color?: string
  metadata?: { displayName?: string; icon?: string; color?: string }
}

type StepState = {
  platform?: string
  method?: string
  step?: string
  status?: string
  message?: string
  progress?: number
  duration?: number
  error?: string
  errorCode?: string
  retryable?: boolean
  publishRunId?: string
  startTime?: string
}

type PlatformState = {
  platform?: string
  method?: string
  status?: string
  steps: StepState[]
  publishRunId?: string
}

type PublisherEvent = {
  type?: string
  platform?: string
  method?: string
  step?: string
  message?: string
  timestamp?: string
  progress?: number
  duration?: number
  error?: string
  errorCode?: string
  retryable?: boolean
  publishRunId?: string
}

function PublisherProgress({
  sessionId,
  onComplete,
  onRetry
}: {
  sessionId: string | null
  onComplete?: (event: PublisherEvent) => void
  onRetry?: (platformId: string) => void
}) {
  const theme = useTheme()
  const [events, setEvents] = useState<PublisherEvent[]>([])
  const [steps, setSteps] = useState<Map<string, StepState>>(new Map())
  const [platforms, setPlatforms] = useState<Map<string, PlatformState>>(new Map()) // Group by platform (tracking state)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [overallProgress, setOverallProgress] = useState(0)
  const [overallStatus, setOverallStatus] = useState('pending') // pending, running, completed, failed
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set()) // Track expanded platforms
  const eventSourceRef = useRef<EventSource | null>(null)
  
  // ✅ GENERIC: Load platform info from backend via schema
  const { platforms: platformList } = usePlatforms() as unknown as { platforms: PlatformMeta[] }
  
  // Get platform info from backend - GENERIC (schema-based)
  const getPlatformInfo = (platformId: string) => {
    if (!platformList || platformList.length === 0) {
      return { name: platformId, icon: '📝', color: theme.palette.grey[600] }
    }
    
    const platform = platformList.find((p) => p.id === platformId)
    if (platform) {
      return {
        name: platform.name || platform.metadata?.displayName || platformId,
        icon: platform.icon || platform.metadata?.icon || '📝',
        color: platform.color || platform.metadata?.color || theme.palette.primary.main
      }
    }
    
    return { name: platformId, icon: '📝', color: theme.palette.grey[600] }
  }

  useEffect(() => {
    if (!sessionId || sessionId === "active-session") return

    // Connect to SSE stream
    const eventSource = new EventSource(`${getApiUrl('publish')}/stream/${sessionId}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as PublisherEvent
        console.log('📥 [SSE In] Received event:', data)
        
        // Handle connection
        if (data.type === 'connected') {
          console.log('✅ Connected to publisher event stream')
          return
        }

        // Handle publisher events
        if (data.type) {
          setEvents(prev => [...prev, data])
          
          // Update step status
          if (data.step) {
            setSteps(prev => {
              const newSteps = new Map(prev)
              const platformKey = data.platform || 'unknown'
              const stepKey = `${platformKey}-${data.step || 'unknown'}`
              
              if (data.type === 'step_started') {
                newSteps.set(stepKey, {
                  platform: data.platform,
                  method: data.method,
                  step: data.step,
                  status: STEP_STATUS.RUNNING,
                  message: data.message,
                  startTime: data.timestamp,
                  progress: 0,
                  publishRunId: data.publishRunId
                })
                setCurrentStep(data.step || null)
                setOverallStatus('running')
              } else if (data.type === 'step_progress') {
                const existing = newSteps.get(stepKey)
                if (existing) {
                  newSteps.set(stepKey, {
                    ...existing,
                    progress: data.progress,
                    message: data.message
                  })
                }
              } else if (data.type === 'step_completed') {
                const existing = newSteps.get(stepKey)
                if (existing) {
                  newSteps.set(stepKey, {
                    ...existing,
                    status: STEP_STATUS.COMPLETED,
                    duration: data.duration,
                    progress: 100
                  })
                }
                setCurrentStep(null)
                // Update platform status
                setPlatforms(prev => {
                  const newPlatforms = new Map(prev)
                  const platformData = newPlatforms.get(platformKey) || { status: 'running', steps: [] }
                  newPlatforms.set(platformKey, {
                    ...platformData,
                    status: 'running' // Still running, might have more steps
                  })
                  return newPlatforms
                })
              } else if (data.type === 'step_failed') {
                // ✅ NEW: Handle step_failed events with errorCode and retryable
                const existing = newSteps.get(stepKey)
                if (existing) {
                  newSteps.set(stepKey, {
                    ...existing,
                    status: STEP_STATUS.FAILED,
                    error: data.error,
                    errorCode: data.errorCode,
                    retryable: data.retryable || false
                  })
                } else {
                  // Create new step entry if it doesn't exist
                  newSteps.set(stepKey, {
                    platform: data.platform,
                    method: data.method,
                    step: data.step,
                    status: STEP_STATUS.FAILED,
                    error: data.error,
                    errorCode: data.errorCode,
                    retryable: data.retryable || false,
                    publishRunId: data.publishRunId
                  })
                }
                setError(data.error || 'Step failed')
                setOverallStatus('failed')
                setCurrentStep(null)
                // Update platform status
                setPlatforms(prev => {
                  const newPlatforms = new Map(prev)
                  const platformData = newPlatforms.get(platformKey) || { status: 'failed', steps: [] }
                  newPlatforms.set(platformKey, {
                    ...platformData,
                    status: 'failed'
                  })
                  return newPlatforms
                })
              } else if (data.type === 'error') {
                // Legacy error event (for backwards compatibility)
                const existing = newSteps.get(stepKey)
                if (existing) {
                  newSteps.set(stepKey, {
                    ...existing,
                    status: STEP_STATUS.ERROR,
                    error: data.error
                  })
                }
                setError(data.error || 'Unknown publishing error')
                setOverallStatus('failed')
                setCurrentStep(null)
              } else if (data.type === 'success') {
                // Update platform status to completed
                setPlatforms(prev => {
                  const newPlatforms = new Map(prev)
                  const platformData = newPlatforms.get(platformKey) || { status: 'completed', steps: [] }
                  newPlatforms.set(platformKey, {
                    ...platformData,
                    status: 'completed'
                  })
                  return newPlatforms
                })
                // Check if all platforms are done
                const allPlatforms = Array.from(platforms.values())
                  const allCompleted = allPlatforms.length > 0 && allPlatforms.every((p) => p.status === 'completed' || p.status === 'failed')
                if (allCompleted) {
                  setOverallStatus('completed')
                  if (onComplete) {
                    setTimeout(() => onComplete(data), 1000)
                  }
                }
              }
              
              // Update platform tracking
              if (data.platform) {
                setPlatforms(prev => {
                  const newPlatforms = new Map(prev)
                  const platformData = newPlatforms.get(platformKey) || {
                    platform: platformKey,
                    method: data.method,
                    status: 'pending',
                    steps: [],
                    publishRunId: data.publishRunId
                  }
                  
                  // Add step to platform if it's a step event
                  if (data.step && (data.type === 'step_started' || data.type === 'step_completed' || data.type === 'step_failed')) {
                    const stepIndex = platformData.steps.findIndex((s) => s.step === data.step)
                    if (stepIndex >= 0) {
                      platformData.steps[stepIndex] = {
                        ...platformData.steps[stepIndex],
                        status: data.type === 'step_started' ? 'running' : 
                                data.type === 'step_completed' ? 'completed' : 'failed',
                        duration: data.duration,
                        error: data.error,
                        errorCode: data.errorCode,
                        retryable: data.retryable
                      }
                    } else {
                      platformData.steps.push({
                        step: data.step,
                        status: data.type === 'step_started' ? 'running' : 
                                data.type === 'step_completed' ? 'completed' : 'failed',
                        message: data.message,
                        duration: data.duration,
                        error: data.error,
                        errorCode: data.errorCode,
                        retryable: data.retryable
                      })
                    }
                  }
                  
                  newPlatforms.set(platformKey, platformData)
                  return newPlatforms
                })
              }
              
              // Calculate overall progress
              const allSteps = Array.from(newSteps.values())
              if (allSteps.length > 0) {
                const totalProgress = allSteps.reduce((sum, s) => sum + (s.progress || 0), 0)
                const avgProgress = totalProgress / allSteps.length
                setOverallProgress(avgProgress)
              }
              
              return newSteps
            })
          }
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err)
      setError('Connection lost. Please check the console for details.')
      eventSource.close()
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [sessionId, onComplete, theme])

  const getStepIcon = (status?: string) => {
    switch (status) {
      case STEP_STATUS.COMPLETED:
        return <CheckCircle color="success" fontSize="small" />
      case STEP_STATUS.FAILED:
      case STEP_STATUS.ERROR:
        return <ErrorIcon color="error" fontSize="small" />
      case STEP_STATUS.RUNNING:
        return <PlayArrow color="primary" fontSize="small" />
      default:
        return <Info color="disabled" fontSize="small" />
    }
  }

  const getStepColor = (status?: string) => {
    switch (status) {
      case STEP_STATUS.COMPLETED:
        return 'success'
      case STEP_STATUS.FAILED:
      case STEP_STATUS.ERROR:
        return 'error'
      case STEP_STATUS.RUNNING:
        return 'primary'
      default:
        return 'default'
    }
  }
  
  const togglePlatform = (platformId: string) => {
    setExpandedPlatforms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(platformId)) {
        newSet.delete(platformId)
      } else {
        newSet.add(platformId)
      }
      return newSet
    })
  }

  const formatDuration = (ms: number) => {
    if (!ms) return ''
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const stepsArray = Array.from(steps.values())

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        bgcolor: theme.palette.background.default,
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sensors color={overallStatus === 'running' ? 'primary' : 'disabled'} sx={{ animation: overallStatus === 'running' ? 'pulse 2s infinite' : 'none' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Publishing Progress
          </Typography>
        </Box>
        <IconButton onClick={() => setExpanded(!expanded)} size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Overall Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
          <Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 'medium', textTransform: 'uppercase', letterSpacing: 1 }}>
            Status: {overallStatus.toUpperCase()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
              {Math.round(overallProgress)}%
            </Typography>
            {overallStatus === 'failed' && (
              <Chip label="Failed" size="small" color="error" variant="filled" sx={{ height: 20, fontSize: '0.7rem' }} />
            )}
            {overallStatus === 'completed' && (
              <Chip label="Done" size="small" color="success" variant="filled" sx={{ height: 20, fontSize: '0.7rem' }} />
            )}
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={overallProgress} 
          sx={{ 
            height: 6, 
            borderRadius: 3,
            bgcolor: theme.palette.action.hover,
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              bgcolor: overallStatus === 'failed' ? theme.palette.error.main : 
                       overallStatus === 'completed' ? theme.palette.success.main : 
                       theme.palette.primary.main
            }
          }}
        />
      </Box>

      {/* Current Step Alert */}
      {currentStep && (
        <Box sx={{ 
          mb: 2, 
          p: 1, 
          borderRadius: 1, 
          bgcolor: theme.palette.primary.main + '10', 
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <CircularProgress size={16} thickness={6} />
          <Typography variant="body2" sx={{ color: theme.palette.primary.dark, fontWeight: 'medium' }}>
            {currentStep}
          </Typography>
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2, py: 0 }}>
          {error}
        </Alert>
      )}

      {/* Multi-Platform View */}
      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {Array.from(platforms.values()).map((platform) => {
            const platformId = platform.platform || 'unknown'
            const isExpanded = expandedPlatforms.has(platformId)
            const platformSteps = stepsArray.filter((s) => s.platform === platformId)
            const hasRetryableErrors = platformSteps.some(s => s.retryable === true)
            const info = getPlatformInfo(platformId)
            
            return (
              <Box 
                key={platform.platform} 
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 1.5, 
                  overflow: 'hidden',
                  bgcolor: theme.palette.background.paper
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  p: 1.5,
                  bgcolor: theme.palette.action.hover
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton size="small" onClick={() => togglePlatform(platformId)} sx={{ p: 0.5 }}>
                      {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                    
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: info.color,
                      color: '#fff',
                      fontSize: '1.2rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {info.icon}
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        {info.name}
                      </Typography>
                      <Typography variant="caption" component="div" color="text.secondary" sx={{ display: 'block' }}>
                        via {platform.method?.toUpperCase() || 'UNKNOWN'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {platform.status === 'completed' && <CheckCircle color="success" fontSize="small" />}
                    {platform.status === 'failed' && <ErrorIcon color="error" fontSize="small" />}
                    {platform.status === 'running' && <CircularProgress size={14} thickness={6} />}
                    
                    {hasRetryableErrors && onRetry && (
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        startIcon={<Refresh />}
                        onClick={() => onRetry(platform.platform || 'unknown')}
                        sx={{ height: 24, fontSize: '0.65rem', px: 1 }}
                      >
                        Retry
                      </Button>
                    )}
                  </Box>
                </Box>
                
                <Collapse in={isExpanded}>
                  <Divider />
                  <List dense sx={{ py: 0 }}>
                    {platformSteps.length > 0 ? platformSteps.map((step, index) => (
                      <Box key={`${step.platform}-${step.step}-${index}`}>
                        <ListItem sx={{ py: 1, px: 2 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {getStepIcon(step.status)}
                          </ListItemIcon>
                          <ListItemText
                            primaryTypographyProps={{ component: 'div' }}
                            secondaryTypographyProps={{ component: 'div' }}
                            primary={
                              <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body2" component="span" sx={{ fontWeight: step.status === 'running' ? 'bold' : 'normal' }}>
                                  {step.step}
                                </Typography>
                                {step.duration && (
                                  <Typography variant="caption" component="span" sx={{ color: theme.palette.text.disabled }}>
                                    • {formatDuration(step.duration)}
                                  </Typography>
                                )}
                                {step.errorCode && (
                                  <Chip 
                                    label={step.errorCode} 
                                    size="small" 
                                    color="error"
                                    variant="outlined"
                                    sx={{ height: 16, fontSize: '0.6rem' }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box component="div" sx={{ mt: 0.5 }}>
                                {step.message && (
                                  <Typography variant="caption" component="div" color="text.secondary">
                                    {step.message}
                                  </Typography>
                                )}
                                {step.status === STEP_STATUS.RUNNING && (step.progress || 0) > 0 && (
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={step.progress || 0} 
                                    sx={{ mt: 0.5, height: 3, borderRadius: 1 }}
                                  />
                                )}
                                {step.error && (
                                  <Typography variant="caption" component="div" color="error" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                    {step.error}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < platformSteps.length - 1 && <Divider variant="inset" component="li" sx={{ ml: 6 }} />}
                      </Box>
                    )) : (
                      <ListItem sx={{ py: 2, justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.disabled">No steps recorded yet</Typography>
                      </ListItem>
                    )}
                  </List>
                </Collapse>
              </Box>
            )
          })}
        </Box>
      </Collapse>

      {stepsArray.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
          <Sensors sx={{ fontSize: 40, color: theme.palette.action.disabled, mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Waiting for publisher events...
          </Typography>
        </Box>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </Paper>
  )
}

export default PublisherProgress
