/**
 * Helper Icon Component
 * 
 * Displays a help icon (?) that shows helper information on hover/click.
 * Supports tooltip and dialog display modes (schema-driven from backend).
 * 
 * @module shared/components/ui/HelperIcon
 */

import { useState } from 'react'
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
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { getApiUrl } from '../../utils/api'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

type MarkdownPart =
  | { type: 'markdown'; content: string }
  | { type: 'accordion'; id: number }

type AccordionEntry = {
  id: number
  summary: string
  content: string
}

type HelperContent = string | Record<string, string> | Record<string, unknown>

type HelperPayload = {
  displayMode?: 'tooltip' | 'dialog' | 'inline'
  short?: Record<string, string>
  title?: Record<string, string>
  content?: HelperContent
  type?: 'markdown' | 'structured' | 'text'
}

/**
 * Markdown component with Accordion support for details/summary blocks
 * Processes markdown content and converts HTML details/summary to Material-UI Accordions
 */
function MarkdownWithAccordions({ content }: { content: string }) {
  // Simple regex to find details/summary blocks (non-greedy to handle multiple blocks)
  const detailsRegex = /<details>\s*<summary>(.*?)<\/summary>\s*([\s\S]*?)<\/details>/g
  
  const parts: MarkdownPart[] = []
  const accordions: AccordionEntry[] = []
  let lastIndex = 0
  let match
  let accordionIndex = 0

  // Find all details blocks
  while ((match = detailsRegex.exec(content)) !== null) {
    // Add content before this accordion
    if (match.index > lastIndex) {
      parts.push({
        type: 'markdown',
        content: content.substring(lastIndex, match.index)
      })
    }
    
    // Extract summary and content
    const summaryText = match[1].replace(/<[^>]+>/g, '').trim()
    const detailsContent = match[2]
    
    accordions.push({
      id: accordionIndex++,
      summary: summaryText,
      content: detailsContent
    })
    
    parts.push({
      type: 'accordion',
      id: accordionIndex - 1
    })
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining content after last accordion
  if (lastIndex < content.length) {
    parts.push({
      type: 'markdown',
      content: content.substring(lastIndex)
    })
  }
  
  // If no accordions found, render everything as markdown
  if (accordions.length === 0) {
    return (
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    )
  }

  // Render parts in order
  return (
    <Box>
      {parts.map((part, index) => {
        if (part.type === 'accordion') {
          const accordion = accordions[part.id]
          if (!accordion) return null
          return (
            <Accordion key={`accordion-${part.id}`} sx={{ mb: 2, boxShadow: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {accordion.summary}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ 
                  '& p': { mb: 1 }, 
                  '& pre': { mb: 1 },
                  '& code': { bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 },
                  '& ul': { pl: 2, mb: 1 },
                  '& ol': { pl: 2, mb: 1 }
                }}>
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {accordion.content}
                  </ReactMarkdown>
                </Box>
              </AccordionDetails>
            </Accordion>
          )
        } else {
          return (
            <ReactMarkdown key={`markdown-${index}`} rehypePlugins={[rehypeRaw]}>
              {part.content}
            </ReactMarkdown>
          )
        }
      })}
    </Box>
  )
}

/**
 * HelperIcon Component
 * 
 * @param {string} helperId - Helper ID (required)
 * @param {string} platformId - Platform ID (optional, for platform-specific helpers)
 * @param {string} context - Context for helper (optional)
 * @param {string} size - Icon size: 'small' | 'medium' (default: 'small')
 */
function HelperIcon({
  helperId,
  platformId,
  context,
  size = 'small'
}: {
  helperId: string
  platformId?: string | null
  context?: string
  size?: 'small' | 'medium' | 'large'
}) {
  const { i18n, t } = useTranslation()
  const [helper, setHelper] = useState<HelperPayload | null>(null)
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
  const localizedContent = (() => {
    if (!helper?.content) return ''
    if (typeof helper.content === 'string') return helper.content
    const contentMap = helper.content as Record<string, unknown>
    const localized = contentMap[lang] ?? contentMap.en ?? ''
    return typeof localized === 'string' ? localized : ''
  })()

  // Tooltip-Modus: Hover zeigt Info, Click öffnet optional Dialog
  if (displayMode === 'tooltip') {
    const tooltipText = helper?.short?.[lang] || localizedContent || t('helper.clickForHelp')
    
    return (
      <>
        <Box
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          sx={{ display: 'inline-flex' }}
        >
          <Tooltip title={tooltipText}>
            <IconButton
              size={size}
              onClick={(e) => {
                e.stopPropagation() // Prevent event bubbling to parent
                if (helper) {
                  setOpen(true)
                } else {
                  loadHelper()
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
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
        </Box>
        
        {/* Optional: Dialog auch für tooltip-Modus (wenn title vorhanden) */}
        {open && helper && helper.title && (
          <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="sm"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <DialogTitle
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {helper.title[lang] || helper.title.en || t('helper.title')}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose()
                }}
                onMouseDown={(e) => e.stopPropagation()}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Typography variant="body1">
                {localizedContent}
              </Typography>
            </DialogContent>
            <DialogActions
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose()
                }}
              >
                {t('common.close')}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    )
  }

  // Dialog-Modus: Click öffnet Dialog mit vollständigem Content
  if (displayMode === 'dialog') {
    const tooltipText = helper?.short?.[lang] || helper?.short?.en || t('helper.clickForHelp')
    
    return (
      <>
        <Box
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          sx={{ display: 'inline-flex' }}
        >
          <Tooltip title={tooltipText}>
            <IconButton
              size={size}
              onClick={(e) => {
                e.stopPropagation() // Prevent event bubbling to parent
                loadHelper()
              }}
              onMouseDown={(e) => e.stopPropagation()}
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
        </Box>

        {open && helper && (
          <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="md" 
            fullWidth
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <DialogTitle
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {helper.title?.[lang] || helper.title?.en || t('helper.title')}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose()
                }}
                onMouseDown={(e) => e.stopPropagation()}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {helper.type === 'markdown' ? (
                <Box sx={{ 
                  '& p': { mb: 2 }, 
                  '& ul': { pl: 2, mb: 2 }, 
                  '& ol': { pl: 2, mb: 2 },
                  '& h1': { mt: 2, mb: 1, fontSize: '1.5rem' },
                  '& h2': { mt: 3, mb: 1, fontSize: '1.25rem' },
                  '& h3': { mt: 2, mb: 1, fontSize: '1.1rem' },
                  '& code': { bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 },
                  '& pre': { bgcolor: 'action.hover', p: 2, borderRadius: 1, overflow: 'auto' },
                  '& details': { mb: 2 },
                  '& summary': { 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    mb: 1,
                    '&:hover': { color: 'primary.main' }
                  }
                }}>
                  <MarkdownWithAccordions content={localizedContent} />
                </Box>
              ) : helper.type === 'structured' ? (
                <Box>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {JSON.stringify(helper.content ?? {}, null, 2)}
                  </pre>
                </Box>
              ) : (
                <Typography variant="body1" component="div">
                  {localizedContent}
                </Typography>
              )}
            </DialogContent>
            <DialogActions
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose()
                }}
              >
                {t('common.close')}
              </Button>
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
          {localizedContent}
        </Typography>
        <IconButton
          size={size}
          onClick={(e) => {
            e.stopPropagation() // Prevent event bubbling to parent
            loadHelper()
          }}
          onMouseDown={(e) => e.stopPropagation()}
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
    <Box
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      sx={{ display: 'inline-flex' }}
    >
      <Tooltip title={t('helper.clickForHelp')}>
        <IconButton
          size={size}
          onClick={(e) => {
            e.stopPropagation() // Prevent event bubbling to parent
            loadHelper()
          }}
          onMouseDown={(e) => e.stopPropagation()}
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
    </Box>
  )
}

export default HelperIcon
