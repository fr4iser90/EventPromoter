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
            fields={schema.fields} // Correctly pass the fields array
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
        {schema && schema.actions && schema.actions.map((action) => (
          <Button
            key={action.id}
            onClick={action.type === 'submit' ? handleSubmit : onClose}
            color={action.ui?.color || 'primary'}
            variant={action.ui?.variant || 'text'}
            disabled={loading}
          >
            {action.label}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default EditModal;