import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { List as TemplateList } from '../features/templates'
import { TemplatePreview, TemplateEditor } from '../features/templates'
import PageShell from '../shared/components/layout/PageShell'
import PageToolbar from '../shared/components/layout/PageToolbar'
import useStore from '../store'
import { usePlatforms } from '../features/platform/hooks/usePlatformSchema'

import type { TemplateRecord } from '../features/templates/types'

// Right Panel States
const RIGHT_PANEL_STATES = {
  EMPTY: 'empty',
  VIEW: 'view',
  EDIT: 'edit'
} as const

type RightPanelState = typeof RIGHT_PANEL_STATES[keyof typeof RIGHT_PANEL_STATES]

function TemplateManagementPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { platforms } = usePlatforms() as unknown as { platforms: any[] }
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateRecord | null>(null)
  const [rightPanelState, setRightPanelState] = useState<RightPanelState>(RIGHT_PANEL_STATES.EMPTY)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Set first platform as default when platforms are loaded
  useEffect(() => {
    if (platforms && platforms.length > 0 && !selectedPlatform) {
      setSelectedPlatform(platforms[0].id)
    }
  }, [platforms, selectedPlatform])

  // Load session data
  useEffect(() => {
    useStore.getState().initialize()
  }, [])

  // Reset selection when platform changes
  useEffect(() => {
    setSelectedTemplate(null)
    setRightPanelState(RIGHT_PANEL_STATES.EMPTY)
  }, [selectedPlatform])

  const handlePlatformChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedPlatform(newValue)
  }

  const handleTemplateSelect = (template: TemplateRecord) => {
    setSelectedTemplate(template)
    setRightPanelState(RIGHT_PANEL_STATES.VIEW)
  }

  const handleTemplateEdit = (template: TemplateRecord) => {
    setSelectedTemplate(template)
    setRightPanelState(RIGHT_PANEL_STATES.EDIT)
  }

  const handleEditCancel = () => {
    setRightPanelState(RIGHT_PANEL_STATES.VIEW)
  }

  const handleEditSave = () => {
    setRightPanelState(RIGHT_PANEL_STATES.VIEW)
    // TemplateList will reload automatically
  }

  return (
    <PageShell title={t('templates.title')} headerProps={{ showSettings: false }}>
      {/* Content Container - Split View */}
      <Box sx={{
        display: 'flex',
        minHeight: '100%',
        width: '100%'
      }}>
        {/* Left Panel - Template List (60% on desktop, 100% on mobile) */}
        <Box sx={{
          flex: isMobile ? 1 : 0.6,
          display: 'flex',
          flexDirection: 'column',
          borderRight: isMobile ? 0 : 1,
          borderColor: 'divider',
          overflow: 'hidden'
        }}>
          {/* Toolbar */}
          <PageToolbar>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                placeholder={t('templates.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Platform Tabs */}
            <Paper sx={{ mb: 2 }}>
              <Tabs
                value={selectedPlatform}
                onChange={handlePlatformChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                {platforms && (platforms as any[]).map((platform) => (
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
          </PageToolbar>

          {/* Template List */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <TemplateList
              platform={selectedPlatform || ''}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleTemplateSelect}
              onEditTemplate={handleTemplateEdit}
            />
          </Box>
        </Box>

        {/* Right Panel - Preview/Editor (40% on desktop, hidden on mobile) */}
        {!isMobile && (
          <Box sx={{
            flex: 0.4,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: 1,
            borderColor: 'divider',
            overflow: 'hidden',
            bgcolor: 'background.default'
          }}>
            {rightPanelState === RIGHT_PANEL_STATES.EMPTY && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 4,
                textAlign: 'center',
                color: 'text.secondary'
              }}>
                <Typography variant="h6" gutterBottom>
                  {t('templates.selectTemplate')}
                </Typography>
                <Typography variant="body2">
                  {t('templates.selectTemplateHint')}
                </Typography>
              </Box>
            )}

            {rightPanelState === RIGHT_PANEL_STATES.VIEW && selectedTemplate && (
              <TemplatePreview
                template={selectedTemplate}
                platform={selectedPlatform || ''}
                onEdit={() => handleTemplateEdit(selectedTemplate)}
              />
            )}

            {rightPanelState === RIGHT_PANEL_STATES.EDIT && selectedTemplate && (
              <TemplateEditor
                template={selectedTemplate}
                platform={selectedPlatform || ''}
                onCancel={handleEditCancel}
                onSave={handleEditSave}
              />
            )}
          </Box>
        )}
      </Box>
    </PageShell>
  )
}

export default TemplateManagementPage
