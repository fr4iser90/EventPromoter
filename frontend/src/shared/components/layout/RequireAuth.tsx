import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { getApiUrl } from '../../utils/api'

function RequireAuth() {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const checkAuth = async () => {
      try {
        const response = await fetch(getApiUrl('auth/me'), { credentials: 'include' })
        if (isCancelled) return
        setAuthenticated(response.ok)
      } catch {
        if (!isCancelled) setAuthenticated(false)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    checkAuth()
    return () => {
      isCancelled = true
    }
  }, [])

  if (loading) {
    return (
      <Box sx={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default RequireAuth
