// Merge all attachment items into one item
// Combines all binary data from multiple items into a single item
// Binary data will be named: data, data_1, data_2, etc. (n8n default behavior)
// Also replaces image URLs in HTML with CID references
// All items have the same email metadata, so we use the first item's metadata

const items = $input.all();

if (items.length === 0) {
  return [];
}

// Use first item's email metadata (all items have the same metadata)
const firstItem = items[0];
const emailMetadata = firstItem.json.email || {};
let html = emailMetadata.html || '';

// Collect all binary data from all items and build filename mapping
// n8n automatically names them: data, data_1, data_2, etc. when merged
const combinedBinary = {};
const filenames = new Set(); // Track all filenames for CID replacement

items.forEach((item, index) => {
  if (item.binary && item.binary.data) {
    const binaryKey = index === 0 ? 'data' : `data_${index}`;
    combinedBinary[binaryKey] = item.binary.data;
    
    // Get filename from attachment data
    const attachmentFilename = item.json.filename || 
                               (item.binary.data.fileName || 
                                item.binary.data.name || 
                                `attachment_${index}`);
    
    if (attachmentFilename) {
      filenames.add(attachmentFilename);
    }
  }
});

// Replace image URLs in HTML with CID references
// Strategy: Extract filename from URL and replace with cid:filename
// This works even if URLs differ (localhost vs IP address)
filenames.forEach(filename => {
  // Extract base filename (without path/query params)
  const baseFilename = filename.split('/').pop().split('?')[0];
  
  // Match any URL containing this filename (works with localhost, IP, etc.)
  // Pattern: <img src=".../filename.jpg" ...>
  // Replace with: <img src="cid:filename.jpg" ...>
  const regex = new RegExp(
    `(<img[^>]+src=["'])([^"']*${baseFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*)(["'][^>]*>)`,
    'gi'
  );
  
  html = html.replace(regex, `$1cid:${baseFilename}$3`);
});

// Update email metadata with modified HTML
const updatedEmailMetadata = {
  ...emailMetadata,
  html: html
};

// Create attachments array for Email Send Node
// n8n Email Send Node can use binaryProperty OR attachments array
// We provide both: binary data AND attachments array with binary property names
const attachmentKeys = Object.keys(combinedBinary).filter(k => k.startsWith('data'));
const attachmentsArray = attachmentKeys.map(key => {
  const binary = combinedBinary[key];
  return {
    binaryProperty: key,
    fileName: binary.fileName || binary.name || `attachment_${key}`
  };
});

// Return single item with all binaries, updated HTML, and attachments array
return [{
  json: {
    email: updatedEmailMetadata,
    // Provide attachments array for Email Send Node
    _attachments: attachmentsArray
  },
  binary: combinedBinary
}];
