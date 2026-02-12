import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
import { LAYOUT } from '../../app/theme'
import {
  Box,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  SettingsInputComponent as CustomIcon,
  Link as N8nIcon,
  Send as ApiIcon,
  SmartToy as PlaywrightIcon
} from '@mui/icons-material'
import useStore from '../../store'

type HeaderProps = {
  title?: string
  showSettings?: boolean
  showPublishingMode?: boolean
  selectedPlatforms?: string[]
  onSettingsClick?: (() => void) | null
}

const Header = ({ 
  title, 
  showSettings = true, 
  showPublishingMode = true, 
  selectedPlatforms = [],
  onSettingsClick = null
}: HeaderProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { darkMode, setDarkMode, globalPublishingMode, setGlobalPublishingMode } = useStore()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode !== null) {
      setGlobalPublishingMode(newMode)
    }
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
      position: 'sticky',
      top: 0,
      zIndex: 1100,
      bgcolor: 'background.paper',
      borderBottom: 1,
      borderColor: 'divider',
      px: 2,
      py: 1,
      minHeight: LAYOUT.headerHeight,
      display: 'flex',
      alignItems: 'center'
    }}>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            maxWidth: { xs: '45%', md: '60%' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            px: 1,
          }}
        >
          {title || t('app.title')}
        </Typography>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
        {/* Platform Badges */}
        {selectedPlatforms.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mr: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {selectedPlatforms.map(platformId => (
              <Chip
                key={platformId}
                label={platformId}
                size="small"
                sx={{ fontSize: '0.7rem', height: '24px' }}
              />
            ))}
          </Box>
        )}

        {/* Global Publishing Mode FastSwitch */}
        {showPublishingMode && isHomePage && (
          <Box sx={{ mr: 2 }}>
            <ToggleButtonGroup
              value={globalPublishingMode}
              exclusive
              onChange={handleModeChange}
              size="small"
              aria-label="publishing mode"
              sx={{ 
                height: 32,
                bgcolor: 'background.default',
                '& .MuiToggleButton-root': {
                  px: 1,
                  py: 0,
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }
                }
              }}
            >
              <Tooltip title="CUSTOM Mode (Manual Overrides)" arrow>
                <ToggleButton value="custom" aria-label="custom">
                  <CustomIcon sx={{ fontSize: 18 }} />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="n8n Integration" arrow>
                <ToggleButton value="n8n" aria-label="n8n">
                  <N8nIcon sx={{ fontSize: 18 }} />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Direct API" arrow>
                <ToggleButton value="api" aria-label="api">
                  <ApiIcon sx={{ fontSize: 18 }} />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Playwright Automation" arrow>
                <ToggleButton value="playwright" aria-label="playwright">
                  <PlaywrightIcon sx={{ fontSize: 18 }} />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>
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
    </Box>
  )
}

export default Header
