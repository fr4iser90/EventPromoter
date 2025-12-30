import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Tabs,
  Tab
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import ImportExportIcon from '@mui/icons-material/ImportExport'
import EmailIcon from '@mui/icons-material/Email'
import GroupIcon from '@mui/icons-material/Group'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import useStore from '../../store'

const DEFAULT_RECIPIENTS = [
  'dj-events@club.com',
  'booking@venue.de',
  'promo@agency.com'
]

const DEFAULT_EMAIL_GROUPS = {
  'DJs & Promoter': ['dj-events@club.com', 'promo@agency.com'],
  'Venue Manager': ['booking@venue.de', 'events@venue.de'],
  'Event Agencies': ['promo@agency.com', 'events@agency.com']
}

const DEFAULT_GROUP_NAMES = Object.keys(DEFAULT_EMAIL_GROUPS)

function EmailPanel() {
  const { platformSettings, setPlatformSettings } = useStore()
  const [customEmail, setCustomEmail] = useState('')
  const [recipients, setRecipients] = useState(DEFAULT_RECIPIENTS)
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [emailError, setEmailError] = useState('')
  const [emailGroups, setEmailGroups] = useState(DEFAULT_EMAIL_GROUPS)
  const [editingGroup, setEditingGroup] = useState(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupEmails, setNewGroupEmails] = useState('')
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importData, setImportData] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('emailPanelData')
    if (saved) {
      const data = JSON.parse(saved)
      setRecipients(data.recipients || DEFAULT_RECIPIENTS)
      setSelectedRecipients(data.selectedRecipients || [])
    }

    const savedGroups = localStorage.getItem('emailGroupsData')
    if (savedGroups) {
      const data = JSON.parse(savedGroups)
      setEmailGroups(data.groups || DEFAULT_EMAIL_GROUPS)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    const data = {
      recipients,
      selectedRecipients
    }
    localStorage.setItem('emailPanelData', JSON.stringify(data))

    // Update platform settings
    if (selectedRecipients.length > 0) {
      const currentSettings = platformSettings.email || {}
      setPlatformSettings({
        ...platformSettings,
        email: {
          ...currentSettings,
          recipients: selectedRecipients
        }
      })
    }
  }, [recipients, selectedRecipients])

  // Save groups to localStorage whenever groups change
  useEffect(() => {
    const data = { groups: emailGroups }
    localStorage.setItem('emailGroupsData', JSON.stringify(data))
  }, [emailGroups])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleAddEmail = () => {
    setEmailError('')
    const email = customEmail.trim().toLowerCase()

    if (!email) return

    if (!validateEmail(email)) {
      setEmailError('Bitte gültige Email-Adresse eingeben')
      return
    }

    if (recipients.includes(email)) {
      setEmailError('Diese Email-Adresse ist bereits in der Liste')
      return
    }

    setRecipients(prev => [...prev, email])
    setSelectedRecipients(prev => [...prev, email]) // Auto-select new email
    setCustomEmail('')
  }

  const handleToggleRecipient = (email) => {
    setSelectedRecipients(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    )
  }

  const handleRemoveRecipient = (emailToRemove) => {
    // Remove from recipients list
    setRecipients(prev => prev.filter(e => e !== emailToRemove))

    // Remove from selected recipients
    setSelectedRecipients(prev => prev.filter(e => e !== emailToRemove))

    // Remove from all groups (including default groups)
    setEmailGroups(prev => {
      const updated = {}
      Object.entries(prev).forEach(([groupName, emails]) => {
        updated[groupName] = emails.filter(email => email !== emailToRemove)
      })
      return updated
    })
  }

  const handleGroupSelect = (groupName) => {
    const groupEmails = emailGroups[groupName] || []
    setSelectedRecipients(prev => {
      // Remove existing group emails and add new ones
      const withoutGroup = prev.filter(email => !Object.values(emailGroups).flat().includes(email))
      return [...withoutGroup, ...groupEmails]
    })
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddEmail()
    }
  }

  // Group Management Functions
  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !newGroupEmails.trim()) return

    const emails = newGroupEmails
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => validateEmail(email))

    if (emails.length === 0) return

    setEmailGroups(prev => ({
      ...prev,
      [newGroupName.trim()]: emails
    }))

    setNewGroupName('')
    setNewGroupEmails('')
    setGroupDialogOpen(false)
  }

  const handleDeleteGroup = (groupName) => {
    if (DEFAULT_GROUP_NAMES.includes(groupName)) return // Protect default groups

    setEmailGroups(prev => {
      const updated = { ...prev }
      delete updated[groupName]
      return updated
    })
  }

  const handleEditGroup = (groupName, newEmails) => {
    const emails = newEmails
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => validateEmail(email))

    setEmailGroups(prev => ({
      ...prev,
      [groupName]: emails
    }))
    setEditingGroup(null)
  }

  const handleExportGroups = () => {
    const dataStr = JSON.stringify(emailGroups, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = 'email-groups.json'
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImportGroups = () => {
    try {
      const imported = JSON.parse(importData)
      setEmailGroups(prev => ({ ...prev, ...imported }))
      setImportDialogOpen(false)
      setImportData('')
    } catch (error) {
      alert('Invalid JSON format')
    }
  }

  return (
    <Paper elevation={3} sx={{
      p: 2,
      width: { xs: '100%', sm: 280 },
      maxWidth: { xs: '100%', sm: 280 },
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <EmailIcon sx={{ mr: 1, color: '#EA4335' }} />
        <Typography variant="h6">
          Email Settings
        </Typography>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Empfänger" />
        <Tab label="Gruppen" />
      </Tabs>

      {activeTab === 0 && (
        <>
          {/* Add Custom Email */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Neue Email hinzufügen
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="z.B. events@venue.de"
                value={customEmail}
                onChange={(e) => {
                  setCustomEmail(e.target.value)
                  setEmailError('')
                }}
                onKeyPress={handleKeyPress}
                error={!!emailError}
                helperText={emailError}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleAddEmail}
                disabled={!customEmail.trim()}
              >
                <AddIcon />
              </Button>
            </Box>
          </Box>

          {/* Email List */}
          <Typography variant="subtitle2" gutterBottom>
            Email-Empfänger ({recipients.length})
          </Typography>
          <List dense sx={{ maxHeight: 250, overflow: 'auto' }}>
            {recipients.map(email => (
              <ListItem key={email} sx={{ px: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Chip
                    label={email}
                    size="small"
                    variant={selectedRecipients.includes(email) ? "filled" : "outlined"}
                    color={selectedRecipients.includes(email) ? "primary" : "default"}
                    onClick={() => handleToggleRecipient(email)}
                    sx={{ cursor: 'pointer', mr: 1, maxWidth: 180 }}
                  />
                </Box>
                {!DEFAULT_RECIPIENTS.includes(email) && (
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveRecipient(email)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </ListItem>
            ))}
          </List>
        </>
      )}

      {activeTab === 1 && (
        <>
          {/* Group Management Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2">
              Email-Gruppen ({Object.keys(emailGroups).length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={() => setGroupDialogOpen(true)}>
                <AddIcon />
              </IconButton>
              <IconButton size="small" onClick={() => setImportDialogOpen(true)}>
                <ImportExportIcon />
              </IconButton>
              <IconButton size="small" onClick={handleExportGroups}>
                <SaveIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Email Groups */}
          {Object.entries(emailGroups).map(([groupName, emails]) => (
            <Box key={groupName} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {editingGroup === groupName ? (
                  <>
                    <TextField
                      size="small"
                      defaultValue={emails.join(', ')}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditGroup(groupName, e.target.value)
                        }
                      }}
                      sx={{ flex: 1 }}
                    />
                    <IconButton size="small" onClick={() => setEditingGroup(null)}>
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<GroupIcon />}
                      onClick={() => handleGroupSelect(groupName)}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {groupName} ({emails.length})
                    </Button>
                    <IconButton size="small" onClick={() => setEditingGroup(groupName)}>
                      <EditIcon />
                    </IconButton>
                    {!DEFAULT_GROUP_NAMES.includes(groupName) && (
                      <IconButton size="small" color="error" onClick={() => handleDeleteGroup(groupName)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {emails.map(email => (
                  <Chip
                    key={email}
                    label={email}
                    size="small"
                    variant={selectedRecipients.includes(email) ? "filled" : "outlined"}
                    color="secondary"
                  />
                ))}
              </Box>
            </Box>
          ))}
        </>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Selected Recipients Summary */}
      {selectedRecipients.length > 0 && (
        <Alert severity="info" size="small">
          {selectedRecipients.length} Empfänger ausgewählt
        </Alert>
      )}

      {selectedRecipients.length === 0 && (
        <Alert severity="warning" size="small">
          Keine Empfänger ausgewählt
        </Alert>
      )}

      {/* Create Group Dialog */}
      <Dialog open={groupDialogOpen} onClose={() => setGroupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neue Email-Gruppe erstellen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Gruppenname"
            fullWidth
            variant="outlined"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email-Adressen (komma-getrennt)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newGroupEmails}
            onChange={(e) => setNewGroupEmails(e.target.value)}
            placeholder="z.B. email1@example.com, email2@example.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGroupDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleCreateGroup} variant="contained">
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Groups Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Email-Gruppen importieren</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Füge JSON-Daten für Email-Gruppen ein:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="JSON Daten"
            fullWidth
            variant="outlined"
            multiline
            rows={6}
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder='{"Gruppenname": ["email1@example.com", "email2@example.com"]}'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleImportGroups} variant="contained">
            Importieren
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default EmailPanel
