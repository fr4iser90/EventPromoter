import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '../i18n' // Initialize i18n
import '../shared/utils/axiosConfig' // Initialize axios interceptors (language headers)
import EventWorkflowPage from '../pages/EventWorkflowPage'
import TemplateManagementPage from '../pages/TemplateManagementPage'
import EventHistoryPage from '../pages/EventHistoryPage'
import EventDetailPage from '../pages/EventDetailPage'
import PlatformSettingsPage from '../pages/PlatformSettingsPage'
import LoginPage from '../pages/LoginPage'
import PrivacyPage from '../pages/PrivacyPage'
import TermsPage from '../pages/TermsPage'
import ContactPage from '../pages/ContactPage'
import RequireAuth from '../shared/components/layout/RequireAuth'
import useStore from '../store'
import { getApiUrl } from '../shared/utils/api'
import { createAppTheme } from './theme'

// Main App Component with Router
function App() {
  const { darkMode, setDarkMode } = useStore()

  // Initialize dark mode from API (only on mount)
  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        const response = await fetch(getApiUrl('config/app'))
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/impressum" element={<ContactPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<EventWorkflowPage />} />
            <Route path="/templates" element={<TemplateManagementPage />} />
            <Route path="/history" element={<EventHistoryPage />} />
            <Route path="/history/:eventId" element={<EventDetailPage />} />
            <Route path="/platforms" element={<PlatformSettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App