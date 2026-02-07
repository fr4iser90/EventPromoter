/**
 * BlockPalette - Block-Palette Komponente
 * 
 * Zeigt verfügbare Block-Typen aus Schema an
 * Unterstützt Drag-and-Drop zum Hinzufügen von Blöcken
 * 
 * @module features/templates/components/VisualBuilder/BlockPalette
 */

import React from 'react'
import { Box, Paper, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  TextFields as TextIcon,
  Code as CodeIcon,
  Image as ImageIcon,
} from '@mui/icons-material'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

/**
 * Draggable Block Item
 */
function DraggableBlockItem({ fieldName, fieldSchema, icon }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${fieldName}`,
    data: {
      type: 'block',
      fieldName,
      fieldSchema,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      disablePadding
      sx={{
        mb: 0.5,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <ListItemButton
        {...listeners}
        {...attributes}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={fieldSchema.label}
          secondary={fieldSchema.description}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </ListItemButton>
    </ListItem>
  )
}

/**
 * BlockPalette Komponente
 * 
 * @param {Object} props
 * @param {Object} props.schema - Platform Schema
 * @param {Array} props.existingBlocks - Bereits vorhandene Blöcke (um zu verhindern, dass gleiche Blöcke mehrfach hinzugefügt werden)
 */
function BlockPalette({ schema, existingBlocks = [] }) {
  const { t } = useTranslation()

  if (!schema?.template?.defaultStructure) {
    return null
  }

  // Filtere nur visuelle Felder (html, rich)
  const visualFields = Object.entries(schema.template.defaultStructure)
    .filter(([fieldName, field]) => {
      // Nur visuelle Felder
      if (field.type !== 'html' && field.type !== 'rich') return false
      // Nur Felder, die noch nicht als Block vorhanden sind
      return !existingBlocks.some(block => block.fieldName === fieldName)
    })

  if (visualFields.length === 0) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('template.blockPalette', { defaultValue: 'Block Palette' })}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('template.allBlocksAdded', { defaultValue: 'All available blocks have been added' })}
        </Typography>
      </Paper>
    )
  }

  const getIcon = (fieldType) => {
    switch (fieldType) {
      case 'html':
      case 'rich':
        return <CodeIcon fontSize="small" />
      case 'text':
      case 'textarea':
        return <TextIcon fontSize="small" />
      case 'image':
        return <ImageIcon fontSize="small" />
      default:
        return <TextIcon fontSize="small" />
    }
  }

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
        {t('template.blockPalette', { defaultValue: 'Block Palette' })}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        {t('template.dragToAdd', { defaultValue: 'Drag blocks to add them' })}
      </Typography>
      <List dense sx={{ flex: 1, overflow: 'auto' }}>
        {visualFields.map(([fieldName, fieldSchema]) => (
          <DraggableBlockItem
            key={fieldName}
            fieldName={fieldName}
            fieldSchema={fieldSchema}
            icon={getIcon(fieldSchema.type)}
          />
        ))}
      </List>
    </Paper>
  )
}

export default BlockPalette
