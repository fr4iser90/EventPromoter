import React, { useState, useEffect } from 'react';
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
        // Fetch the form schema
        const schemaResponse = await fetch(`/api/platforms/${platformId}/schemas/${schemaId}`);
        if (!schemaResponse.ok) {
          throw new Error(`Failed to fetch schema: ${schemaResponse.statusText}`);
        }
        const schemaData = await schemaResponse.json();
        if (!schemaData.success) {
          throw new Error(schemaData.error || 'Unknown error fetching schema');
        }
        setSchema(schemaData.schema);

        // If itemId and dataEndpoint are provided, fetch existing data
        if (itemId && dataEndpoint) {
          const dataResponse = await fetch(dataEndpoint.replace(':id', itemId));
          if (!dataResponse.ok) {
            throw new Error(`Failed to fetch data: ${dataResponse.statusText}`);
          }
          const itemData = await dataResponse.json();
          if (!itemData.success) {
            throw new Error(itemData.error || 'Unknown error fetching data');
          }
          setFormData(itemData.target || itemData.group || {}); // Assuming 'target' or 'group' key
        } else {
          setFormData({}); // For new items, start with empty form data
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

  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(saveEndpoint.replace(':id', itemId), {
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
            schema={schema}
            formData={formData}
            onFormChange={handleFormChange}
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