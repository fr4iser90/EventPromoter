import React from 'react'
import { Paper } from '@mui/material'

function SectionPanel({ children, sx = {} }) {
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
