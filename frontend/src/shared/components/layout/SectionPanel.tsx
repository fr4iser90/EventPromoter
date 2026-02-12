import React from 'react'
import { Paper } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'
import type { ReactNode } from 'react'

type SectionPanelProps = {
  children: ReactNode
  sx?: SxProps<Theme>
}

function SectionPanel({ children, sx = {} }: SectionPanelProps) {
  return (
    <Paper
      sx={{
        p: 2,
        ...sx,
      }}
    >
      {children}
    </Paper>
  )
}

export default SectionPanel
