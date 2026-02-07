/**
 * Auto-layout configuration
 * Based on manually adjusted positions from n8n workflow
 */
const LAYOUT_CONFIG = {
  // Grid spacing
  nodeSpacing: { x: 300, y: 200 },
  stickySpacing: { x: 560, y: 740 },
  
  // Column positions (X coordinates) - based on actual positions
  columns: {
    webhook: 13360,
    check: 14160,
    post: 14460,
    emailPrepare: 14760,
    emailCheckAttachments: 15060,
    emailSave: 15360,
    emailFilter: 15660,
    emailLoop: 15960,
    emailDownload: 16560,
    emailMerge: 16860,
    emailSend: 17160,
    emailSendNoAttachments: 15360,
    structureResponse: 17460,
    webhookResponse: 17760
  },
  
  // Row positions (Y coordinates) for platforms - based on actual positions
  rows: {
    twitter: 4880,
    instagram: 5080,
    facebook: 5280,
    linkedin: 5480,
    email: 5680,
    emailFlow: 5880,  // For email processing nodes
    reddit: 6080
  },
  
  // Sticky notes positions - based on actual positions
  stickyNotes: {
    left: { x: 12920, yStart: 3820 },
    right: { x: 16580, yStart: 4220 },
    overview: [14240, 3820]
  }
};

/**
 * Categorize node and determine its position
 * @param {object} node - Node definition
 * @param {object} connections - Connections object
 * @returns {Array|null} [x, y] position or null if should use manual position
 */
function calculateNodePosition(node, connections) {
  const nodeId = node.id;
  const nodeName = node.name || '';
  
  // If autoLayout is explicitly disabled for this node, use manual position
  if (node.autoLayout === false && node.position) {
    return node.position;
  }
  
  // Core nodes
  if (nodeId === 'webhook-trigger') {
    return [LAYOUT_CONFIG.columns.webhook, LAYOUT_CONFIG.rows.instagram];
  }
  
  if (nodeId === 'structure-response') {
    return [LAYOUT_CONFIG.columns.structureResponse, LAYOUT_CONFIG.rows.instagram];
  }
  
  if (nodeId === 'webhook-response') {
    return [LAYOUT_CONFIG.columns.webhookResponse, LAYOUT_CONFIG.rows.instagram];
  }
  
  // Platform check nodes
  if (nodeId.includes('twitter-check') || nodeName.includes('Twitter Content')) {
    return [LAYOUT_CONFIG.columns.check, LAYOUT_CONFIG.rows.twitter];
  }
  if (nodeId.includes('instagram-check') || nodeName.includes('Instagram Content')) {
    return [LAYOUT_CONFIG.columns.check, LAYOUT_CONFIG.rows.instagram];
  }
  if (nodeId.includes('facebook-check') || nodeName.includes('Facebook Content')) {
    return [LAYOUT_CONFIG.columns.check, LAYOUT_CONFIG.rows.facebook];
  }
  if (nodeId.includes('linkedin-check') || nodeName.includes('LinkedIn Content')) {
    return [LAYOUT_CONFIG.columns.check, LAYOUT_CONFIG.rows.linkedin];
  }
  if (nodeId.includes('reddit-check') || nodeName.includes('Reddit Content')) {
    return [LAYOUT_CONFIG.columns.check, LAYOUT_CONFIG.rows.reddit];
  }
  if ((nodeId.includes('email-check') && !nodeId.includes('attachments')) || (nodeName.includes('Email Content') && !nodeName.includes('Attachments'))) {
    return [LAYOUT_CONFIG.columns.check, LAYOUT_CONFIG.rows.email];
  }
  
  // Platform post nodes
  if (nodeId.includes('twitter-post') || (nodeName.includes('Twitter') && nodeName.includes('Post'))) {
    return [LAYOUT_CONFIG.columns.post, LAYOUT_CONFIG.rows.twitter];
  }
  if (nodeId.includes('instagram-post') || (nodeName.includes('Instagram') && nodeName.includes('Post'))) {
    return [LAYOUT_CONFIG.columns.post, LAYOUT_CONFIG.rows.instagram];
  }
  if (nodeId.includes('facebook-post') || (nodeName.includes('Facebook') && nodeName.includes('Post'))) {
    return [LAYOUT_CONFIG.columns.post, LAYOUT_CONFIG.rows.facebook];
  }
  if (nodeId.includes('linkedin-post') || (nodeName.includes('LinkedIn') && nodeName.includes('Post'))) {
    return [LAYOUT_CONFIG.columns.post, LAYOUT_CONFIG.rows.linkedin];
  }
  if (nodeId.includes('reddit-post') || (nodeName.includes('Reddit') && nodeName.includes('Post'))) {
    return [LAYOUT_CONFIG.columns.post, LAYOUT_CONFIG.rows.reddit];
  }
  
  // Email processing nodes (order matters - more specific first)
  if (nodeId.includes('email-send-no-attachments') || (nodeName.includes('Send Email') && nodeName.includes('No Attachments'))) {
    return [LAYOUT_CONFIG.columns.emailSendNoAttachments, 5940];
  }
  if ((nodeId.includes('email-send') && !nodeId.includes('no-attachments')) || (nodeName.includes('Send Email') && !nodeName.includes('No Attachments'))) {
    return [LAYOUT_CONFIG.columns.emailSend, LAYOUT_CONFIG.rows.emailFlow];
  }
  if (nodeId.includes('email-merge') && nodeName.includes('Merge Attachments')) {
    return [LAYOUT_CONFIG.columns.emailMerge, LAYOUT_CONFIG.rows.emailFlow];
  }
  if (nodeId.includes('email-download') || nodeName.includes('Download Attachment')) {
    return [LAYOUT_CONFIG.columns.emailDownload, LAYOUT_CONFIG.rows.emailFlow];
  }
  if (nodeId.includes('email-loop') || nodeName.includes('Loop Attachments')) {
    return [LAYOUT_CONFIG.columns.emailLoop, LAYOUT_CONFIG.rows.emailFlow];
  }
  if (nodeId.includes('email-filter') || nodeName.includes('Filter Attachments per Group')) {
    return [LAYOUT_CONFIG.columns.emailFilter, LAYOUT_CONFIG.rows.emailFlow];
  }
  if (nodeId.includes('email-save') || nodeName.includes('Save Email Data')) {
    return [LAYOUT_CONFIG.columns.emailSave, LAYOUT_CONFIG.rows.emailFlow];
  }
  if (nodeId.includes('email-check-attachments') || (nodeName.includes('Has Attachments') && nodeName.includes('📎'))) {
    return [LAYOUT_CONFIG.columns.emailCheckAttachments, LAYOUT_CONFIG.rows.email];
  }
  if (nodeId.includes('email-prepare') || nodeName.includes('Prepare Email')) {
    return [LAYOUT_CONFIG.columns.emailPrepare, LAYOUT_CONFIG.rows.email];
  }
  
  // Default: use existing position or [0, 0]
  return node.position || [0, 0];
}

/**
 * Calculate sticky note positions automatically
 * @param {object} note - Sticky note definition
 * @param {number} index - Index in sticky notes array
 * @returns {Array} [x, y] position
 */
function calculateStickyNotePosition(note, index) {
  // If autoLayout is explicitly disabled for this note, use manual position
  if (note.autoLayout === false && note.position) {
    return note.position;
  }
  
  const noteId = note.id || '';
  const noteName = note.name || '';
  
  // Overview note - center top
  if (noteId.includes('overview')) {
    return LAYOUT_CONFIG.stickyNotes.overview;
  }
  
  // Left side sticky notes (input format, credentials overview)
  if (noteId.includes('input-format')) {
    return [12920, 3820];
  }
  if (noteId.includes('credentials-overview')) {
    return [13560, 3820];
  }
  
  // Right side sticky notes (platform credentials) - based on actual positions
  if (noteId.includes('linkedin-credentials')) {
    return [16580, 4220];
  }
  if (noteId.includes('twitter-credentials')) {
    return [17140, 4220];
  }
  if (noteId.includes('instagram-credentials')) {
    return [17700, 4220];
  }
  if (noteId.includes('facebook-credentials')) {
    return [18260, 4220];
  }
  if (noteId.includes('reddit-credentials')) {
    return [18820, 4220];
  }
  if (noteId.includes('email-credentials')) {
    return [17140, 4960];
  }
  if (noteId.includes('discord-telegram-setup')) {
    return [17700, 4960];
  }
  
  // Default: use existing position
  return note.position || [0, 0];
}

/**
 * Apply auto-layout to all nodes
 * @param {Array} nodes - Array of node definitions
 * @param {object} connections - Connections object
 * @returns {Array} Nodes with updated positions
 */
function applyAutoLayout(nodes, connections) {
  console.log('📐 Applying auto-layout to nodes...');
  
  return nodes.map(node => {
    const newPosition = calculateNodePosition(node, connections);
    if (newPosition) {
      node.position = newPosition;
    }
    return node;
  });
}

/**
 * Apply auto-layout to sticky notes
 * @param {Array} stickyNotes - Array of sticky note definitions
 * @returns {Array} Sticky notes with updated positions
 */
function applyStickyNotesLayout(stickyNotes) {
  console.log('📐 Applying auto-layout to sticky notes...');
  
  return stickyNotes.map((note, index) => {
    const newPosition = calculateStickyNotePosition(note, index);
    if (newPosition) {
      note.position = newPosition;
    }
    return note;
  });
}

module.exports = {
  LAYOUT_CONFIG,
  calculateNodePosition,
  calculateStickyNotePosition,
  applyAutoLayout,
  applyStickyNotesLayout
};
