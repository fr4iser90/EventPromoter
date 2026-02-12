/**
 * LivePreview - Live-Preview Komponente
 * 
 * Nutzt PlatformPreview für generische Preview
 * 
 * @module features/templates/components/VisualBuilder/LivePreview
 */

import React, { useMemo } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { PlatformPreview } from '../../../platform'
import { blocksToSchemaFormat } from '../utils/schemaConverter'
import type { LivePreviewBlock, LivePreviewSchema } from '../../types'

/**
 * LivePreview Komponente
 * 
 * @param {Object} props
 * @param {string} props.platform - Platform-ID
 * @param {Array} props.blocks - Block-Array
 * @param {Object} props.schema - Platform Schema
 */
function LivePreview({
  platform,
  blocks,
  schema
}: {
  platform: string
  blocks: LivePreviewBlock[]
  schema?: LivePreviewSchema | null
}) {
  const { t } = useTranslation()

  // Konvertiere Blöcke zu Schema-Format für Preview
  const previewContent = useMemo(() => {
    const defaultStructure = schema?.template?.defaultStructure
    if (!blocks || blocks.length === 0 || !defaultStructure) {
      return {}
    }

    // Konvertiere nur visuelle Blöcke
    const visualBlocks = blocks.filter((block: LivePreviewBlock) => {
      const fieldSchema = defaultStructure[block.fieldName]
      return fieldSchema && (fieldSchema.type === 'html' || fieldSchema.type === 'rich')
    })

    return blocksToSchemaFormat(visualBlocks, schema)
  }, [blocks, schema])

  if (!platform) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          {t('template.noPlatform')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
          {t('template.preview')}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <PlatformPreview
          platform={platform}
          content={previewContent}
          isActive={true}
        />
      </Box>
    </Box>
  )
}

export default LivePreview
