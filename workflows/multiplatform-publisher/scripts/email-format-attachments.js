// Format attachments array for n8n emailSend node
// emailSend expects: attachments: [{ fileName: string, content: string (base64) }]
const email = $input.item.json.email || $input.item.json[0]?.email;
const processedAttachments = $input.item.json.processedAttachments || [];

// Ensure processedAttachments is an array
const attachmentsArray = Array.isArray(processedAttachments) 
  ? processedAttachments.map(att => ({
      fileName: att.fileName || att.filename || 'attachment',
      content: att.content
    }))
  : [];

return [{
  json: {
    email: email,
    attachments: attachmentsArray.length > 0 ? attachmentsArray : undefined
  }
}];
