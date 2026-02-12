import React from 'react'
import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'
import type { ReactNode } from 'react'

type PageToolbarProps = {
  children: ReactNode
  sx?: SxProps<Theme>
}

function PageToolbar({ children, sx = {} }: PageToolbarProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

export default PageToolbar
