/**
 * DropZone - Drop-Zone für Blöcke
 * 
 * Zeigt Drop-Zone an wenn keine Blöcke vorhanden sind
 * 
 * @module features/templates/components/VisualBuilder/DropZone
 */

import React from 'react'
import { Paper, Typography, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'

/**
 * DropZone Komponente
 */
function DropZone({ children }: { children?: ReactNode }) {
  const { t } = useTranslation()
  const { setNodeRef, isOver } = useDroppable({
    id: 'editor-drop-zone',
  })

  if (children) {
    return (
      <Box ref={setNodeRef}>
        {children}
      </Box>
    )
  }

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        p: 3,
        textAlign: 'center',
        border: 2,
        borderStyle: 'dashed',
        borderColor: isOver ? 'primary.main' : 'divider',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isOver ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s ease',
      }}
    >
      <Typography color={isOver ? 'primary.main' : 'text.secondary'}>
        {isOver
          ? t('template.dropHere')
          : t('template.dragBlocksHere')
        }
      </Typography>
    </Paper>
  )
}

export default DropZone
