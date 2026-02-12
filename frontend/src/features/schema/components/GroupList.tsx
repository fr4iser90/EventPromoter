import { useState, useEffect } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Link,
  Dialog, // Keep Dialog for Delete Confirmation
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { getApiUrl } from '../../../shared/utils/api'
import axios from 'axios'
import EditModal from '../../../shared/components/EditModal'
import type { DataRow, FieldAction, GroupListProps, Primitive, SchemaField } from '../types'

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message
  return fallback
}

function GroupList({ data, platformId, title, description, fields, onUpdate }: GroupListProps) {
  const [groups, setGroups] = useState<DataRow[]>([])
  const [filteredGroups, setFilteredGroups] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentEditItem, setCurrentEditItem] = useState<DataRow | null>(null)
  const [currentAction, setCurrentAction] = useState<FieldAction | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState<DataRow | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (data && Array.isArray(data.groups)) {
      setGroups(data.groups);
      setFilteredGroups(data.groups);
      setLoading(false);
    } else if (data && data.groups) { // Handle case where groups is an object
      const groupsArray = Object.values(data.groups);
      setGroups(groupsArray);
      setFilteredGroups(groupsArray);
      setLoading(false);
    } else if (data === null) {
      setLoading(false);
      setGroups([]);
      setFilteredGroups([]);
    } else if (!data) {
      setLoading(true);
    }
  }, [data]);

  useEffect(() => {
    const results = groups.filter((group) =>
      Object.values(group).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredGroups(results);
  }, [searchTerm, groups]);

  const handleEdit = (item: DataRow, action?: FieldAction) => {
    if (!action) return
    setCurrentEditItem(item);
    setCurrentAction(action);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setCurrentEditItem(null);
    setCurrentAction(null);
  };

  const handleSaveSuccess = () => {
    onUpdate && onUpdate(); // Trigger a reload of groups in the parent component
  };

  const confirmDelete = async () => {
    if (!selectedForDelete || !platformId) return

    try {
      const endpoint = `platforms/${platformId}/target-groups/${selectedForDelete.id ?? ''}`
      const url = getApiUrl(endpoint)

      await axios.delete(url)

      onUpdate && onUpdate(); // Trigger a reload of groups
      setDeleteDialogOpen(false)
      setSelectedForDelete(null)
    } catch (err: unknown) {
      console.error('Failed to delete group:', err)
      setErrorState(getErrorMessage(err, 'Failed to delete group'))
    }
  }

  const renderField = (field: SchemaField) => {
    switch (field.type) {
      case 'target-list': // Changed from 'list' to 'target-list'
        if (field.ui?.renderAsTable) {
          const columns = field.ui.tableColumns || [];
          return (
            <TableContainer component={Paper} elevation={1} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.id} style={{ width: column.width || 'auto' }}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : filteredGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No groups available. Add a new group.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGroups.map((row, rowIndex) => (
                      <TableRow key={row.id ?? `row-${rowIndex}`}>
                        {columns.map((column) => {
                          let displayValue = row[column.id]
                          
                          // Format memberCount
                          if (column.id === 'memberCount') {
                            displayValue = `${row[column.id]} members`
                          }
                          // Format memberValues array as comma-separated string (generic)
                          else if (column.id === 'memberValues') {
                            const memberValues = row[column.id]
                            if (Array.isArray(memberValues)) {
                              displayValue = memberValues.filter((v: Primitive) => v != null && v !== '').join(', ') || 'No members'
                            }
                          }
                          // Handle undefined/null values
                          else if (displayValue === undefined || displayValue === null) {
                            displayValue = ''
                          }
                          
                          return (
                            <TableCell key={column.id}>
                              {column.clickable && row[column.id] !== undefined && column.action ? (
                                <Link
                                  component="button"
                                  variant="body2"
                                  onClick={() => handleEdit(row, column.action)}
                                >
                                  {displayValue}
                                </Link>
                              ) : (
                                displayValue
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          );
        }
        return null; // Should not happen for table fields
      default:
        return null;
    }
  };

  const groupsOverviewField = fields.find((f) => f.id === 'groupsOverview');

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      {description && <Typography variant="body2" color="textSecondary" gutterBottom>{description}</Typography>}

      {groupsOverviewField && renderField(groupsOverviewField)}

      {editModalOpen && currentEditItem && currentAction && (
        <EditModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          platformId={platformId ?? ''}
          schemaId={currentAction.schemaId ?? ''}
          itemId={currentEditItem.id}
          dataEndpoint={currentAction.dataEndpoint ?? ''}
          saveEndpoint={currentAction.saveEndpoint ?? ''}
          method={currentAction.method ?? 'GET'}
          onSaveSuccess={handleSaveSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedForDelete ? selectedForDelete.name : ''}</strong>?
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
    </Box>
  )
}

export default GroupList;