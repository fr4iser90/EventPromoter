#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Load a script file from the processors directory
 * @param {string} scriptName - Name of the script file (without .js extension)
 * @returns {string} The script content
 */
function loadProcessorScript(scriptName) {
  const scriptPath = path.join(__dirname, '..', 'processors', `${scriptName}.js`);
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Processor script not found: ${scriptPath}`);
  }
  return fs.readFileSync(scriptPath, 'utf8');
}

/**
 * Load a utility script from the utils directory
 * @param {string} scriptName - Name of the script file (without .js extension)
 * @returns {string} The script content
 */
function loadUtilityScript(scriptName) {
  const scriptPath = path.join(__dirname, '..', 'utils', `${scriptName}.js`);
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Utility script not found: ${scriptPath}`);
  }
  return fs.readFileSync(scriptPath, 'utf8');
}

/**
 * Load a sticky note file from the sticky-notes directory
 * @param {string} fileName - Name of the markdown file
 * @returns {string} The file content
 */
function loadStickyNote(fileName) {
  const filePath = path.join(__dirname, '..', 'sticky-notes', fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Sticky note file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Load platform configurations
 * @returns {object} Platform configuration object
 */
function loadPlatformConfigs() {
  try {
    const platformConfigs = require('../config/platforms');
    console.log('📋 Loaded platform configurations');
    return platformConfigs.getAllConfigs();
  } catch (error) {
    console.warn('⚠️  Could not load platform configs, using defaults:', error.message);
    return {};
  }
}

/**
 * Generate deterministic UUIDs for template IDs
 * @returns {object} Mapping of template IDs to UUIDs
 */
function loadIdMapping() {
  const { generateWorkflowUUIDs } = require('./uuid-generator');
  const config = JSON.parse(require('fs').readFileSync('./config.json', 'utf8'));
  const mapping = generateWorkflowUUIDs(config);

  console.log(`🔧 Generated ${Object.keys(mapping).length} deterministic UUIDs`);
  return mapping;
}

/**
 * Apply platform configurations to nodes
 * @param {Array} nodes - The workflow nodes
 * @param {object} platformConfigs - Platform configuration object
 */
function applyPlatformConfigs(nodes, platformConfigs) {
  nodes.forEach(node => {
    // Apply platform-specific settings based on node name
    if (node.name?.includes('Twitter') && platformConfigs.twitter) {
      if (node.parameters) {
        node.parameters.additionalFields = platformConfigs.twitter.posting?.additionalFields || {};
      }
    }

    if (node.name?.includes('Instagram') && platformConfigs.instagram) {
      if (node.parameters) {
        node.parameters.additionalFields = platformConfigs.instagram.posting?.additionalFields || {};
      }
    }

    if (node.name?.includes('Facebook') && platformConfigs.facebook) {
      if (node.parameters) {
        node.parameters.additionalFields = platformConfigs.facebook.posting?.additionalFields || {};
      }
    }

    if (node.name?.includes('LinkedIn') && platformConfigs.linkedin) {
      if (node.parameters) {
        node.parameters.additionalFields = platformConfigs.linkedin.posting?.additionalFields || {};
      }
    }

    if (node.name?.includes('Reddit') && platformConfigs.reddit) {
      if (node.parameters && node.parameters.resource === 'post') {
        node.parameters.subreddit = platformConfigs.reddit.posting?.defaultSubreddit || 'DJs';
        node.parameters.additionalFields = platformConfigs.reddit.posting?.additionalFields || {};
      }
    }

    if (node.name?.includes('Send Email') && platformConfigs.email) {
      // Email recipients are handled dynamically in the script
      console.log('📧 Email platform configured with custom recipients');
    }
  });
}

/**
 * Build the complete n8n workflow from config and scripts
 * @returns {object} The complete workflow object
 */
function buildWorkflow() {
  console.log('🔧 Building workflow...');

  // Load configuration
  const configPath = path.join(__dirname, 'config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log(`📋 Loaded config for: ${config.name}`);

  // Load ID mapping for compatibility
  const idMapping = loadIdMapping();

  // Create name mapping for connections (template ID → node name)
  const nameMapping = {};
  config.nodes.forEach(node => {
    nameMapping[node.id] = node.name;
  });
  if (config.stickyNotes) {
    config.stickyNotes.forEach(note => {
      nameMapping[note.id] = note.name;
    });
  }

  // Build nodes array
  const nodes = config.nodes.map(node => {
    // Use generated UUID for this template ID
    const originalId = idMapping[node.id] || node.id;
    const nodeObj = {
      parameters: {},
      id: originalId,
      name: node.name,
      type: getNodeType(node.type),
      typeVersion: node.typeVersion || 1,
      position: node.position || [0, 0]
    };

    // Add specific properties
    if (node.webhookId) {
      nodeObj.webhookId = node.webhookId;
    }

    if (node.notesInFlow) {
      nodeObj.notesInFlow = node.notesInFlow;
    }

    if (node.notes) {
      nodeObj.notes = node.notes;
    }

    // Load script if specified
    if (node.script) {
      console.log(`📜 Loading script: ${node.script}`);
      let scriptContent;
      let scriptName = node.script;
      // Remove .js extension if present
      if (scriptName.endsWith('.js')) {
        scriptName = scriptName.slice(0, -3);
      }

      try {
        // Try to load from processors directory first
        scriptContent = loadProcessorScript(scriptName);
      } catch (error) {
        try {
          // Try utils directory as fallback
          scriptContent = loadUtilityScript(scriptName);
        } catch (utilError) {
          throw new Error(`Script ${node.script} not found in processors or utils: ${error.message}`);
        }
      }
      nodeObj.parameters.jsCode = scriptContent;
    } else if (node.parameters) {
      nodeObj.parameters = { ...nodeObj.parameters, ...node.parameters };
    }

    return nodeObj;
  });

  // Load and apply platform configurations
  const platformConfigs = loadPlatformConfigs();
  applyPlatformConfigs(nodes, platformConfigs);

  // Add sticky notes if they exist
  if (config.stickyNotes) {
    config.stickyNotes.forEach(note => {
      // Load content from file if specified, otherwise use inline content
      let content = note.content;
      if (note.file) {
        console.log(`📄 Loading sticky note: ${note.file}`);
        content = loadStickyNote(note.file);
      }

      nodes.push({
        parameters: {
          content: content,
          height: note.height || 400,
          width: note.width || 600,
          color: note.color || 1
        },
        type: "n8n-nodes-base.stickyNote",
        typeVersion: 1,
        position: note.position || [0, 0],
        id: note.id,
        name: note.name
      });
    });
  }

  // Process connections to use node names (like original n8n export)
  const processedConnections = {};
  if (config.connections) {
    Object.keys(config.connections).forEach(templateKey => {
      // Use node name as connection key (like original n8n JSON)
      const nodeNameKey = nameMapping[templateKey] || templateKey;
      processedConnections[nodeNameKey] = config.connections[templateKey];

      // Also update node references within connections to use node names
      if (processedConnections[nodeNameKey].main) {
        processedConnections[nodeNameKey].main.forEach(path => {
          path.forEach(connection => {
            if (connection.node && nameMapping[connection.node]) {
              connection.node = nameMapping[connection.node];
            }
          });
        });
      }
    });
  }

  // Build the complete workflow
  const workflow = {
    name: config.name,
    active: false,
    nodes: nodes,
    connections: processedConnections,
    pinData: {},
    meta: {
      instanceId: "7302af2d76ff11fa25dfe4c4b676102587b05b140a7ac12e86e85bb8179e9e38"
    }
  };

  console.log(`✅ Built workflow with ${nodes.length} nodes`);
  return workflow;
}

/**
 * Get the full n8n node type from shorthand
 * @param {string} type - Short type name
 * @returns {string} Full n8n type
 */
function getNodeType(type) {
  const typeMap = {
    'webhook': 'n8n-nodes-base.webhook',
    'respondToWebhook': 'n8n-nodes-base.respondToWebhook',
    'code': 'n8n-nodes-base.code',
    'if': 'n8n-nodes-base.if',
    'formTrigger': 'n8n-nodes-base.formTrigger',
    'twitter': 'n8n-nodes-base.twitter',
    'instagram': 'n8n-nodes-base.instagram',
    'facebook': 'n8n-nodes-base.facebook',
    'linkedIn': 'n8n-nodes-base.linkedIn',
    'emailSend': 'n8n-nodes-base.emailSend',
    'httpRequest': 'n8n-nodes-base.httpRequest',
    'set': 'n8n-nodes-base.set',
    'manualTrigger': 'n8n-nodes-base.manualTrigger'
  };

  return typeMap[type] || type;
}

/**
 * Save the workflow to a JSON file
 * @param {object} workflow - The workflow object
 * @param {string} outputPath - Path to save the file
 */
function saveWorkflow(workflow, outputPath) {
  const jsonString = JSON.stringify(workflow, null, 2);
  fs.writeFileSync(outputPath, jsonString, 'utf8');
  console.log(`💾 Saved workflow to: ${outputPath}`);
  console.log(`📊 File size: ${(jsonString.length / 1024).toFixed(1)} KB`);
}

// Main execution
if (require.main === module) {
  try {
    const workflow = buildWorkflow();

    // Auto-detect output path: Gehe zum Hauptverzeichnis des Projekts
    let outputDir = __dirname;
    while (path.basename(outputDir) !== '' && !fs.existsSync(path.join(outputDir, 'workflows'))) {
      const parent = path.dirname(outputDir);
      if (parent === outputDir) break; // Root erreicht
      outputDir = parent;
    }

    const outputPath = path.join(outputDir, 'MultiPlatformSocialMediaEmail-built.json');
    saveWorkflow(workflow, outputPath);
    console.log('🎉 Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

module.exports = { buildWorkflow, loadProcessorScript, loadUtilityScript, getNodeType };
