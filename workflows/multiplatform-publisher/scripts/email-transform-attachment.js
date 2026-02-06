// Transform downloaded attachment to n8n emailSend format
// n8n emailSend expects: { fileName: string, content: string (base64) }
const attachment = $input.item.json.email.attachments;
const fileData = $input.item.binary;

// Get the binary data key (usually 'data')
const binaryKey = Object.keys(fileData)[0];
const file = fileData[binaryKey];

// Convert binary to base64
const base64Content = file.data;

return [{
  json: {
    fileName: attachment.filename || attachment.name || 'attachment',
    content: base64Content,
    contentType: attachment.contentType || attachment.type || 'application/octet-stream',
    originalUrl: attachment.url
  }
}];
