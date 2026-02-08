import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
import {
  Box,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon
} from '@mui/icons-material'
import useStore from '../../store'

const Header = ({ 
  title, 
  showSettings = true, 
  showPublishingMode = false, 
  configuredMode = null,
  onSettingsClick = null
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { darkMode, setDarkMode } = useStore()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const isHomePage = location.pathname === '/'
  const isTemplatesPage = location.pathname === '/templates'
  const isHistoryPage = location.pathname.startsWith('/history')

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick()
    }
  }

  return (
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
          {title || t('app.title')}
        </Typography>
        
        {/* Publishing Mode Badge (Development Only) */}
        {showPublishingMode && process.env.NODE_ENV === 'development' && configuredMode && (
          <Tooltip title={`Configured publishing mode: ${configuredMode}`} arrow>
            <Chip
              label={configuredMode.toUpperCase()}
              size="small"
              color={configuredMode === 'auto' ? 'info' : configuredMode === 'n8n' ? 'success' : configuredMode === 'api' ? 'primary' : 'default'}
              sx={{ mr: 1, fontSize: '0.7rem' }}
            />
          </Tooltip>
        )}

        {/* Navigation Buttons */}
        {!isHomePage && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            ← {t('navigation.home')}
          </Button>
        )}
        
        {!isTemplatesPage && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/templates')}
            sx={{ mr: 1 }}
          >
            📝 {t('navigation.templates')}
          </Button>
        )}
        
        {!isHistoryPage && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/history')}
            sx={{ mr: 1 }}
          >
            📊 {t('navigation.history')}
          </Button>
        )}

        {/* Language Selector */}
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

        {/* Settings Icon */}
        {showSettings && (
          <IconButton
            onClick={handleSettingsClick}
            color="inherit"
            aria-label="open settings"
            sx={{ mr: 1 }}
          >
            <SettingsIcon />
          </IconButton>
        )}

        {/* Dark Mode Toggle */}
        <IconButton
          onClick={toggleDarkMode}
          color="inherit"
          aria-label="toggle dark mode"
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>
    </Box>
  )
}

export default Header
