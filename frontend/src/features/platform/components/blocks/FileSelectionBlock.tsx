import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Alert,
  Divider
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import type { FileSelectionBlockProps, FileSelectionFileRef as FileRef } from '../../types'

function FileSelectionBlock({ block, content, onChange, uploadedFileRefs }: FileSelectionBlockProps) {
  const { t } = useTranslation();

  // Extrahiere Einstellungen aus dem Block-Schema
  const { id: fileSelectionKey, settings } = block;
  const {
    enableToggle = { label: 'editor.includeAttachments', default: false },
    selectionLimit = { max: Infinity, message: 'editor.maxFilesReached' },
    fileFilter = { allowedMimeTypes: [], allowedExtensions: [], noFilesMessage: 'editor.noCompatibleFiles' }
  } = settings || {};

  const [isFileInclusionEnabled, setIsFileInclusionEnabled] = useState(enableToggle?.default || false);

  // Filtert alle verfügbaren hochgeladenen Dateien basierend auf den Schema-Regeln
  const compatibleFiles = useMemo(() => {
    if (!uploadedFileRefs) return [];
    return uploadedFileRefs.filter((file: FileRef) => {
      const fileExtension = file.filename.split('.').pop()?.toLowerCase();
      const isAllowedMimeType = !fileFilter?.allowedMimeTypes || fileFilter.allowedMimeTypes.length === 0 || (file.type && fileFilter.allowedMimeTypes.includes(file.type));
      const isAllowedExtension = !fileFilter?.allowedExtensions || fileFilter.allowedExtensions.length === 0 || (fileExtension && fileFilter.allowedExtensions.includes(fileExtension));

      return isAllowedMimeType && isAllowedExtension;
    });
  }, [uploadedFileRefs, fileFilter, fileSelectionKey]);

  // Handler für den Umschalter "Anhänge mitschicken"
  const handleFileInclusionToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setIsFileInclusionEnabled(isChecked);
    if (!isChecked) {
      // Wenn deaktiviert, Auswahl im Content löschen
      onChange(fileSelectionKey, []);
    }
  };

  // Hilfsfunktion: Ist eine Datei ausgewählt?
  const isFileSelected = (fileId: string) => {
    if (!content || !content[fileSelectionKey]) return false;
    return (content[fileSelectionKey] as FileRef[]).some((f: FileRef) => f.id === fileId);
  };

  // Handler für Checkbox-Klick (Toggle Auswahl pro Datei)
  const handleToggleFileSelection = (file: FileRef) => {
    const currentSelected = (content?.[fileSelectionKey] as FileRef[]) || [];
    const isSelected = currentSelected.some((f: FileRef) => f.id === file.id);

    let newSelected: FileRef[];
    if (isSelected) {
      newSelected = currentSelected.filter((f: FileRef) => f.id !== file.id);
    } else {
      if (currentSelected.length >= (selectionLimit?.max || Infinity)) return;
      newSelected = [...currentSelected, { id: file.id, filename: file.filename, type: file.type }];
    }

    onChange(fileSelectionKey, newSelected);
  };

  // Initialisierung des Toggles: Falls bereits Dateien im Content sind, Toggle auf true
  useEffect(() => {
    if (content && content[fileSelectionKey] && Array.isArray(content[fileSelectionKey]) && content[fileSelectionKey].length > 0) {
      setIsFileInclusionEnabled(true);
    }
  }, [content, fileSelectionKey]);

  // Helfer für Icons
  const getFileIcon = (file: FileRef) => {
    const type = file.type || '';
    if (type.startsWith('image/')) return <ImageIcon fontSize="small" />;
    if (type === 'application/pdf') return <PictureAsPdfIcon fontSize="small" />;
    return <InsertDriveFileIcon fontSize="small" />;
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, borderLeft: '4px solid', borderColor: isFileInclusionEnabled ? 'primary.main' : 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <AttachFileIcon sx={{ mr: 1, color: isFileInclusionEnabled ? 'primary.main' : 'text.disabled' }} />
        <Typography variant="h6" sx={{ color: isFileInclusionEnabled ? 'text.primary' : 'text.secondary' }}>
          {t(block.label || 'Anhänge')}
        </Typography>
      </Box>
      
      <Tooltip title={t(block.description || '')} placement="right">
        <FormControlLabel
          control={
            <Checkbox
              checked={isFileInclusionEnabled}
              onChange={handleFileInclusionToggle}
              name="fileInclusionToggle"
              color="primary"
            />
          }
          label={<strong>{t(enableToggle?.label || 'Anhänge mitschicken')}</strong>}
        />
      </Tooltip>

      {isFileInclusionEnabled && (
        <Box sx={{ mt: 1, ml: 4 }}>
          {compatibleFiles.length > 0 ? (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                {t('editor.selectFilesToAttach')}
              </Typography>
              <List dense sx={{ 
                width: '100%', 
                bgcolor: 'background.paper', 
                borderRadius: 1, 
                border: '1px solid', 
                borderColor: 'divider',
                maxHeight: 300,
                overflowY: 'auto'
              }}>
                {compatibleFiles.map((file: FileRef, index: number) => (
                  <React.Fragment key={file.id}>
                    <ListItem
                      onClick={() => handleToggleFileSelection(file)}
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        cursor: 'pointer',
                        opacity: !isFileSelected(file.id) && ((content?.[fileSelectionKey] as FileRef[])?.length >= (selectionLimit?.max || Infinity)) ? 0.5 : 1,
                        borderRadius: 1,
                        mb: 0.5
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Checkbox
                          edge="start"
                          checked={isFileSelected(file.id)}
                          tabIndex={-1}
                          disableRipple
                          disabled={!isFileSelected(file.id) && ((content?.[fileSelectionKey] as FileRef[])?.length >= (selectionLimit?.max || Infinity))}
                        />
                      </ListItemIcon>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getFileIcon(file)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.filename} 
                        secondary={file.type}
                        primaryTypographyProps={{ 
                          variant: 'body2', 
                          fontWeight: isFileSelected(file.id) ? 'bold' : 'normal',
                          sx: { 
                            wordBreak: 'break-all',
                            lineHeight: 1.2
                          }
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          sx: { opacity: 0.7 }
                        }}
                      />
                    </ListItem>
                    {index < compatibleFiles.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
              
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color={(content?.[fileSelectionKey] as FileRef[])?.length >= (selectionLimit?.max || Infinity) ? 'error' : 'text.secondary'}>
                  {t('editor.selected')} {(content?.[fileSelectionKey] as FileRef[])?.length || 0} / {selectionLimit?.max || '∞'}
                </Typography>
              </Box>

              {selectionLimit?.max && (content?.[fileSelectionKey] as FileRef[])?.length >= selectionLimit.max && (
                <Alert severity="info" sx={{ mt: 1, py: 0 }}>
                  <Typography variant="caption">{t(selectionLimit.message)}</Typography>
                </Alert>
              )}
            </>
          ) : (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {t(fileFilter?.noFilesMessage || 'editor.noCompatibleFiles')}
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
}

export default FileSelectionBlock;
