import React from 'react'
import { Box } from '@mui/material'
import Header from '../Header'
import { LAYOUT } from '../../../app/theme'

function PageShell({ title, headerProps = {}, children, contentSx = {} }) {
  return (
    <>
      <Header title={title} {...headerProps} />
      <Box
        sx={{
          minHeight: `calc(100vh - ${LAYOUT.headerHeight}px)`,
          width: '100%',
          ...contentSx,
        }}
      >
        {children}
      </Box>
    </>
  )
}

export default PageShell
