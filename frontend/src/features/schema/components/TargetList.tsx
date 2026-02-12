import { useCallback, useEffect, useState } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import EditModal from '../../../shared/components/EditModal';
import { getApiUrl } from '../../../shared/utils/api';
import axios from 'axios';
import type { DataRow, FieldAction, TargetListProps } from '../types'

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message
  return fallback
}

const TargetList = ({ field, platformId, onUpdate, allFields, values = {} }: TargetListProps) => {
  const [targets, setTargets] = useState<DataRow[]>([]);
  const [filteredTargets, setFilteredTargets] = useState<DataRow[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<DataRow | null>(null);
  const [currentAction, setCurrentAction] = useState<FieldAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Schema-driven: Find the search field for this specific list
  const searchField = allFields?.find((f) => f.ui?.isFilterFor === field.name);
  
  // Get search term from values (rendered by SchemaRenderer)
  const searchTerm = searchField ? (values[searchField.name] || '') : '';

  const fetchData = useCallback(async () => {
    if (!field.optionsSource || !platformId) {
      if (field.options) {
        setTargets(field.options);
        setFilteredTargets(field.options);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const url = getApiUrl(field.optionsSource.endpoint);
      const response = await axios.get(url);
      
      const data = response.data[field.optionsSource.responsePath] as DataRow[] | undefined;
      
      setTargets(data ?? []);
      setFilteredTargets(data ?? []);
    } catch (err: unknown) {
      console.error('Failed to fetch targets:', err);
      setError(getErrorMessage(err, 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [field.options, field.optionsSource, platformId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const results = targets.filter((target) =>
      Object.values(target).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredTargets(results);
  }, [searchTerm, targets]);

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
    fetchData();
    onUpdate && onUpdate();
  };

  const renderTable = () => {
    if (!field.ui?.renderAsTable) return null;
    
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
                  fontWeight: 'bold',
                  bgcolor: 'action.hover'
                }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ p: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ p: 2 }}>
                  <Alert severity="error">{error}</Alert>
                </TableCell>
              </TableRow>
            ) : filteredTargets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ p: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    No items found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTargets.map((row, rowIndex) => (
                <TableRow key={row.id ?? `row-${rowIndex}`} hover>
                  {columns.map((column) => (
                    <TableCell key={column.id} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                      {column.clickable && row[column.id] ? (
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleEdit(row, column.action)}
                          sx={{ textAlign: 'left' }}
                        >
                          {String(row[column.id] ?? '')}
                        </Link>
                      ) : (
                        String(row[column.id] ?? '')
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
  };

  return (
    <Box sx={{ mb: 4 }}>
      {renderTable()}

      {editModalOpen && currentAction && (
        <EditModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          platformId={platformId ?? ''}
          schemaId={currentAction.schemaId ?? ''}
          itemId={currentEditItem?.id}
          dataEndpoint={currentAction.dataEndpoint ?? ''}
          saveEndpoint={currentAction.saveEndpoint ?? ''}
          method={currentAction.method ?? 'GET'}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </Box>
  );
};

export default TargetList;