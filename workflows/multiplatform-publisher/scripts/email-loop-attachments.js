// Loop over attachments and create one item per attachment
// This replaces the Split Out node - simpler and more reliable
const item = $input.item;
const email = item.json.email || {};
const attachments = email.attachments || [];

// Create one item per attachment with email metadata preserved
const items = attachments.map(attachment => ({
  json: {
    email: {
      subject: email.subject,
      html: email.html,
      recipients: email.recipients,
      group: email.group,
      templateId: email.templateId,
      templateName: email.templateName
    },
    url: attachment.url,
    filename: attachment.filename,
    contentType: attachment.contentType,
    _isImage: attachment._isImage || false
  },
  binary: {}
}));

return items;
