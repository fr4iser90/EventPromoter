import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  useMediaQuery
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon
} from '@mui/icons-material'
import { useTheme, createTheme } from '@mui/material/styles'
import TemplateList from '../components/TemplateEditor/TemplateList'
import useStore from '../store'
import { usePlatforms } from '../hooks/usePlatformSchema'

function TemplatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { platforms, loading: platformsLoading } = usePlatforms()
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const { darkMode, setDarkMode } = useStore()

  // Set first platform as default when platforms are loaded
  useEffect(() => {
    if (platforms && platforms.length > 0 && !selectedPlatform) {
      setSelectedPlatform(platforms[0].id)
    }
  }, [platforms, selectedPlatform])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Load session data
  useEffect(() => {
    useStore.getState().initialize()
  }, [])

  const handlePlatformChange = (event, newValue) => {
    setSelectedPlatform(newValue)
  }

  const handleBackToMain = () => {
    navigate('/')
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
{t('templates.title')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            ← {t('navigation.home')}
          </Button>
          <IconButton
            onClick={toggleDarkMode}
            color="inherit"
            aria-label="toggle dark mode"
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Box>

      {/* Content Container */}
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        pt: 8 // Account for fixed header
      }}>
        {/* Linke Sidebar - Empty for templates */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          borderRight: 1,
          borderColor: 'divider',
          overflow: 'auto'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'text.secondary'
          }}>
            <Typography variant="body2">
{t('templates.management')}
            </Typography>
          </Box>
        </Box>

        {/* Main Content - Template Management */}
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
{t('templates.managementSystem')}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {/* Platform Tabs */}
            <Paper sx={{ mb: 4 }}>
              <Tabs
                value={selectedPlatform}
                onChange={handlePlatformChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    minHeight: 64,
                    textTransform: 'none'
                  }
                }}
              >
                {platforms && platforms.map((platform) => (
                  <Tab
                    key={platform.id}
                    value={platform.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{platform.icon || platform.metadata?.icon || '📱'}</span>
                        <span>{platform.name || platform.metadata?.displayName || platform.id}</span>
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Paper>

            {/* Template Management */}
            <TemplateList
              platform={selectedPlatform}
              onSelectTemplate={(template) => {
                // For now, just show selected template
                console.log('Selected template:', template)
              }}
            />

            {/* Footer Info */}
            <Paper sx={{ mt: 4, p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
{t('templates.usage')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
{t('templates.description')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{t('templates.defaultTemplates')}</strong> {t('templates.defaultTemplatesNote')}
                <strong>{t('templates.customTemplates')}</strong> {t('templates.customTemplatesNote')}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Rechte Sidebar - Empty for templates */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          overflow: 'auto'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'text.secondary'
          }}>
            <Typography variant="body2">
{t('templates.preview')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default TemplatePage
