import React from 'react'
import { Box } from '@mui/material'

function PageToolbar({ children, sx = {} }) {
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
