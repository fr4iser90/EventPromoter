// Preserve email metadata after Split Out
// Split Out only keeps the split field, so we restore email metadata from _emailMetadata
const item = $input.item;

// After Split Out, item.json contains the attachment object
// Email metadata was embedded in each attachment before split
const attachment = item.json;
const emailMetadata = attachment._emailMetadata || {};

// Restore email metadata and keep attachment data
return [{
  json: {
    email: {
      subject: emailMetadata.subject,
      html: emailMetadata.html,
      recipients: emailMetadata.recipients,
      group: emailMetadata.group,
      templateId: emailMetadata.templateId,
      templateName: emailMetadata.templateName
    },
    // Keep attachment data (url, filename, etc.) for download
    url: attachment.url,
    filename: attachment.filename,
    contentType: attachment.contentType
  },
  binary: item.binary || {}
}];
