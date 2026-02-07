// Filter attachments based on group rules
// Supports multiple groups with different attachment rules
// Also extracts images from HTML and adds them as attachments
const item = $input.item;
const email = item.json.email || {};
const group = email.group || email.recipients?.[0] || 'default';
const allAttachments = email.attachments || [];

// Define attachment rules per group
// 'all' = all attachments, [1,4,6] = specific attachment IDs/indices
const attachmentRules = {
  'vip': [1, 4, 6],
  'test': 'all',
  'pa.boe': [1]
};

const rule = attachmentRules[group];
let filteredAttachments = [];

if (rule === 'all') {
  // Include all attachments
  filteredAttachments = allAttachments;
} else if (Array.isArray(rule)) {
  // Filter by attachment IDs or indices
  filteredAttachments = allAttachments.filter((att, index) => {
    // Support both explicit IDs and index-based (1-based)
    const attId = att.id || (index + 1);
    return rule.includes(attId) || rule.includes(index + 1);
  });
} else {
  // No rule found, use all attachments as fallback
  filteredAttachments = allAttachments;
}

// Extract images from HTML and add them as attachments
// Images need to be downloaded and embedded as CID attachments
const html = email.html || '';
const imageUrls = [];
const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
let match;

while ((match = imageRegex.exec(html)) !== null) {
  const imageUrl = match[1];
  // Only add if it's a URL (not already a CID reference)
  if (imageUrl && !imageUrl.startsWith('cid:') && !imageUrl.startsWith('data:')) {
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
    
    // Check if image is already in attachments
    const isAlreadyAttached = filteredAttachments.some(att => 
      att.url === imageUrl || att.filename === filename
    );
    
    if (!isAlreadyAttached) {
      imageUrls.push({
        url: imageUrl,
        filename: filename,
        contentType: filename.match(/\.(jpg|jpeg)$/i) ? 'image/jpeg' : 
                     filename.match(/\.png$/i) ? 'image/png' : 
                     filename.match(/\.gif$/i) ? 'image/gif' : 'image/jpeg',
        _isImage: true // Flag to identify images for CID replacement
      });
    }
  }
}

// Combine filtered attachments with extracted images
const allAttachmentsWithImages = [...filteredAttachments, ...imageUrls];

// No need to embed metadata anymore - Loop node will preserve it
const attachmentsWithMetadata = allAttachmentsWithImages;

// Return item with filtered attachments (each containing email metadata)
return [{
  json: {
    ...item.json,
    email: {
      ...email,
      attachments: attachmentsWithMetadata,
      group: group
    }
  },
  binary: item.binary || {}
}];
