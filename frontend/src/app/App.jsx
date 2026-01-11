import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '../i18n' // Initialize i18n
import HomePage from '../pages/HomePage'
import TemplatePage from '../pages/templates'
import useStore from '../store'

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
          <Route path="/" element={<HomePage />} />
          <Route path="/templates" element={<TemplatePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App