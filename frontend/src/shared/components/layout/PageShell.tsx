import React from 'react'
import { Box } from '@mui/material'
import Header from '../Header'
import { LAYOUT } from '../../../app/theme'
import type { SxProps, Theme } from '@mui/material'
import type { ReactNode } from 'react'

type PageShellProps = {
  title?: string
  headerProps?: Record<string, unknown>
  children: ReactNode
  contentSx?: SxProps<Theme>
}

function PageShell({ title, headerProps = {}, children, contentSx = {} }: PageShellProps) {
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
