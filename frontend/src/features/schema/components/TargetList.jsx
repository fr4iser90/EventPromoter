import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Link,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import EditModal from '../../../shared/components/EditModal.jsx'; // Import the generic EditModal

const TargetList = ({ field, platformId, onUpdate, allFields }) => {
  const [targets, setTargets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const searchField = allFields?.find(f => f.name === 'recipientSearch');
  const newRecipientButton = allFields?.find(f => f.name === 'newRecipientButton');
  const targetsField = field; // Das 'field'-Prop ist das target-list-Feld

  useEffect(() => {
    if (field.options) {
      setTargets(field.options);
      setFilteredTargets(field.options);
      setLoading(false);
    } else {
      setLoading(false);
      setTargets([]);
      setFilteredTargets([]);
    }
  }, [field.options]);

  useEffect(() => {
    const results = targets.filter(target =>
      Object.values(target).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredTargets(results);
  }, [searchTerm, targets]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (item, action) => {
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
    onUpdate && onUpdate(); // Trigger a reload of targets in the parent component
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'target-list': // Added target-list type
        if (field.ui?.renderAsTable) {
          const columns = field.ui.tableColumns || [];
          return (
            <TableContainer component={Paper} sx={{
              mt: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[1],
            }}>
              <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.id} sx={{
                        width: column.width || 'auto',
                        border: `1px solid ${theme.palette.divider}`,
                      }}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ border: `1px solid ${theme.palette.divider}` }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : filteredTargets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ border: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="body2" color="textSecondary">
                          No recipients available. Add a new recipient.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTargets.map((row) => (
                      <TableRow key={row.id}>
                        {columns.map((column) => (
                          <TableCell key={column.id} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                            {column.clickable && row[column.id] ? (
                              <Link
                                component="button"
                                variant="body2"
                                onClick={() => handleEdit(row, column.action)}
                              >
                                {row[column.id]}
                              </Link>
                            ) : (
                              row[column.id]
                            )}
                          </TableCell>
                        ))}
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>{field.label}</Typography>
      {field.description && <Typography variant="body2" color="textSecondary" gutterBottom>{field.description}</Typography>}

      <Box display="flex" alignItems="center" mb={2}>
        {searchField && (
          <TextField
            label={searchField.label}
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, mr: 1 }}
            placeholder={searchField.label}
          />
        )}
        {newRecipientButton && (
          <Button
            variant={newRecipientButton.ui?.variant || 'contained'}
            color={newRecipientButton.ui?.color || 'primary'}
            onClick={() => handleEdit({}, newRecipientButton.action)}
          >
            {newRecipientButton.label}
          </Button>
        )}
      </Box>

      {targetsField && renderField(targetsField)}

      {editModalOpen && currentEditItem && currentAction && (
        <EditModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          platformId={platformId}
          schemaId={currentAction.schemaId}
          itemId={currentEditItem.id}
          dataEndpoint={currentAction.dataEndpoint}
          saveEndpoint={currentAction.saveEndpoint}
          method={currentAction.method}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </Box>
  );
};

export default TargetList;