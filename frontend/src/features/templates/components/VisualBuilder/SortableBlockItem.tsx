/**
 * SortableBlockItem - Sortierbarer Block-Item
 * 
 * Wrapper für Block mit Drag-and-Drop Funktionalität
 * 
 * @module features/templates/components/VisualBuilder/SortableBlockItem
 */

import React from 'react'
import { Paper, Box, IconButton, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import BlockRenderer from './blocks/BlockRenderer'
import type { SortableBlockItemProps } from '../../types'

/**
 * SortableBlockItem Komponente
 */
function SortableBlockItem({
  block,
  fieldSchema,
  schema,
  isSelected,
  onSelect,
  onUpdate,
  onInsertVariable,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
}: SortableBlockItemProps) {
  const { t } = useTranslation()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        p: 2,
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        cursor: isDragging ? 'grabbing' : 'pointer',
        position: 'relative',
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
        '&:hover': {
          borderColor: 'primary.main',
          borderWidth: 2
        }
      }}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <Box
        {...attributes}
        {...listeners}
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 20,
          height: 20,
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:active': {
            cursor: 'grabbing'
          },
          '&::before': {
            content: '""',
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            boxShadow: `
              0 6px 0 currentColor,
              0 12px 0 currentColor,
              6px 0 0 currentColor,
              6px 6px 0 currentColor,
              6px 12px 0 currentColor
            `,
            opacity: 0.5
          }
        }}
      />

      {/* Block Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mb: 1 }}>
        <Tooltip title={t('common.moveUp')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp()
            }}
            disabled={!canMoveUp}
          >
            <ArrowUpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.moveDown')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown()
            }}
            disabled={!canMoveDown}
          >
            <ArrowDownIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.delete')}>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Block Content */}
      <BlockRenderer
        block={block}
        fieldSchema={fieldSchema}
        schema={schema}
        isSelected={isSelected}
        onUpdate={onUpdate}
        onInsertVariable={onInsertVariable}
      />
    </Paper>
  )
}

export default SortableBlockItem
