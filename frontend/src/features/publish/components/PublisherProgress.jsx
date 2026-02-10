/**
 * Publisher Progress Component
 * 
 * Real-time progress display for publishing operations using Server-Sent Events (SSE)
 * Works with all publisher types (API, Playwright, etc.)
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button
} from '@mui/material'
import {
  CheckCircle,
  Error as ErrorIcon,
  Info,
  PlayArrow,
  ExpandMore,
  ExpandLess,
  Refresh,
  Code
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

function PublisherProgress({ sessionId, onComplete, onRetry }) {
  const [events, setEvents] = useState([])
  const [steps, setSteps] = useState(new Map())
  const [platforms, setPlatforms] = useState(new Map()) // Group by platform (tracking state)
  const [currentStep, setCurrentStep] = useState(null)
  const [overallProgress, setOverallProgress] = useState(0)
  const [overallStatus, setOverallStatus] = useState('pending') // pending, running, completed, failed
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(true)
  const [expandedPlatforms, setExpandedPlatforms] = useState(new Set()) // Track expanded platforms
  const eventSourceRef = useRef(null)
  
  // ✅ GENERIC: Load platform info from backend via schema
  const { platforms: platformList } = usePlatforms()
  
  // Get platform info from backend - GENERIC (schema-based)
  const getPlatformInfo = (platformId) => {
    if (!platformList || platformList.length === 0) {
      return { name: platformId, icon: '📝', color: '#666' }
    }
    
    const platform = platformList.find(p => p.id === platformId)
    if (platform) {
      return {
        name: platform.name || platform.metadata?.displayName || platformId,
        icon: platform.icon || platform.metadata?.icon || '📝',
        color: platform.color || platform.metadata?.color || '#666'
      }
    }
    
    return { name: platformId, icon: '📝', color: '#666' }
  }

  useEffect(() => {
    if (!sessionId) return

    // Connect to SSE stream
    const eventSource = new EventSource(`${getApiUrl('publish')}/stream/${sessionId}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        
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
              const stepKey = `${data.platform}-${data.step}`
              
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
                setCurrentStep(data.step)
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
                  const platformData = newPlatforms.get(data.platform) || { status: 'running', steps: [] }
                  newPlatforms.set(data.platform, {
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
                setError(data.error)
                setOverallStatus('failed')
                setCurrentStep(null)
                // Update platform status
                setPlatforms(prev => {
                  const newPlatforms = new Map(prev)
                  const platformData = newPlatforms.get(data.platform) || { status: 'failed', steps: [] }
                  newPlatforms.set(data.platform, {
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
                setError(data.error)
                setOverallStatus('failed')
                setCurrentStep(null)
              } else if (data.type === 'success') {
                // Update platform status to completed
                setPlatforms(prev => {
                  const newPlatforms = new Map(prev)
                  const platformData = newPlatforms.get(data.platform) || { status: 'completed', steps: [] }
                  newPlatforms.set(data.platform, {
                    ...platformData,
                    status: 'completed'
                  })
                  return newPlatforms
                })
                // Check if all platforms are done
                const allPlatforms = Array.from(platforms.values())
                const allCompleted = allPlatforms.length > 0 && allPlatforms.every(p => p.status === 'completed' || p.status === 'failed')
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
                  const platformData = newPlatforms.get(data.platform) || {
                    platform: data.platform,
                    method: data.method,
                    status: 'pending',
                    steps: [],
                    publishRunId: data.publishRunId
                  }
                  
                  // Add step to platform if it's a step event
                  if (data.step && (data.type === 'step_started' || data.type === 'step_completed' || data.type === 'step_failed')) {
                    const stepIndex = platformData.steps.findIndex(s => s.step === data.step)
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
                  
                  newPlatforms.set(data.platform, platformData)
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
  }, [sessionId, onComplete])

  const getStepIcon = (status) => {
    switch (status) {
      case STEP_STATUS.COMPLETED:
        return <CheckCircle color="success" />
      case STEP_STATUS.FAILED:
      case STEP_STATUS.ERROR:
        return <ErrorIcon color="error" />
      case STEP_STATUS.RUNNING:
        return <PlayArrow color="primary" />
      default:
        return <Info color="disabled" />
    }
  }

  const getStepColor = (status) => {
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
  
  const togglePlatform = (platformId) => {
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

  const formatDuration = (ms) => {
    if (!ms) return ''
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const stepsArray = Array.from(steps.values())

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          📊 Publishing Progress
        </Typography>
        <IconButton onClick={() => setExpanded(!expanded)} size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Overall Progress */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Overall Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {Math.round(overallProgress)}%
            </Typography>
            {overallStatus === 'failed' && (
              <Chip 
                label="Failed" 
                size="small" 
                color="error" 
                icon={<ErrorIcon />}
              />
            )}
            {overallStatus === 'completed' && (
              <Chip 
                label="Completed" 
                size="small" 
                color="success" 
                icon={<CheckCircle />}
              />
            )}
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={overallProgress} 
          color={overallStatus === 'failed' ? 'error' : overallStatus === 'completed' ? 'success' : 'primary'}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Current Step */}
      {currentStep && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Current:</strong> {currentStep}
          </Typography>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Multi-Platform View */}
      <Collapse in={expanded}>
        {Array.from(platforms.values()).length > 0 ? (
          <Box>
            {Array.from(platforms.values()).map((platform) => {
              const isExpanded = expandedPlatforms.has(platform.platform)
              const platformSteps = stepsArray.filter(s => s.platform === platform.platform)
              const hasRetryableErrors = platformSteps.some(s => s.retryable === true)
              
              return (
                <Box key={platform.platform} sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" onClick={() => togglePlatform(platform.platform)}>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      {/* ✅ GENERIC: Platform icon from schema */}
                      <Chip
                        icon={<span>{getPlatformInfo(platform.platform).icon}</span>}
                        label={getPlatformInfo(platform.platform).name}
                        size="small"
                        sx={{ bgcolor: getPlatformInfo(platform.platform).color, color: 'white', fontWeight: 'bold' }}
                      />
                      <Chip 
                        label={platform.method.toUpperCase()} 
                        size="small" 
                        color={platform.status === 'completed' ? 'success' : platform.status === 'failed' ? 'error' : 'primary'}
                        variant="outlined"
                      />
                      {platform.status === 'completed' && <CheckCircle color="success" fontSize="small" />}
                      {platform.status === 'failed' && <ErrorIcon color="error" fontSize="small" />}
                      {platform.status === 'running' && <PlayArrow color="primary" fontSize="small" />}
                    </Box>
                    {hasRetryableErrors && onRetry && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        startIcon={<Refresh />}
                        onClick={() => onRetry(platform.platform)}
                      >
                        Retry
                      </Button>
                    )}
                  </Box>
                  
                  <Collapse in={isExpanded}>
                    <List dense>
                      {platformSteps.map((step, index) => (
                        <ListItem key={`${step.platform}-${step.step}-${index}`}>
                          <ListItemIcon>
                            {getStepIcon(step.status)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body2" component="span">
                                  {step.step}
                                </Typography>
                                {step.duration && (
                                  <Chip 
                                    label={formatDuration(step.duration)} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                )}
                                {step.errorCode && (
                                  <Chip 
                                    icon={<Code />}
                                    label={step.errorCode} 
                                    size="small" 
                                    color="error"
                                    variant="outlined"
                                  />
                                )}
                                {step.retryable && (
                                  <Chip 
                                    label="Retryable" 
                                    size="small" 
                                    color="warning"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                {step.message && (
                                  <Typography variant="caption" color="text.secondary">
                                    {step.message}
                                  </Typography>
                                )}
                                {step.status === STEP_STATUS.RUNNING && step.progress > 0 && (
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={step.progress} 
                                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                  />
                                )}
                                {step.error && (
                                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                    {step.error}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              )
            })}
          </Box>
        ) : (
          <List>
            {stepsArray.map((step, index) => (
              <ListItem key={`${step.platform}-${step.step}-${index}`}>
                <ListItemIcon>
                  {getStepIcon(step.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" component="span">
                        {step.step}
                      </Typography>
                      <Chip 
                        label={step.method.toUpperCase()} 
                        size="small" 
                        color={getStepColor(step.status)}
                        variant="outlined"
                      />
                      {step.duration && (
                        <Chip 
                          label={formatDuration(step.duration)} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {step.errorCode && (
                        <Chip 
                          icon={<Code />}
                          label={step.errorCode} 
                          size="small" 
                          color="error"
                          variant="outlined"
                        />
                      )}
                      {step.retryable && (
                        <Chip 
                          label="Retryable" 
                          size="small" 
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      {step.message && (
                        <Typography variant="caption" color="text.secondary">
                          {step.message}
                        </Typography>
                      )}
                      {step.status === STEP_STATUS.RUNNING && step.progress > 0 && (
                        <LinearProgress 
                          variant="determinate" 
                          value={step.progress} 
                          sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                        />
                      )}
                      {step.error && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                          {step.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Collapse>

      {stepsArray.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Waiting for publisher events...
        </Typography>
      )}
    </Paper>
  )
}

export default PublisherProgress
