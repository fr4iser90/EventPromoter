/**
 * VariableToolbar - Toolbar für Variablen
 * 
 * Zeigt verfügbare Variablen aus Schema an und erlaubt Einfügen
 * 
 * @module features/templates/components/VisualBuilder/VariableToolbar
 */

import React from 'react'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { TemplateVariable } from '../../types'

/**
 * VariableToolbar Komponente
 * 
 * @param {Object} props
 * @param {Array} props.variables - Verfügbare Variablen aus Schema
 * @param {Function} props.onInsertVariable - Callback wenn Variable eingefügt wird
 */
function VariableToolbar({
  variables = [],
  onInsertVariable
}: {
  variables?: TemplateVariable[]
  onInsertVariable: (name: string) => void
}) {
  const { t } = useTranslation()

  if (variables.length === 0) {
    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {t('template.noVariables')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
        {t('template.variables')}
      </Typography>
      {variables.map((variable: TemplateVariable) => {
        const label = variable.label
          ? t(variable.label, { defaultValue: variable.label })
          : variable.name
        const desc = variable.description
          ? t(variable.description, { defaultValue: variable.description })
          : undefined
        const tooltipTitle = desc ? (
          <Box component="span" sx={{ display: 'block' }}>
            <strong>{label}</strong>
            {desc && (
              <>
                <br />
                <span style={{ fontWeight: 'normal', opacity: 0.95 }}>{desc}</span>
              </>
            )}
          </Box>
        ) : label
        return (
          <Tooltip key={variable.name} title={tooltipTitle} arrow placement="top">
            <Button
              size="small"
              variant="outlined"
              onClick={() => onInsertVariable(variable.name)}
              sx={{
                minWidth: 'auto',
                px: 1,
                py: 0.5,
                fontSize: '0.75rem',
                textTransform: 'none'
              }}
            >
              {`{${variable.name}}`}
            </Button>
          </Tooltip>
        )
      })}
    </Box>
  )
}

export default VariableToolbar
