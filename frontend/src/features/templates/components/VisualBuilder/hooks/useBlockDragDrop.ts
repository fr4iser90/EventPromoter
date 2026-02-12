/**
 * useBlockDragDrop Hook
 * 
 * Hook für Drag-and-Drop Funktionalität mit @dnd-kit
 * 
 * @module features/templates/components/VisualBuilder/hooks/useBlockDragDrop
 */

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DragBlock } from '../../../types'

/**
 * Hook für Drag-and-Drop
 * 
 * @param {Array} blocks - Block-Array
 * @param {Function} onBlocksChange - Callback wenn Blöcke sich ändern
 * @returns {Object} DndContext props und SortableContext props
 */
export function useBlockDragDrop(
  blocks: DragBlock[],
  onBlocksChange: (blocks: DragBlock[]) => void
) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(block => block.id === active.id)
      const newIndex = blocks.findIndex(block => block.id === over.id)

      const newBlocks = arrayMove(blocks, oldIndex, newIndex)
        .map((block, index) => ({ ...block, position: index }))

      onBlocksChange(newBlocks)
    }
  }

  return {
    sensors,
    handleDragEnd,
    DndContext,
    SortableContext,
    strategy: verticalListSortingStrategy,
  }
}

/**
 * Hook für sortierbare Block-Items
 * 
 * @param {string} id - Block-ID
 * @returns {Object} Sortable props
 */
export function useSortableBlock(id: string) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return {
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging,
  }
}
