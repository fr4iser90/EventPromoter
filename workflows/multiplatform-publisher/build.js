#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Load a script file from the scripts directory
 * @param {string} scriptName - Name of the script file (without .js extension)
 * @returns {string} The script content
 */
function loadScript(scriptName) {
  const scriptPath = path.join(__dirname, 'scripts', scriptName);
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Script not found: ${scriptPath}`);
  }
  return fs.readFileSync(scriptPath, 'utf8');
}

/**
 * Load a sticky note file from the sticky-notes directory
 * @param {string} fileName - Name of the markdown file
 * @returns {string} The file content
 */
function loadStickyNote(fileName) {
  const filePath = path.join(__dirname, 'sticky-notes', fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Sticky note file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Load node definitions from a JSON file
 * @param {string} filePath - Path to the node file (relative to nodes/ directory or absolute)
 * @returns {Array|Object} Node definition(s) - can be single object or array
 */
function loadNodeFile(filePath) {
  // If relative path, assume it's in nodes/ directory
  if (!path.isAbsolute(filePath)) {
    filePath = path.join(__dirname, 'nodes', filePath);
  }
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Node file not found: ${filePath}`);
  }
  
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  // Return as array (single node or array of nodes)
  return Array.isArray(content) ? content : [content];
}

/**
 * Load all node files from a directory
 * @param {string} dirPath - Directory path (relative to nodes/ or absolute)
 * @returns {Array} Array of all nodes from all files in directory
 */
function loadNodesFromDirectory(dirPath) {
  // If relative path, assume it's in nodes/ directory
  if (!path.isAbsolute(dirPath)) {
    dirPath = path.join(__dirname, 'nodes', dirPath);
  }
  
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}, skipping...`);
    return [];
  }
  
  const nodes = [];
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    console.log(`📦 Loading nodes from: ${file}`);
    try {
      const fileNodes = loadNodeFile(filePath);
      nodes.push(...fileNodes);
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error.message);
    }
  });
  
  return nodes;
}

// Import layout functions
const {
  applyAutoLayout,
  applyStickyNotesLayout
} = require('./utils/layout');

/**
 * Generate deterministic UUIDs for template IDs
 * @param {object} config - Config object with nodes
 * @returns {object} Mapping of template IDs to UUIDs
 */
function generateWorkflowUUIDs(config) {
  const { generateWorkflowUUIDs } = require('../uuid-generator');
  return generateWorkflowUUIDs(config);
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

  // Collect all nodes from various sources
  let allNodes = [];
  
  // 1. Load nodes from nodeFiles array (if specified)
  if (config.nodeFiles && Array.isArray(config.nodeFiles)) {
    config.nodeFiles.forEach(nodeFile => {
      console.log(`📁 Loading node file: ${nodeFile}`);
      const fileNodes = loadNodeFile(nodeFile);
      allNodes.push(...fileNodes);
    });
  }
  
  // 2. Load nodes from nodeDirectories (if specified)
  if (config.nodeDirectories && Array.isArray(config.nodeDirectories)) {
    config.nodeDirectories.forEach(dir => {
      console.log(`📂 Loading nodes from directory: ${dir}`);
      const dirNodes = loadNodesFromDirectory(dir);
      allNodes.push(...dirNodes);
    });
  }
  
  // 3. Add inline nodes (if specified)
  if (config.nodes && Array.isArray(config.nodes)) {
    console.log(`📝 Adding ${config.nodes.length} inline nodes`);
    allNodes.push(...config.nodes);
  }
  
  if (allNodes.length === 0) {
    throw new Error('No nodes found! Specify nodeFiles, nodeDirectories, or nodes in config.json');
  }
  
  console.log(`📊 Total nodes collected: ${allNodes.length}`);

  // Apply auto-layout if enabled (default: true)
  if (config.autoLayout !== false) {
    allNodes = applyAutoLayout(allNodes, config.connections || {});
  }

  // Load ID mapping for compatibility (need to create temp config with all nodes)
  const tempConfig = { ...config, nodes: allNodes };
  const idMapping = generateWorkflowUUIDs(tempConfig);
  console.log(`🔧 Generated ${Object.keys(idMapping).length} deterministic UUIDs`);

  // Create name mapping for connections (template ID → node name)
  const nameMapping = {};
  allNodes.forEach(node => {
    nameMapping[node.id] = node.name;
  });
  if (config.stickyNotes) {
    config.stickyNotes.forEach(note => {
      nameMapping[note.id] = note.name;
    });
  }

  // Build nodes array
  const nodes = allNodes.map(node => {
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
      const scriptContent = loadScript(node.script);
      nodeObj.parameters.jsCode = scriptContent;
    } else if (node.parameters) {
      nodeObj.parameters = { ...nodeObj.parameters, ...node.parameters };
    }

    return nodeObj;
  });

  // Add sticky notes if they exist
  if (config.stickyNotes) {
    // Apply auto-layout to sticky notes if enabled
    let processedStickyNotes = config.stickyNotes;
    if (config.autoLayout !== false) {
      processedStickyNotes = applyStickyNotesLayout(config.stickyNotes);
    }
    
    processedStickyNotes.forEach(note => {
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

module.exports = { buildWorkflow, loadScript, getNodeType, loadNodeFile, loadNodesFromDirectory };
