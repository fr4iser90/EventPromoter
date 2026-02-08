import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Tooltip,
  useTheme,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  KeyboardArrowDown as ArrowDownIcon,
  Description as TemplateIcon,
  Check as CheckIcon,
  AttachFile as AttachFileIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { PreviewFrame } from '../../../shared/components/PreviewFrame'
import { useTemplates } from '../hooks/useTemplates'
import { useTemplateCategories } from '../hooks/useTemplateCategories'
import { usePlatformSchema } from '../../platform/hooks/usePlatformSchema'
import { usePlatformTranslations } from '../../platform/hooks/usePlatformTranslations'
import CompositeRenderer from '../../schema/components/CompositeRenderer'
import FileSelectionBlock from '../../platform/components/blocks/FileSelectionBlock'
import useStore from '../../../store'
import { getTemplateVariables, replaceTemplateVariables } from '../../../shared/utils/templateUtils'
import { getApiUrl } from '../../../shared/utils/api'
import { getUserLocale, getLocaleMap, getLocaleDisplayName, getValidLocale } from '../../../shared/utils/localeUtils'
import { resolveTargetsLocale, resolveGroupsLocale } from '../../../shared/utils/targetUtils'

const TemplateSelector = ({ platform, onSelectTemplate, currentContent = '', globalFiles = [], sx = {} }) => {
  // Use mode='preview' to get templates without <style> tags (backend removes them)
  const { templates, loading, error } = useTemplates(platform, 'preview')
  const { categories } = useTemplateCategories()
  const { schema } = usePlatformSchema(platform) // Load schema to check for targets block
  const { parsedData, uploadedFileRefs } = useStore()
  const theme = useTheme() // Get current theme for dark mode detection
  const isMobile = useMediaQuery(theme.breakpoints.down('md')) // Mobile detection for hybrid layout
  const { t, i18n } = useTranslation() // i18n translation hook
  
  // ✅ GENERIC: Get editor schema and platform info (not platform-specific)
  const editorSchema = schema?.editor
  const editorBlocks = editorSchema?.blocks || []
  const platformId = editorSchema?.platformId || platform
  const fileSelectionBlock = editorBlocks.find(block => block.type === 'file_selection_input')
  
  // Load platform translations dynamically based on schema
  usePlatformTranslations(platformId, i18n.language)
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [previewCss, setPreviewCss] = useState(null)
  const [targetsValue, setTargetsValue] = useState(null) // Store targets selection
  const [specificFiles, setSpecificFiles] = useState([]) // NEW: Specific files for this run
  const [mobileTab, setMobileTab] = useState(0) // For mobile tabs: 0 = Config, 1 = Preview
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(true) // Accordion state for attachments
  const [previewLocale, setPreviewLocale] = useState(() => getUserLocale(i18n)) // Store resolved locale for preview

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Function to load preview with current theme
  // ✅ Wrapped in useCallback to ensure it always uses the latest theme
  const loadPreview = useCallback(async (template) => {
    // ✅ Resolve locale: Priority: templateLocale (from dropdown) > Target Locale > User Language
    let previewLocale = getUserLocale(i18n) // Default: User Language
    
    if (targetsValue) {
      // Priority 1: Use templateLocale from dropdown if explicitly set
      if (targetsValue.templateLocale) {
        previewLocale = getValidLocale(targetsValue.templateLocale)
      } else {
        // Priority 2: Try to resolve locale from targets (Option B: Locale pro Target)
        const targetsBlock = schema?.editor?.blocks?.find(block => block.type === 'targets')
        const dataEndpoints = targetsBlock?.rendering?.dataEndpoints || {}
        
        try {
          if (targetsValue.mode === 'individual' && targetsValue.individual?.length > 0) {
            // Try to resolve locale from individual targets
            if (targetsValue.individual.length === 1) {
              // Single target: Use its locale
              const targetLocale = await resolveTargetsLocale(
                targetsValue.individual,
                platform,
                dataEndpoints.recipients || `platforms/${platform}/targets`
              )
              if (targetLocale) previewLocale = targetLocale
            } else {
              // Multiple targets: Use locale if all have same locale
              const targetLocale = await resolveTargetsLocale(
                targetsValue.individual,
                platform,
                dataEndpoints.recipients || `platforms/${platform}/targets`
              )
              if (targetLocale) previewLocale = targetLocale
              // If mixed locales, fall back to user locale
            }
          } else if (targetsValue.mode === 'groups' && targetsValue.groups?.length > 0) {
            // Try to resolve locale from groups
            if (targetsValue.groups.length === 1) {
              // Single group: Use its locale
              const groupLocale = await resolveGroupsLocale(
                targetsValue.groups,
                platform,
                dataEndpoints.recipientGroups || `platforms/${platform}/target-groups`
              )
              if (groupLocale) previewLocale = groupLocale
            } else {
              // Multiple groups: Use locale if all have same locale
              const groupLocale = await resolveGroupsLocale(
                targetsValue.groups,
                platform,
                dataEndpoints.recipientGroups || `platforms/${platform}/target-groups`
              )
              if (groupLocale) previewLocale = groupLocale
              // If mixed locales, fall back to user locale
            }
          }
          // For 'all' mode, use user locale (no target-specific locale)
        } catch (error) {
          console.warn('Failed to resolve target locale for preview:', error)
          // Fall back to user locale
        }
      }
    }
    
    // Store resolved locale in state for display
    setPreviewLocale(previewLocale)
    
    // Select correct template content based on resolved locale
    let templateContent = template.template || {}
    if (previewLocale !== 'en' && template.translations?.[previewLocale]) {
      templateContent = template.translations[previewLocale]
    }
    
    // Generate preview content using parsedData and uploadedFileRefs
    // Note: Backend will format dates based on target locale when rendering
    const templateVariables = getTemplateVariables(parsedData, uploadedFileRefs)
    
    const previewText = templateContent.html || templateContent.text || ''
    const filledContent = replaceTemplateVariables(previewText, templateVariables)
    
    // ✅ Use Backend Preview API for consistent rendering (same as Platform Preview)
    // This ensures Markdown is rendered the same way everywhere
    // ✅ Follow app theme: Preview uses dark mode if app is in dark mode
    try {
      // Create temporary content object for preview
      const previewContentObj = templateContent.html 
        ? { bodyText: filledContent } // HTML template
        : { text: filledContent }      // Markdown/text template
      
      // ✅ No darkMode parameter needed - Frontend sets CSS Variables based on theme
      const previewUrl = getApiUrl(`platforms/${platform}/preview?mode=desktop&locale=${previewLocale}`)
      
      const response = await fetch(previewUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: previewContentObj })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to render preview: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (!data.success || !data.html) {
        throw new Error(data.error || 'Failed to render preview')
      }
      
      // ✅ Backend liefert Content-HTML + CSS
      // PreviewFrame hostet es und themed es
      setPreviewContent(data.html)
      setPreviewCss(data.css || null)
    } catch (error) {
      console.error('Failed to render template preview:', error)
      // Show error - no fallback
      setPreviewContent(`<div style="padding: 20px; color: red;">
        <strong>Error rendering preview:</strong><br/>
        ${error.message || 'Failed to load preview from backend'}
      </div>`)
    }
  }, [theme.palette.mode, platform, targetsValue, parsedData, uploadedFileRefs, schema, i18n]) // ✅ Include theme.palette.mode directly (more specific)

  const handleTemplateSelect = async (template) => {
    setSelectedTemplate(template)
    handleClose()
    await loadPreview(template)
    setPreviewOpen(true)
  }

  // ✅ Reload preview when theme changes (if modal is open)
  // Note: We only reload if modal is open and template is selected
  // This ensures preview follows app theme changes
  useEffect(() => {
    if (previewOpen && selectedTemplate) {
      loadPreview(selectedTemplate)
    }
  }, [theme.palette.mode, previewOpen, selectedTemplate, loadPreview]) // ✅ Include loadPreview in dependencies

  // Check if platform has targets block in editor schema
  const targetsBlock = editorBlocks.find(block => block.type === 'targets')

  const handleApplyTemplate = () => {
    if (selectedTemplate && onSelectTemplate) {
      // Pass template, variables, targets, and specific files to parent
      onSelectTemplate(selectedTemplate, null, targetsValue, specificFiles.map(f => f.id))
    }
    setPreviewOpen(false)
    setSelectedTemplate(null)
    setTargetsValue(null)
    setSpecificFiles([])
  }

  // Handle specific file toggle
  const handleToggleSpecificFile = (file) => {
    const isSelected = specificFiles.some(f => f.id === file.id);
    if (isSelected) {
      setSpecificFiles(specificFiles.filter(f => f.id !== file.id));
    } else {
      if (specificFiles.length >= 10) return;
      setSpecificFiles([...specificFiles, { id: file.id, filename: file.filename }]);
    }
  };

  // Helper: Is file standard (global)?
  const isGlobalFile = (fileId) => {
    // globalFiles is an array of IDs or objects depending on how it's stored
    return globalFiles.some(gf => (typeof gf === 'string' ? gf === fileId : gf.id === fileId));
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'general'
    if (!acc[category]) acc[category] = []
    acc[category].push(template)
    return acc
  }, {})

  const open = Boolean(anchorEl)

  return (
    <>
      <Box sx={sx}>
        <Button
          variant="outlined"
          onClick={handleClick}
          endIcon={<ArrowDownIcon />}
          disabled={loading || templates.length === 0}
          sx={{
            minWidth: 200,
            justifyContent: 'space-between',
            textTransform: 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TemplateIcon fontSize="small" />
            <span>
              {t('template.count', { count: templates.length })}
            </span>
          </Box>
        </Button>

        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
            {t('template.errorLoading')}
          </Typography>
        )}

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: { minWidth: 300, maxWidth: 400 }
          }}
        >
          {Object.keys(groupedTemplates).length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {t('template.noTemplatesAvailable')}
              </Typography>
            </MenuItem>
          ) : (
            Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
              // Get translated category name from categories array
              const categoryInfo = categories?.find(cat => cat.id === category)
              const categoryName = categoryInfo?.name || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
              
              return [
                <Box key={`header-${category}`} sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2">
                    {categoryName}
                  </Typography>
                </Box>,
                ...categoryTemplates.map((template) => (
                <MenuItem
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {template.name}
                    </Typography>
                    {template.isDefault && (
                      <Chip label={t('template.default')} size="small" color="primary" variant="outlined" sx={{ ml: 1, fontSize: '0.7rem' }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
                    {t('template.variablesUsed')} {template.variables.join(', ')}
                  </Typography>
                </MenuItem>
              )),
              Object.keys(groupedTemplates).length > 1 && <Divider key={`divider-${category}`} />
            ]
            })
          )}
        </Menu>
      </Box>

      {/* Template Preview Dialog - Hybrid Layout: Split (Desktop) / Tabs (Mobile) */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle>
          {t('template.applyTemplateTitle', { name: selectedTemplate?.name })}
        </DialogTitle>
        
        <DialogContent 
          sx={{ 
            flex: 1, 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            p: 0
          }}
        >
          {/* Mobile: Tabs Layout */}
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Tabs 
                value={mobileTab} 
                onChange={(e, newValue) => setMobileTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label={t('template.configuration')} />
                <Tab label={t('template.preview')} />
              </Tabs>
              
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {mobileTab === 0 ? (
                  // Config Tab Content
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {t('template.applyWarning')}
                    </Alert>

                    {selectedTemplate && (
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            {t('template.variablesUsed')}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {selectedTemplate.variables.map(variable => (
                              <Chip
                                key={variable}
                                label={`{${variable}}`}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    )}

                    {targetsBlock && (
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {t(targetsBlock.label) || t('template.targets')}
                          </Typography>
                          {targetsBlock.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {t(targetsBlock.description)}
                            </Typography>
                          )}
                          <CompositeRenderer
                            block={targetsBlock}
                            value={targetsValue}
                            onChange={setTargetsValue}
                            platform={platform}
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* ✅ GENERIC: File Selection Block (if schema defines it) */}
                    {fileSelectionBlock && (
                      <Card>
                        <CardContent sx={{ p: 0 }}>
                          <Accordion 
                            expanded={attachmentsExpanded} 
                            onChange={(e, expanded) => setAttachmentsExpanded(expanded)}
                            sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                          >
                            <AccordionSummary 
                              expandIcon={<ExpandMoreIcon />}
                              sx={{ 
                                px: 2, 
                                py: 1,
                                borderBottom: attachmentsExpanded ? 1 : 0,
                                borderColor: 'divider'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <AttachFileIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {t(`platform.${platformId}.attachments.forRun`, { defaultValue: fileSelectionBlock.label || 'Attachments for this run' })}
                                </Typography>
                                <Box sx={{ ml: 'auto', mr: 1 }}>
                                  <Chip 
                                    label={`${specificFiles.length + globalFiles.length}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 2, pb: 2 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {t(`platform.${platformId}.attachments.description`, { defaultValue: fileSelectionBlock.description || 'Select additional attachments for this group. Standard attachments are already preset.' })}
                              </Typography>

                              <List 
                                dense 
                                sx={{ 
                                  bgcolor: 'background.default', 
                                  borderRadius: 1, 
                                  border: '1px solid', 
                                  borderColor: 'divider',
                                  maxHeight: 300,
                                  overflow: 'auto'
                                }}
                              >
                                {uploadedFileRefs.map((file) => {
                                  const isStandard = isGlobalFile(file.id);
                                  const isSelected = specificFiles.some(f => f.id === file.id);
                                  const isDisabled = isStandard;

                                  return (
                                    <MenuItem 
                                      key={file.id} 
                                      onClick={() => !isDisabled && handleToggleSpecificFile(file)}
                                      disabled={isDisabled}
                                      sx={{ opacity: isDisabled ? 0.7 : 1 }}
                                    >
                                      <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Checkbox
                                          edge="start"
                                          checked={isStandard || isSelected}
                                          disabled={isDisabled}
                                          tabIndex={-1}
                                          disableRipple
                                        />
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary={file.filename}
                                        secondary={isStandard ? t('editor.standardFilesGlobal') : file.type}
                                        primaryTypographyProps={{ 
                                          variant: 'body2', 
                                          fontWeight: (isStandard || isSelected) ? 'bold' : 'normal' 
                                        }}
                                      />
                                      {file.visibility === 'public' ? (
                                        <Tooltip title={t(`platform.${platformId}.fileVisibility.public`, { defaultValue: 'Public' })}>
                                          <PublicIcon fontSize="small" color="success" sx={{ opacity: 0.6 }} />
                                        </Tooltip>
                                      ) : (
                                        <Tooltip title={t(`platform.${platformId}.fileVisibility.internal`, { defaultValue: 'Internal' })}>
                                          <LockIcon fontSize="small" color="action" sx={{ opacity: 0.6 }} />
                                        </Tooltip>
                                      )}
                                    </MenuItem>
                                  );
                                })}
                              </List>
                              
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {t(`platform.${platformId}.attachments.total`, { 
                                    count: specificFiles.length + globalFiles.length,
                                    defaultValue: `Total for this group: ${specificFiles.length + globalFiles.length} attachments`
                                  })}
                                </Typography>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                ) : (
                  // Preview Tab Content
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('template.preview')}:
                    </Typography>
                    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                      {previewContent ? (
                        <PreviewFrame
                          document={{
                            html: previewContent,
                            css: previewCss,
                            meta: {
                              title: t('template.preview')
                            }
                          }}
                          dimensions={{ width: 600, height: 800 }}
                        />
                      ) : null}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            // Desktop: Split Layout (40/60)
            <Grid container sx={{ height: '100%' }}>
              {/* Left: Form Section (40%) */}
              <Grid 
                item 
                xs={12} 
                md={5} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflow: 'hidden',
                  p: 2,
                  borderRight: { md: 1 },
                  borderColor: 'divider',
                  height: '100%'
                }}
              >
                <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t('template.applyWarning')}
                </Alert>

                {selectedTemplate && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('template.variablesUsed')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedTemplate.variables.map(variable => (
                          <Chip
                            key={variable}
                            label={`{${variable}}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {targetsBlock && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {t(targetsBlock.label) || t('template.targets')}
                      </Typography>
                      {targetsBlock.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {t(targetsBlock.description)}
                        </Typography>
                      )}
                      <CompositeRenderer
                        block={targetsBlock}
                        value={targetsValue}
                        onChange={setTargetsValue}
                        platform={platform}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* ✅ GENERIC: File Selection Block (if schema defines it) - Desktop Version */}
                {fileSelectionBlock && (
                  <Card>
                    <CardContent sx={{ p: 0 }}>
                      <Accordion 
                        expanded={attachmentsExpanded} 
                        onChange={(e, expanded) => setAttachmentsExpanded(expanded)}
                        sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                      >
                        <AccordionSummary 
                          expandIcon={<ExpandMoreIcon />}
                          sx={{ 
                            px: 2, 
                            py: 1,
                            borderBottom: attachmentsExpanded ? 1 : 0,
                            borderColor: 'divider'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <AttachFileIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {t(`platform.${platformId}.attachments.forRun`, { defaultValue: fileSelectionBlock.label || 'Attachments for this run' })}
                            </Typography>
                            <Box sx={{ ml: 'auto', mr: 1 }}>
                              <Chip 
                                label={`${specificFiles.length + globalFiles.length}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 2, pb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {t(`platform.${platformId}.attachments.description`, { defaultValue: fileSelectionBlock.description || 'Select additional attachments for this group. Standard attachments are already preset.' })}
                          </Typography>

                          <List 
                            dense 
                            sx={{ 
                              bgcolor: 'background.default', 
                              borderRadius: 1, 
                              border: '1px solid', 
                              borderColor: 'divider',
                              maxHeight: 300,
                              overflow: 'auto'
                            }}
                          >
                            {uploadedFileRefs.map((file) => {
                              const isStandard = isGlobalFile(file.id);
                              const isSelected = specificFiles.some(f => f.id === file.id);
                              const isDisabled = isStandard;

                              return (
                                <MenuItem 
                                  key={file.id} 
                                  onClick={() => !isDisabled && handleToggleSpecificFile(file)}
                                  disabled={isDisabled}
                                  sx={{ opacity: isDisabled ? 0.7 : 1 }}
                                >
                                  <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Checkbox
                                      edge="start"
                                      checked={isStandard || isSelected}
                                      disabled={isDisabled}
                                      tabIndex={-1}
                                      disableRipple
                                    />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={file.filename}
                                    secondary={isStandard ? t('editor.standardFilesGlobal') : file.type}
                                    primaryTypographyProps={{ 
                                      variant: 'body2', 
                                      fontWeight: (isStandard || isSelected) ? 'bold' : 'normal' 
                                    }}
                                  />
                                  {file.visibility === 'public' ? (
                                    <Tooltip title={t(`platform.${platformId}.fileVisibility.public`, { defaultValue: 'Public' })}>
                                      <PublicIcon fontSize="small" color="success" sx={{ opacity: 0.6 }} />
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title={t(`platform.${platformId}.fileVisibility.internal`, { defaultValue: 'Internal' })}>
                                      <LockIcon fontSize="small" color="action" sx={{ opacity: 0.6 }} />
                                    </Tooltip>
                                  )}
                                </MenuItem>
                              );
                            })}
                          </List>
                          
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t(`platform.${platformId}.attachments.total`, { 
                                count: specificFiles.length + globalFiles.length,
                                defaultValue: `Total for this group: ${specificFiles.length + globalFiles.length} attachments`
                              })}
                            </Typography>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                )}
                </Box>
              </Grid>

              {/* Right: Preview Section (60%) */}
              <Grid 
                item 
                xs={12} 
                md={7} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflow: 'hidden',
                  p: 2
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {t('template.preview')}:
                </Typography>
                <Box sx={{ 
                  flex: 1, 
                  minHeight: 0,  // Critical for flex scrolling
                  overflow: 'auto'
                }}>
                  {previewContent ? (
                    <PreviewFrame
                      document={{
                        html: previewContent,
                        css: previewCss,
                        meta: {
                          title: t('template.preview')
                        }
                      }}
                      dimensions={{ width: 600, height: 800 }}
                    />
                  ) : null}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setPreviewOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleApplyTemplate}
            variant="contained"
            startIcon={<CheckIcon />}
          >
            {t('template.applyTemplate')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TemplateSelector
