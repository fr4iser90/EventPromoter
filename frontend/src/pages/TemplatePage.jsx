import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  IconButton
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import TemplateList from '../components/TemplateEditor/TemplateList'

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter', icon: '🐦' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'reddit', name: 'Reddit', icon: '🟠' },
  { id: 'email', name: 'Email', icon: '📧' }
]

function TemplatePage() {
  const navigate = useNavigate()
  const [selectedPlatform, setSelectedPlatform] = useState('twitter')

  const handlePlatformChange = (event, newValue) => {
    setSelectedPlatform(newValue)
  }

  const handleBackToMain = () => {
    navigate('/')
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <IconButton
          onClick={handleBackToMain}
          sx={{ mr: 1 }}
          aria-label="back to main"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          📝 Template Manager
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage reusable content templates for each platform
        </Typography>
      </Box>

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
          {PLATFORMS.map((platform) => (
            <Tab
              key={platform.id}
              value={platform.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{platform.icon}</span>
                  <span>{platform.name}</span>
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
          💡 Template Usage
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Templates help you create consistent content across platforms. Create platform-specific templates
          with placeholders like <code>{'{eventTitle}'}</code>, <code>{'{venue}'}</code>, and <code>{'{description}'}</code>
          that will be automatically filled with your event data.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Default templates</strong> cannot be modified but serve as examples.
          <strong>Custom templates</strong> can be fully edited and deleted.
        </Typography>
      </Paper>
    </Container>
  )
}

export default TemplatePage
