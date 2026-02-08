import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { getApiUrl } from '../../shared/utils/api';
import { resolveSchemaEndpoint } from '../../shared/utils/urlUtils';
import SchemaRenderer from '../../features/schema/components/Renderer.jsx';

const EditModal = ({
  open,
  onClose,
  platformId,
  schemaId,
  itemId,
  dataEndpoint,
  saveEndpoint,
  method = 'PUT',
  onSaveSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schema, setSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [fieldOptions, setFieldOptions] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchSchemaAndData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the form schema with itemId as query param for resolution
        const schemaUrl = getApiUrl(`platforms/${platformId}/schemas/${schemaId}${itemId ? `?id=${itemId}` : ''}`);
        const schemaResponse = await fetch(schemaUrl);
        if (!schemaResponse.ok) {
          throw new Error(`Failed to fetch schema: ${schemaResponse.statusText}`);
        }
        const schemaData = await schemaResponse.json();
        console.log('EditModal: Fetched schemaData', schemaData);
        if (!schemaData.success) {
          throw new Error(schemaData.error || 'Unknown error fetching schema');
        }
        console.log('EditModal: Setting schema state with', schemaData.schema);
        const loadedSchema = schemaData.schema;
        setSchema(loadedSchema);

        // Load options for fields with optionsSource
        const optionsMap = {};
        for (const field of loadedSchema.fields || []) {
          if (field.optionsSource) {
            try {
              const endpoint = field.optionsSource.endpoint.replace(':platformId', platformId);
              const url = getApiUrl(endpoint);
              
              const response = await fetch(url, {
                method: field.optionsSource.method || 'GET',
              });
              
              if (!response.ok) {
                throw new Error(`Failed to load options: ${response.statusText}`);
              }
              
              const responseData = await response.json();
              
              // Extract data from response using responsePath
              let extractedData = responseData;
              if (field.optionsSource.responsePath) {
                const paths = field.optionsSource.responsePath.split('.');
                for (const path of paths) {
                  extractedData = extractedData?.[path];
                }
              }
              
              // Transform to options format
              let transformedOptions = [];
              
              if (Array.isArray(extractedData)) {
                // If labelPath and valuePath are specified, transform the data
                if (field.optionsSource.labelPath && field.optionsSource.valuePath) {
                  transformedOptions = extractedData.map(item => ({
                    label: item[field.optionsSource.labelPath],
                    value: item[field.optionsSource.valuePath]
                  }));
                } else {
                  // Assume already in {label, value} format
                  transformedOptions = extractedData;
                }
              } else if (responseData.options && Array.isArray(responseData.options)) {
                // Fallback: check for 'options' key
                transformedOptions = responseData.options;
              }
              
              optionsMap[field.name] = transformedOptions;
            } catch (err) {
              console.error(`Failed to load options for field ${field.name}:`, err);
              optionsMap[field.name] = []; // Set empty array on error
            }
          }
        }
        setFieldOptions(optionsMap);

        // If itemId and endpoint are provided in the schema, fetch existing data
        if (itemId && loadedSchema.endpoint) {
          const url = getApiUrl(loadedSchema.endpoint);
          console.log('EditModal: Fetching data from resolved URL:', url);
          const dataResponse = await fetch(url);
          if (!dataResponse.ok) {
            throw new Error(`Failed to fetch data: ${dataResponse.statusText}`);
          }
          const itemData = await dataResponse.json();
          if (!itemData.success) {
            throw new Error(itemData.error || 'Unknown error fetching data');
          }
          console.log("EditModal: Fetched itemData:", itemData); // Debugging log
          setFormData(itemData.target || itemData.group || {}); // Assuming 'target' or 'group' key
          console.log("EditModal: formData set with initial data:", itemData.target || itemData.group || {}); // Debugging log
        } else {
          setFormData({}); // For new items, start with empty form data
          console.log("EditModal: formData initialized to empty."); // Debugging log
        }
      } catch (err) {
        console.error('Error fetching schema or data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemaAndData();
  }, [open, platformId, schemaId, itemId, dataEndpoint]);

  const handleFormChange = useCallback((fieldName, value) => {
    setFormData(prevFormData => {
      const updatedFormData = { ...prevFormData, [fieldName]: value };
      console.log(`EditModal: handleFormChange - Field: ${fieldName}, Value: ${value}, Updated formData:`, updatedFormData); // Debugging log
      return updatedFormData;
    });
  }, []);
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use endpoint from the loaded (and backend-resolved) schema
      const url = getApiUrl(schema.endpoint);
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save data: ${response.statusText}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Unknown error saving data');
      }

      onSaveSuccess && onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemId || !schema) return;

    setLoading(true);
    setError(null);
    try {
      // Find delete action to get the endpoint
      const deleteAction = schema.actions?.find(action => action.type === 'delete');
      if (!deleteAction || !deleteAction.endpoint) {
        throw new Error('Delete endpoint not found in schema');
      }

      // Resolve endpoint with platformId and id
      let deleteEndpoint = deleteAction.endpoint
        .replace(':platformId', platformId)
        .replace(':id', itemId);

      const url = getApiUrl(deleteEndpoint);
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete: ${response.statusText}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Unknown error deleting item');
      }

      setDeleteDialogOpen(false);
      onSaveSuccess && onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.message);
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{schema ? schema.title : 'Loading...'}</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Typography color="error">Error: {error}</Typography>
        )}
        {!loading && !error && schema && (
          <SchemaRenderer
            fields={schema.fields.map(field => {
              // Merge options from fieldOptions into field
              if (fieldOptions[field.name]) {
                return { ...field, options: fieldOptions[field.name] };
              }
              return field;
            })}
            groups={schema.groups || []} // Pass groups if available
            values={formData}
            onChange={handleFormChange}
            platformId={platformId}
          />
        )}
        {!loading && !error && !schema && (
          <Typography>No schema found or loaded.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        {schema && schema.actions && schema.actions.map((action) => {
          // Only show delete button if itemId exists (editing existing item, not creating new)
          if (action.type === 'delete' && !itemId) {
            return null;
          }

          let onClickHandler;
          if (action.type === 'submit') {
            onClickHandler = handleSubmit;
          } else if (action.type === 'delete') {
            onClickHandler = handleDelete;
          } else {
            onClickHandler = onClose;
          }

          return (
            <Button
              key={action.id}
              onClick={onClickHandler}
              color={action.ui?.color || 'primary'}
              variant={action.ui?.variant || 'text'}
              disabled={loading}
            >
              {action.label}
            </Button>
          );
        })}
      </DialogActions>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete {schema?.title?.replace('Edit ', '') || 'Item'}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this item? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default EditModal;