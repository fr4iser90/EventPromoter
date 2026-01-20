/**
 * Target List Component
 * 
 * Displays a list of targets (recipients, subreddits, etc.) with CRUD operations.
 * Used by the target-list field type in panel schemas.
 * 
 * @module components/SchemaRenderer/TargetList
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { getApiUrl } from '../../../shared/utils/api'
import axios from 'axios'

/**
 * Target List Component
 * 
 * @param {Object} props
 * @param {Object} props.field - Field definition from schema
 * @param {Array} props.value - Selected target IDs (for multiselect)
 * @param {Function} props.onChange - Callback when selection changes
 * @param {String} props.platformId - Platform ID (from context or prop)
 */
function TargetList({ field, value = [], onChange, platformId, error }) {
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [selectedForDelete, setSelectedForDelete] = useState(null)

  // Load targets from API
  useEffect(() => {
    if (!field.optionsSource || !platformId) return

    const loadTargets = async () => {
      try {
        setLoading(true)
        setErrorState(null)

        const endpoint = field.optionsSource.endpoint.replace(':platformId', platformId)
        const url = getApiUrl(endpoint)

        const response = await axios({
          method: field.optionsSource.method || 'GET',
          url
        })

        // Extract targets from response
        let targetsData = []
        if (field.optionsSource.responsePath) {
          const paths = field.optionsSource.responsePath.split('.')
          let data = response.data
          for (const path of paths) {
            data = data?.[path]
          }
          targetsData = Array.isArray(data) ? data : []
        } else if (response.data?.targets && Array.isArray(response.data.targets)) {
          targetsData = response.data.targets
        } else if (Array.isArray(response.data)) {
          targetsData = response.data
        }

        setTargets(targetsData)
      } catch (err) {
        console.error('Failed to load targets:', err)
        setErrorState(err.message || 'Failed to load targets')
      } finally {
        setLoading(false)
      }
    }

    loadTargets()
  }, [field.optionsSource, platformId])

  // Handle edit
  const handleEdit = (target) => {
    setSelectedTarget(target)
    setEditDialogOpen(true)
  }

  // Handle delete
  const handleDelete = (target) => {
    setSelectedForDelete(target)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedForDelete || !platformId) return

    try {
      const endpoint = `platforms/${platformId}/targets/${selectedForDelete.id}`
      const url = getApiUrl(endpoint)

      await axios.delete(url)

      // Reload targets
      const targetsResponse = await axios.get(
        getApiUrl(field.optionsSource.endpoint.replace(':platformId', platformId))
      )
      let targetsData = []
      if (field.optionsSource.responsePath) {
        const paths = field.optionsSource.responsePath.split('.')
        let data = targetsResponse.data
        for (const path of paths) {
          data = data?.[path]
        }
        targetsData = Array.isArray(data) ? data : []
      } else if (targetsResponse.data?.targets) {
        targetsData = targetsResponse.data.targets
      }
      setTargets(targetsData)

      setDeleteDialogOpen(false)
      setSelectedForDelete(null)
    } catch (err) {
      console.error('Failed to delete target:', err)
      setErrorState(err.message || 'Failed to delete target')
    }
  }

  // Get base field name (e.g., 'email', 'subreddit')
  const getBaseField = (target) => {
    // Try common field names
    if (target.email) return target.email
    if (target.subreddit) return `r/${target.subreddit}`
    if (target.username) return `@${target.username}`
    if (target.profileUrl) return target.profileUrl
    if (target.pageId) return target.pageId
    // Fallback to first property that's not metadata
    const keys = Object.keys(target).filter(k => !['id', 'metadata', 'createdAt', 'updatedAt'].includes(k))
    return target[keys[0]] || target.id
  }

  // Get display name
  const getDisplayName = (target) => {
    if (target.name) return target.name
    if (target.displayName) return target.displayName
    if (target.pageName) return target.pageName
    if (target.groupName) return target.groupName
    return null
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (errorState) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {errorState}
      </Alert>
    )
  }

  if (targets.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No targets available. Add a new target using the form below.
      </Alert>
    )
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Target</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {targets.map((target) => {
              const baseValue = getBaseField(target)
              const displayName = getDisplayName(target)

              return (
                <TableRow key={target.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {baseValue}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {displayName ? (
                      <Typography variant="body2" color="text.secondary">
                        {displayName}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(target)}
                      aria-label="edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(target)}
                      aria-label="delete"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog - Placeholder for now */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Target</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            Edit functionality will be implemented in the edit-target section.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Target</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedForDelete ? getBaseField(selectedForDelete) : ''}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TargetList
