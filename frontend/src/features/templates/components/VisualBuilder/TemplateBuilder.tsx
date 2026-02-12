/**
 * TemplateBuilder - Visueller Template-Builder (GENERISCH)
 * 
 * Schema-basierter visueller Editor für Templates.
 * Block-Typen werden aus schema.template.defaultStructure abgeleitet.
 * 
 * @module features/templates/components/VisualBuilder/TemplateBuilder
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import {
  Add as AddIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import VariableToolbar from './VariableToolbar'
import LivePreview from './LivePreview'
import BlockPalette from './BlockPalette'
import SortableBlockItem from './SortableBlockItem'
import DropZone from './DropZone'
import { schemaToBlocks, blocksToSchemaFormat } from '../utils/schemaConverter'
import type { BuilderSchema, BuilderTemplate, TemplateBlock, TemplateFieldSchema as TemplateField } from '../../types'

/**
 * TemplateBuilder Hauptkomponente
 * 
 * @param {Object} props
 * @param {string} props.platform - Platform-ID
 * @param {Object} props.template - Bestehendes Template (optional)
 * @param {Object} props.schema - Platform Schema (aus usePlatformSchema)
 * @param {Function} props.onChange - Callback wenn Template sich ändert
 * @param {Function} props.onSave - Callback zum Speichern
 */

function TemplateBuilder({
  platform,
  template,
  schema,
  onChange
}: {
  platform: string
  template?: BuilderTemplate | null
  schema?: BuilderSchema | null
  onChange?: (templateData: Record<string, unknown>) => void
  onSave?: () => void
}) {
  const { t } = useTranslation()
  const [blocks, setBlocks] = useState<TemplateBlock[]>([])
  const [selectedBlock, setSelectedBlock] = useState<TemplateBlock | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showPalette, setShowPalette] = useState(true)

  // Drag-and-Drop Sensoren
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Konvertiere Template zu Blöcken wenn Schema geladen ist
  useEffect(() => {
    if (schema?.template?.defaultStructure && template?.template) {
      const initialBlocks = schemaToBlocks(template.template, schema as any) as TemplateBlock[]
      setBlocks(initialBlocks)
    } else if (schema?.template?.defaultStructure) {
      // Neues Template - erstelle Blöcke aus Schema
      const initialBlocks = schemaToBlocks({}, schema as any) as TemplateBlock[]
      setBlocks(initialBlocks)
    }
  }, [schema, template])

  // Benachrichtige Parent über Änderungen
  useEffect(() => {
    if (blocks.length > 0 && schema?.template?.defaultStructure) {
      const templateData = blocksToSchemaFormat(blocks, schema as any)
      // Behalte auch nicht-visuelle Felder (z.B. subject) aus dem ursprünglichen Template
      if (template?.template) {
        Object.entries(template.template).forEach(([key, value]) => {
          const fieldSchema = (schema.template!.defaultStructure as Record<string, TemplateField>)[key]
          // Nur nicht-visuelle Felder behalten
          if (fieldSchema && fieldSchema.type !== 'html' && fieldSchema.type !== 'rich') {
            templateData[key] = typeof value === 'string' ? value : String(value ?? '')
          }
        })
      }
      onChange && onChange(templateData)
    }
  }, [blocks, schema, onChange, template])

  // Block hinzufügen (für erweiterte Features - aktuell nicht verwendet)
  const handleAddBlock = useCallback((fieldName: string) => {
    const fieldSchema = (schema?.template?.defaultStructure as Record<string, TemplateField>)[fieldName]
    if (!fieldSchema) return

    const newBlock = {
      id: `block-${fieldName}-${Date.now()}`,
      fieldName,
      fieldType: fieldSchema.type || 'text',
      position: blocks.length,
      data: {
        value: fieldSchema.default || ''
      }
    }

    setBlocks((prev) => [...prev, newBlock])
  }, [blocks, schema])

  // Block entfernen
  const handleRemoveBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId))
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null)
    }
  }, [selectedBlock])

  // Block aktualisieren
  const handleUpdateBlock = useCallback((blockId: string, data: Record<string, unknown>) => {
    setBlocks((prev) => prev.map((block) =>
      block.id === blockId ? { ...block, data: { ...block.data, ...data } } : block
    ))
  }, [])

  // Block nach oben verschieben
  const handleMoveUp = useCallback((blockId: string) => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === blockId)
      if (index <= 0) return prev
      const newBlocks = [...prev]
      ;[newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]]
      return newBlocks.map((block, i) => ({ ...block, position: i }))
    })
  }, [])

  // Block nach unten verschieben
  const handleMoveDown = useCallback((blockId: string) => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === blockId)
      if (index >= prev.length - 1) return prev
      const newBlocks = [...prev]
      ;[newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]]
      return newBlocks.map((block, i) => ({ ...block, position: i }))
    })
  }, [])

  // Drag-and-Drop Handler
  const handleDragEnd = useCallback((event: { active: { id: string | number; data: { current?: { fieldName?: string; fieldSchema?: TemplateField } } }; over: { id: string | number } | null }) => {
    const { active, over } = event

    if (!over) return

    // Block von Palette zum Editor
    if (active.id.toString().startsWith('palette-')) {
      const fieldName = active.data.current?.fieldName
      const fieldSchema = active.data.current?.fieldSchema

      if (fieldName && fieldSchema) {
        const newBlock = {
          id: `block-${fieldName}-${Date.now()}`,
          fieldName,
          fieldType: fieldSchema.type || 'text',
          position: blocks.length,
          data: {
            value: fieldSchema.default || ''
          }
        }
        setBlocks((prev) => [...prev, newBlock])
      }
      return
    }

    // Block-Reihenfolge ändern
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(block => block.id === active.id)
      const newIndex = blocks.findIndex(block => block.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = arrayMove(blocks, oldIndex, newIndex)
          .map((block, index) => ({ ...block, position: index }))
        setBlocks(newBlocks)
      }
    }
  }, [blocks])

  // Variable in Block einfügen
  const handleInsertVariable = useCallback((blockId: string, variable: string) => {
    const block = blocks.find((b) => b.id === blockId)
    if (!block) return

    const currentValue = block.data.value || ''
    const newValue = currentValue + `{${variable}}`
    handleUpdateBlock(blockId, { value: newValue })
  }, [blocks, handleUpdateBlock])

  if (!schema?.template?.defaultStructure) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          {t('template.noSchemaAvailable')}
        </Typography>
      </Box>
    )
  }

  // Filtere nur Felder mit type: 'html' oder 'rich' für visuellen Builder
  const visualFields = Object.entries(schema.template.defaultStructure)
    .filter(([_, field]) => field.type === 'html' || field.type === 'rich')
    .map(([fieldName]) => fieldName)

  // Wenn keine visuellen Felder vorhanden, zeige normalen Editor
  if (visualFields.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          {t('template.noVisualFields')}
        </Typography>
      </Box>
    )
  }

  // Filtere Blöcke für visuelle Felder
  const visualBlocks = blocks.filter((block) => visualFields.includes(block.fieldName))
  const variables = schema.template.variables || []

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Toolbar */}
        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'center' }}>
          <VariableToolbar
            variables={variables}
            onInsertVariable={(variable: string) => {
              if (selectedBlock) {
                handleInsertVariable(selectedBlock.id, variable)
              }
            }}
          />
          <Box sx={{ flex: 1 }} />
          <Tooltip title={t('template.togglePalette')}>
            <IconButton
              size="small"
              onClick={() => setShowPalette(!showPalette)}
              color={showPalette ? 'primary' : 'default'}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('template.togglePreview')}>
            <IconButton
              size="small"
              onClick={() => setShowPreview(!showPreview)}
              color={showPreview ? 'primary' : 'default'}
            >
              <PreviewIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Block Palette */}
          {showPalette && (
            <Box sx={{ width: '250px', borderRight: 1, borderColor: 'divider', overflow: 'hidden' }}>
              <BlockPalette
                schema={schema}
                existingBlocks={visualBlocks}
              />
            </Box>
          )}

          {/* Editor Area */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <DropZone>
              {visualBlocks.length === 0 ? null : (
                <SortableContext
                  items={visualBlocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {visualBlocks
                      .sort((a, b) => a.position - b.position)
                      .map((block) => {
                        const fieldSchema = (schema.template!.defaultStructure as Record<string, TemplateField>)[block.fieldName]
                        return (
                          <SortableBlockItem
                            key={block.id}
                            block={block}
                            fieldSchema={fieldSchema}
                            schema={schema}
                            isSelected={selectedBlock?.id === block.id}
                            onSelect={() => setSelectedBlock(block)}
                            onUpdate={(data) => handleUpdateBlock(block.id, data)}
                            onInsertVariable={(variable) => handleInsertVariable(block.id, variable)}
                            onMoveUp={() => handleMoveUp(block.id)}
                            onMoveDown={() => handleMoveDown(block.id)}
                            onRemove={() => handleRemoveBlock(block.id)}
                            canMoveUp={visualBlocks.findIndex(b => b.id === block.id) > 0}
                            canMoveDown={visualBlocks.findIndex(b => b.id === block.id) < visualBlocks.length - 1}
                          />
                        )
                      })}
                  </Box>
                </SortableContext>
              )}
            </DropZone>
          </Box>

          {/* Preview Panel */}
          {showPreview && (
            <Box sx={{ width: '400px', borderLeft: 1, borderColor: 'divider', overflow: 'hidden' }}>
              <LivePreview
                platform={platform}
                blocks={visualBlocks}
                schema={schema}
              />
            </Box>
          )}
        </Box>
      </Box>
    </DndContext>
  )
}

export default TemplateBuilder
