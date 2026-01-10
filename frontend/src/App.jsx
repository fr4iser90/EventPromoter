import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './i18n' // Initialize i18n
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import SendIcon from '@mui/icons-material/Send'
import RefreshIcon from '@mui/icons-material/Refresh'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import SettingsIcon from '@mui/icons-material/Settings'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import EventHistory from './components/EventHistory/EventHistory'
import FileUpload from './components/FileUpload/FileUpload'
import ContentEditor from './components/ContentEditor/ContentEditor'
import Preview from './components/Preview/Preview'
import HashtagBuilder from './components/HashtagBuilder/HashtagBuilder'
import PlatformSelector from './components/PlatformSelector/PlatformSelector'
import DynamicPanelWrapper from './components/Panels/DynamicPanelWrapper'
import SettingsModal from './components/SettingsModal/SettingsModal'
import DuplicateDialog from './components/DuplicateDialog/DuplicateDialog'
import TemplatePage from './pages/TemplatePage'
import useStore, { WORKFLOW_STATES } from './store'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMultiplePlatformTranslations } from './hooks/usePlatformTranslations'

const createAppTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

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

// Main Application Page Component
function MainPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
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

  // Load session data
  useEffect(() => {
    useStore.getState().initialize()
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
        return { label: '📁 Upload Files', description: 'Start by uploading your event files' }
      case WORKFLOW_STATES.FILES_UPLOADED:
        return { label: '🎯 Select Platforms', description: 'Choose where to publish your content' }
      case WORKFLOW_STATES.EVENT_READY:
        return { label: '🎯 Select Platforms', description: 'Choose where to publish your content' }
      case WORKFLOW_STATES.PLATFORMS_SELECTED:
        return { label: '✏️ Create Content', description: 'Write platform-specific content' }
      case WORKFLOW_STATES.CONTENT_READY:
        return { label: '📤 Ready to Publish', description: 'Review and publish your content' }
      case WORKFLOW_STATES.PUBLISHING:
        return { label: '🚀 Publishing...', description: 'Sending content to platforms' }
      case WORKFLOW_STATES.PUBLISHED:
        return { label: '✅ Published!', description: 'Content successfully published' }
      default:
        return { label: 'Unknown', description: '' }
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

  // Create panel arrays for left and right sidebars - GENERIC, loads from backend
  const leftPanels = []
  const rightPanels = []

  // Dynamically create panels for selected platforms - no hardcoded platform logic
  safeSelectedPlatforms.forEach((platformId, index) => {
    const panelComponent = <DynamicPanelWrapper key={platformId} platform={platformId} />
    // Distribute panels between left and right (alternating)
    if (index % 2 === 0) {
      leftPanels.push({ key: platformId, component: panelComponent })
    } else {
      rightPanels.push({ key: platformId, component: panelComponent })
    }
  })

  // Debug: Log panel creation (only in development mode to reduce console noise)
  if (process.env.NODE_ENV === 'development' && safeSelectedPlatforms.length > 0) {
    console.log('[App] Selected platforms:', safeSelectedPlatforms)
    console.log('[App] Left panels:', leftPanels.length)
    console.log('[App] Right panels:', rightPanels.length)
  }

  // Check if panels should be shown
  const hasLeftPanels = leftPanels.length > 0
  const hasRightPanels = rightPanels.length > 0
  const hasAnyPanels = hasLeftPanels || hasRightPanels

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <>
      {/* Fixed Header */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        px: 2,
        py: 1
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: '100%' }}>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1, textAlign: 'center' }}>
            {t('app.title')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/templates')}
            sx={{ mr: 1 }}
          >
            📝 {t('navigation.templates')}
          </Button>
          <FormControl size="small" sx={{ mr: 1, minWidth: 80 }}>
            <Select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              displayEmpty
              sx={{ color: 'text.primary', '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
            >
              <MenuItem value="en">{t('language.english')}</MenuItem>
              <MenuItem value="de">{t('language.german')}</MenuItem>
              <MenuItem value="es">{t('language.spanish')}</MenuItem>
            </Select>
          </FormControl>
          <IconButton
            onClick={() => setSettingsOpen(true)}
            color="inherit"
            aria-label="open settings"
          >
            <SettingsIcon />
          </IconButton>
          <IconButton
            onClick={toggleDarkMode}
            color="inherit"
            aria-label="toggle dark mode"
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Box>

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

      {/* Layout Container - Always 1/3, 1/3, 1/3 */}
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        pt: 8 // Account for fixed header
      }}>
        {/* Linke Sidebar - Always 1/3 */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          borderRight: 1,
          borderColor: 'divider',
          overflow: 'auto'
        }}>
          {hasLeftPanels ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'flex-start'
            }}>
              {leftPanels.map(panel => (
                <Box key={panel.key} sx={{ flex: '1 1 auto', minWidth: 0 }}>
                  {panel.component}
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography variant="body2">
                Panels können beliebig breit werden
              </Typography>
            </Box>
          )}
        </Box>

        {/* Main Content - Stable 1/3 */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 2,
          py: 2,
          borderRight: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h6" component="h2" color="text.secondary">
              Upload files, build content, and publish across multiple platforms
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
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

            <Box sx={{ mb: 4 }}>
              <HashtagBuilder disabled={!canEditContent} />
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
                  label={`📁 ${safeUploadedFileRefs.length} Files`}
                  size="small"
                  color={safeUploadedFileRefs.length > 0 ? 'success' : 'default'}
                  variant={safeUploadedFileRefs.length > 0 ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`🎯 ${safeSelectedPlatforms.length} Platforms`}
                  size="small"
                  color={safeSelectedPlatforms.length > 0 ? 'success' : 'default'}
                  variant={safeSelectedPlatforms.length > 0 ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`🏷️ ${safeSelectedHashtags.length} Hashtags`}
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

        {/* Rechte Sidebar - Always 1/3 */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          overflow: 'auto'
        }}>
          {hasRightPanels ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'flex-start'
            }}>
              {rightPanels.map(panel => (
                <Box key={panel.key} sx={{ flex: '1 1 auto', minWidth: 0 }}>
                  {panel.component}
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography variant="body2">
                Panels können beliebig breit werden
              </Typography>
            </Box>
          )}
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

// Main App Component with Router
function App() {
  const { darkMode, setDarkMode } = useStore()

  // Initialize dark mode from API (only on mount)
  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/config/app')
        const config = await response.json()
        if (config.darkMode !== undefined) {
          setDarkMode(config.darkMode)
        }
      } catch (error) {
        console.warn('Failed to load app config:', error)
      }
    }

    loadAppConfig()
  }, [setDarkMode])

  // Create theme based on dark mode state
  const theme = createAppTheme(darkMode)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/templates" element={<TemplatePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App