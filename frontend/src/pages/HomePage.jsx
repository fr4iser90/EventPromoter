import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  useMediaQuery,
  Tooltip
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import { createTheme } from '@mui/material/styles'
import { History as EventHistory } from '../features/event'
import FileUpload from '../flows/upload/FileUpload'
import { Container as ContentEditor } from '../features/platform'
import { DataPreview as Preview } from '../features/event'
import { Selector as PlatformSelector } from '../features/platform'
import SettingsModal from '../shared/components/ui/Dialog/Settings'
import DuplicateDialog from '../shared/components/ui/Dialog/Duplicate'
import Header from '../shared/components/Header'
import useStore, { WORKFLOW_STATES } from '../store'
import { useMultiplePlatformTranslations } from '../features/platform/hooks/usePlatformTranslations'
import { getApiUrl } from '../shared/utils/api'

// Static theme for media queries (needed before component renders)
const staticTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function HomePage() {
  const { t, i18n } = useTranslation()
  const {
    uploadedFileRefs,
    selectedHashtags,
    selectedPlatforms,
    platformContent,
    setPlatformContent,
    isProcessing,
    error,
    successMessage,
    darkMode,
    n8nWebhookUrl,
    workflowState,
    autoSaving,
    submit,
    reset,
    setDarkMode,
    setN8nWebhookUrl
  } = useStore()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [configuredMode, setConfiguredMode] = useState(null)

  // Load session data
  useEffect(() => {
    useStore.getState().initialize()
  }, [])

  // Load configured publishing mode
  useEffect(() => {
    const loadConfiguredMode = async () => {
      try {
        const response = await fetch(getApiUrl('platforms/publishing-mode'))
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setConfiguredMode(data.configuredMode)
          }
        }
      } catch (error) {
        console.warn('Failed to load configured publishing mode:', error)
      }
    }
    loadConfiguredMode()
  }, [])

  // Responsive breakpoints
  const isMobile = useMediaQuery(staticTheme.breakpoints.down('md'))

  // Determine what UI elements should be enabled based on workflow state
  const canUploadFiles = workflowState === WORKFLOW_STATES.INITIAL
  const canSelectPlatforms = [WORKFLOW_STATES.EVENT_READY, WORKFLOW_STATES.FILES_UPLOADED, WORKFLOW_STATES.PLATFORMS_SELECTED, WORKFLOW_STATES.CONTENT_READY].includes(workflowState)
  const canEditContent = [WORKFLOW_STATES.PLATFORMS_SELECTED, WORKFLOW_STATES.CONTENT_READY].includes(workflowState)
  const canSubmit = workflowState === WORKFLOW_STATES.CONTENT_READY && !isProcessing
  const canReset = workflowState !== WORKFLOW_STATES.INITIAL

  // Workflow progress calculation
  const getWorkflowProgress = () => {
    const states = Object.values(WORKFLOW_STATES)
    const currentIndex = states.indexOf(workflowState)
    return ((currentIndex + 1) / states.length) * 100
  }

  const getWorkflowStepInfo = () => {
    switch (workflowState) {
      case WORKFLOW_STATES.INITIAL:
        return { label: t('workflow.uploadFiles'), description: t('workflow.uploadFilesDescription') }
      case WORKFLOW_STATES.FILES_UPLOADED:
        return { label: t('workflow.selectPlatforms'), description: t('workflow.selectPlatformsDescription') }
      case WORKFLOW_STATES.EVENT_READY:
        return { label: t('workflow.selectPlatforms'), description: t('workflow.selectPlatformsDescription') }
      case WORKFLOW_STATES.PLATFORMS_SELECTED:
        return { label: t('workflow.createContent'), description: t('workflow.createContentDescription') }
      case WORKFLOW_STATES.CONTENT_READY:
        return { label: t('workflow.readyToPublish'), description: t('workflow.readyToPublishDescription') }
      case WORKFLOW_STATES.PUBLISHING:
        return { label: t('workflow.publishing'), description: t('workflow.publishingDescription') }
      case WORKFLOW_STATES.PUBLISHED:
        return { label: t('workflow.published'), description: t('workflow.publishedDescription') }
      default:
        return { label: t('common.unknown'), description: '' }
    }
  }

  const workflowStep = getWorkflowStepInfo()

  // Ensure arrays are always arrays
  const safeSelectedPlatforms = Array.isArray(selectedPlatforms) ? selectedPlatforms : []
  
  // Load platform translations automatically when platforms are selected
  useMultiplePlatformTranslations(safeSelectedPlatforms, i18n.language)
  const safeSelectedHashtags = Array.isArray(selectedHashtags) ? selectedHashtags : []
  const safeUploadedFileRefs = Array.isArray(uploadedFileRefs) ? uploadedFileRefs : []

  const handleSubmit = async () => {
    await submit()
  }

  const handleReset = () => {
    reset()
  }

  return (
    <>
      {/* Fixed Header */}
      <Header
        title={t('app.title')}
        showPublishingMode={true}
        configuredMode={configuredMode}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      {/* Workflow Progress Indicator */}
      <Box sx={{
        px: 2,
        py: 1,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Chip
            label={workflowStep.label}
            color={workflowState === WORKFLOW_STATES.PUBLISHED ? 'success' :
                   workflowState === WORKFLOW_STATES.PUBLISHING ? 'warning' :
                   workflowState === WORKFLOW_STATES.CONTENT_READY ? 'primary' : 'default'}
            size="small"
            icon={workflowState === WORKFLOW_STATES.PUBLISHED ? <CheckCircleIcon /> :
                  workflowState === WORKFLOW_STATES.INITIAL ? <RadioButtonUncheckedIcon /> :
                  <RadioButtonCheckedIcon />}
          />
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            {workflowStep.description}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={getWorkflowProgress()}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              bgcolor: workflowState === WORKFLOW_STATES.PUBLISHED ? 'success.main' :
                      workflowState === WORKFLOW_STATES.PUBLISHING ? 'warning.main' :
                      workflowState === WORKFLOW_STATES.CONTENT_READY ? 'primary.main' : 'grey.400'
            }
          }}
        />
      </Box>

      {/* Layout Container - Full Width */}
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        pt: 8 // Account for fixed header
      }}>
        {/* Main Content - Takes full width */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 2,
          py: 2,
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h6" component="h2" color="text.secondary">
              {t('workflow.subtitle')}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', maxWidth: '1200px', mx: 'auto', width: '100%' }}>
            <Box sx={{ mb: 4, display: 'flex', gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <FileUpload />
              </Box>
              <Box sx={{ flex: 1 }}>
                <EventHistory />
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Preview files={safeUploadedFileRefs} />
            </Box>

            <Box sx={{ mb: 4 }}>
              <PlatformSelector disabled={!canSelectPlatforms} />
            </Box>

            <Box sx={{ mb: 4 }}>
              <ContentEditor
                selectedPlatforms={safeSelectedPlatforms}
                platformContent={platformContent}
                onPlatformContentChange={setPlatformContent}
                disabled={!canEditContent}
              />
            </Box>

            {/* Next Step Guidance */}
            {workflowState === WORKFLOW_STATES.INITIAL && safeUploadedFileRefs.length === 0 && (
              <Alert severity="info" sx={{ mb: 4 }} icon={<span>👆</span>}>
                <strong>{t('workflow.startHere')}</strong> Upload your event files (PDF, images, documents) to begin creating content.
              </Alert>
            )}

            {workflowState === WORKFLOW_STATES.FILES_UPLOADED && safeSelectedPlatforms.length === 0 && (
              <Alert severity="info" sx={{ mb: 4 }} icon={<span>🎯</span>}>
                <strong>{t('workflow.next')}</strong> Select the platforms where you want to publish your content.
              </Alert>
            )}

            {workflowState === WORKFLOW_STATES.PLATFORMS_SELECTED && (
              <Alert severity="info" sx={{ mb: 4 }} icon={<span>✏️</span>}>
                <strong>{t('workflow.next')}</strong> Create platform-specific content in the editors above, then publish when ready.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 4 }}>
                {successMessage}
              </Alert>
            )}

            <Box sx={{ mt: 6, mb: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={!canSubmit || isProcessing}
                startIcon={isProcessing ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{
                  minWidth: 200,
                  transition: 'all 0.3s ease',
                  ...(canSubmit && !isProcessing && {
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-1px)'
                    }
                  })
                }}
              >
                {isProcessing ? t('workflow.publishingToPlatforms', {
                  count: safeSelectedPlatforms.length,
                  plural: safeSelectedPlatforms.length !== 1 ? 's' : ''
                }) : t('workflow.publishContent')}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={handleReset}
                disabled={isProcessing || !canReset}
                startIcon={<RefreshIcon />}
                color="warning"
                sx={{
                  opacity: canReset ? 1 : 0.5,
                  transition: 'opacity 0.3s ease'
                }}
              >
                🔄 Start Fresh
              </Button>
            </Box>

            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`📁 ${safeUploadedFileRefs.length} ${t('common.files')}`}
                  size="small"
                  color={safeUploadedFileRefs.length > 0 ? 'success' : 'default'}
                  variant={safeUploadedFileRefs.length > 0 ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`🎯 ${safeSelectedPlatforms.length} ${t('common.platforms')}`}
                  size="small"
                  color={safeSelectedPlatforms.length > 0 ? 'success' : 'default'}
                  variant={safeSelectedPlatforms.length > 0 ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`🏷️ ${safeSelectedHashtags.length} ${t('hashtags.title')}`}
                  size="small"
                  color={safeSelectedHashtags.length > 0 ? 'info' : 'default'}
                  variant={safeSelectedHashtags.length > 0 ? 'filled' : 'outlined'}
                />
                {autoSaving && (
                  <Chip
                    label={t('workflow.saving')}
                    size="small"
                    color="primary"
                    variant="filled"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Duplicate Dialog */}
      <DuplicateDialog />

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}

export default HomePage
