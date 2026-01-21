/**
 * Helper Icon Component
 * 
 * Displays a help icon (?) that shows helper information on hover/click.
 * Supports tooltip and dialog display modes (schema-driven from backend).
 * 
 * @module shared/components/ui/HelperIcon
 */

import React, { useState } from 'react'
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { getApiUrl } from '../../utils/api'
import ReactMarkdown from 'react-markdown'

/**
 * HelperIcon Component
 * 
 * @param {string} helperId - Helper ID (required)
 * @param {string} platformId - Platform ID (optional, for platform-specific helpers)
 * @param {string} context - Context for helper (optional)
 * @param {string} size - Icon size: 'small' | 'medium' (default: 'small')
 */
function HelperIcon({ helperId, platformId, context, size = 'small' }) {
  const { i18n } = useTranslation()
  const [helper, setHelper] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const loadHelper = async () => {
    // If helper already loaded, just open dialog
    if (helper) {
      setOpen(true)
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(
        getApiUrl(`helpers/${helperId}`),
        {
          params: {
            platform: platformId || undefined,
            lang: i18n.language.split('-')[0]
          }
        }
      )

      if (response.data.success) {
        setHelper(response.data.helper)
        setOpen(true)
      }
    } catch (error) {
      console.error('Failed to load helper:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  // Get language code
  const lang = i18n.language.split('-')[0]

  // Get display mode from helper (schema-driven)
  const displayMode = helper?.displayMode || 'tooltip'  // Fallback to tooltip

  // Tooltip-Modus: Hover zeigt Info, Click öffnet optional Dialog
  if (displayMode === 'tooltip') {
    const tooltipText = helper?.short?.[lang] || 
                       (typeof helper?.content === 'string' 
                         ? helper?.content 
                         : helper?.content?.[lang] || helper?.content?.en || '') || 
                       'Click for help'
    
    return (
      <>
        <Tooltip title={tooltipText}>
          <IconButton
            size={size}
            onClick={helper ? () => setOpen(true) : loadHelper}
            disabled={loading}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            {loading ? (
              <CircularProgress size={16} />
            ) : (
              <HelpOutlineIcon fontSize="inherit" />
            )}
          </IconButton>
        </Tooltip>
        
        {/* Optional: Dialog auch für tooltip-Modus (wenn title vorhanden) */}
        {open && helper && helper.title && (
          <Dialog open={open} onClose={handleClose} maxWidth="sm">
            <DialogTitle>
              {helper.title[lang] || helper.title.en || 'Help'}
              <IconButton
                onClick={handleClose}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                {typeof helper.content === 'string'
                  ? (helper.content[lang] || helper.content.en || helper.content)
                  : (helper.content?.[lang] || helper.content?.en || '')}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    )
  }

  // Dialog-Modus: Click öffnet Dialog mit vollständigem Content
  if (displayMode === 'dialog') {
    const tooltipText = helper?.short?.[lang] || helper?.short?.en || 'Click for help'
    
    return (
      <>
        <Tooltip title={tooltipText}>
          <IconButton
            size={size}
            onClick={loadHelper}
            disabled={loading}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            {loading ? (
              <CircularProgress size={16} />
            ) : (
              <HelpOutlineIcon fontSize="inherit" />
            )}
          </IconButton>
        </Tooltip>

        {open && helper && (
          <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
              {helper.title?.[lang] || helper.title?.en || 'Help'}
              <IconButton
                onClick={handleClose}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {helper.type === 'markdown' ? (
                <Box sx={{ 
                  '& p': { mb: 2 }, 
                  '& ul': { pl: 2, mb: 2 }, 
                  '& ol': { pl: 2, mb: 2 },
                  '& h1': { mt: 2, mb: 1, fontSize: '1.5rem' },
                  '& h2': { mt: 3, mb: 1, fontSize: '1.25rem' },
                  '& h3': { mt: 2, mb: 1, fontSize: '1.1rem' },
                  '& code': { bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 },
                  '& pre': { bgcolor: 'action.hover', p: 2, borderRadius: 1, overflow: 'auto' }
                }}>
                  <ReactMarkdown>
                    {typeof helper.content === 'string' 
                      ? helper.content 
                      : (helper.content?.[lang] || helper.content?.en || '')}
                  </ReactMarkdown>
                </Box>
              ) : helper.type === 'structured' ? (
                <Box>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {JSON.stringify(helper.content, null, 2)}
                  </pre>
                </Box>
              ) : (
                <Typography variant="body1" component="div">
                  {typeof helper.content === 'string' 
                    ? helper.content 
                    : (helper.content?.[lang] || helper.content?.en || '')}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    )
  }

  // Inline-Modus: Direkt im UI sichtbar
  if (displayMode === 'inline') {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {typeof helper?.content === 'string'
            ? helper.content
            : (helper?.content?.[lang] || helper?.content?.en || '')}
        </Typography>
        <IconButton
          size={size}
          onClick={loadHelper}
          disabled={loading}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          {loading ? (
            <CircularProgress size={16} />
          ) : (
            <HelpOutlineIcon fontSize="inherit" />
          )}
        </IconButton>
      </Box>
    )
  }

  // Fallback: Show icon without helper (will load on click)
  return (
    <Tooltip title="Click for help">
      <IconButton
        size={size}
        onClick={loadHelper}
        disabled={loading}
        sx={{ 
          color: 'text.secondary',
          '&:hover': { color: 'primary.main' }
        }}
      >
        {loading ? (
          <CircularProgress size={16} />
        ) : (
          <HelpOutlineIcon fontSize="inherit" />
        )}
      </IconButton>
    </Tooltip>
  )
}

export default HelperIcon
