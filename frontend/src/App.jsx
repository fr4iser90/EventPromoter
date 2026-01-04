import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import SendIcon from '@mui/icons-material/Send'
import RefreshIcon from '@mui/icons-material/Refresh'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import SettingsIcon from '@mui/icons-material/Settings'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import EventHistory from './components/EventHistory/EventHistory'
import FileUpload from './components/FileUpload/FileUpload'
import UploadParser from './components/Parser/UploadParser'
import Preview from './components/Preview/Preview'
import HashtagBuilder from './components/HashtagBuilder/HashtagBuilder'
import PlatformSelector from './components/PlatformSelector/PlatformSelector'
import RedditPanel from './components/Panels/RedditPanel'
import EmailPanel from './components/Panels/EmailPanel'
import TwitterPanel from './components/Panels/TwitterPanel'
import FacebookPanel from './components/Panels/FacebookPanel'
import InstagramPanel from './components/Panels/InstagramPanel'
import LinkedInPanel from './components/Panels/LinkedInPanel'
import SettingsModal from './components/SettingsModal/SettingsModal'
import DuplicateDialog from './components/DuplicateDialog/DuplicateDialog'
import useStore from './store'
import { useEffect, useState } from 'react'

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

function App() {
  const {
    uploadedFileRefs,
    selectedHashtags,
    selectedPlatforms,
    isProcessing,
    error,
    successMessage,
    darkMode,
    n8nWebhookUrl,
    submit,
    reset,
    setDarkMode,
    setN8nWebhookUrl
  } = useStore()

  const [settingsOpen, setSettingsOpen] = useState(false)

  // Initialize dark mode from API (only on mount)
  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/config/app')
        const config = await response.json()
        if (config.darkMode !== undefined && config.darkMode !== darkMode) {
          setDarkMode(config.darkMode)
        }
        if (config.n8nWebhookUrl && config.n8nWebhookUrl !== n8nWebhookUrl) {
          setN8nWebhookUrl(config.n8nWebhookUrl)
        }
      } catch (error) {
        console.warn('Failed to load app config:', error)
      }
    }

    loadAppConfig()

    // Load session data
    useStore.getState().initialize()
  }, []) // Empty dependency array - only run on mount

  // Save configuration changes to API
  useEffect(() => {
    const saveAppConfig = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/config/app')
        const currentConfig = await response.json()
        const updatedConfig = {
          ...currentConfig,
          darkMode,
          n8nWebhookUrl,
          lastUpdated: new Date().toISOString()
        }

        await fetch('http://localhost:4000/api/config/app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedConfig)
        })
      } catch (error) {
        console.warn('Failed to save app config:', error)
      }
    }

    saveAppConfig()
  }, [darkMode, n8nWebhookUrl])

  // Responsive breakpoints
  const isMobile = useMediaQuery(staticTheme.breakpoints.down('md'))

  // Ensure arrays are always arrays
  const safeSelectedPlatforms = Array.isArray(selectedPlatforms) ? selectedPlatforms : []
  const safeSelectedHashtags = Array.isArray(selectedHashtags) ? selectedHashtags : []
  const safeUploadedFileRefs = Array.isArray(uploadedFileRefs) ? uploadedFileRefs : []

  const handleSubmit = async () => {
    await submit()
  }

  const handleReset = () => {
    reset()
  }

  const canSubmit = safeUploadedFileRefs.length > 0 && safeSelectedPlatforms.length > 0

  // Create theme based on dark mode state
  const theme = createAppTheme(darkMode)

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Check which panels should be visible
  const showRedditPanel = safeSelectedPlatforms.includes('reddit')
  const showTwitterPanel = safeSelectedPlatforms.includes('twitter')
  const showFacebookPanel = safeSelectedPlatforms.includes('facebook')
  const showInstagramPanel = safeSelectedPlatforms.includes('instagram')
  const showLinkedInPanel = safeSelectedPlatforms.includes('linkedin')
  const showEmailPanel = safeSelectedPlatforms.includes('email')

  // Create panel arrays for left and right sidebars
  const leftPanels = []
  const rightPanels = []

  if (showRedditPanel) leftPanels.push({ key: 'reddit', component: <RedditPanel /> })
  if (showTwitterPanel) leftPanels.push({ key: 'twitter', component: <TwitterPanel /> })
  if (showFacebookPanel) leftPanels.push({ key: 'facebook', component: <FacebookPanel /> })

  if (showInstagramPanel) rightPanels.push({ key: 'instagram', component: <InstagramPanel /> })
  if (showLinkedInPanel) rightPanels.push({ key: 'linkedin', component: <LinkedInPanel /> })
  if (showEmailPanel) rightPanels.push({ key: 'email', component: <EmailPanel /> })

  // Check if panels should be shown
  const hasLeftPanels = leftPanels.length > 0
  const hasRightPanels = rightPanels.length > 0
  const hasAnyPanels = hasLeftPanels || hasRightPanels


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
            Multi-Platform Social Media Publisher
          </Typography>
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
              <PlatformSelector />
            </Box>

            <Box sx={{ mb: 4 }}>
              <UploadParser />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Preview files={safeUploadedFileRefs} />
            </Box>

            <Box sx={{ mb: 4 }}>
              <HashtagBuilder />
            </Box>

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
                sx={{ minWidth: 200 }}
              >
                {isProcessing ? 'Sending to n8n...' : 'Publish Content'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={handleReset}
                disabled={isProcessing}
                startIcon={<RefreshIcon />}
              >
                Reset
              </Button>
            </Box>

            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Files: {safeUploadedFileRefs.length} • Hashtags: {safeSelectedHashtags.length} • Platforms: {safeSelectedPlatforms.length}
              </Typography>
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

    </ThemeProvider>
  )
}

export default App
