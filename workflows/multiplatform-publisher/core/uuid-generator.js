const crypto = require('crypto');

/**
 * Generates a deterministic UUID from a template ID
 * Same template ID will always generate the same UUID
 * @param {string} templateId - The template ID (e.g., "webhook-trigger")
 * @returns {string} A valid UUID v4 format
 */
function generateUUID(templateId) {
  // Create MD5 hash of the template ID
  const hash = crypto.createHash('md5').update(templateId).digest('hex');

  // Convert to UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  // Use parts of the hash to create a valid UUID structure
  const part1 = hash.substr(0, 8);
  const part2 = hash.substr(8, 4);
  const part3 = hash.substr(12, 4);
  const part4 = hash.substr(16, 4);
  const part5 = hash.substr(20, 12);

  // Set version to 4 (random UUID) and variant to RFC 4122
  const version = '4'; // UUID v4
  const variant = (parseInt(part4.charAt(0), 16) & 0x3 | 0x8).toString(16); // RFC 4122 variant

  return `${part1}-${part2}-${part3}-${version}${part4.substr(1)}-${variant}${part5.substr(1)}`;
}

/**
 * Generate UUIDs for all nodes in the workflow config
 * @param {object} config - The workflow configuration
 * @returns {object} Mapping of template IDs to UUIDs
 */
function generateWorkflowUUIDs(config) {
  const uuidMap = {};

  // Generate UUIDs for regular nodes
  if (config.nodes) {
    config.nodes.forEach(node => {
      if (node.id) {
        uuidMap[node.id] = generateUUID(node.id);
      }
    });
  }

  // Generate UUIDs for sticky notes
  if (config.stickyNotes) {
    config.stickyNotes.forEach(note => {
      if (note.id) {
        uuidMap[note.id] = generateUUID(note.id);
      }
    });
  }

  return uuidMap;
}

module.exports = {
  generateUUID,
  generateWorkflowUUIDs
};
