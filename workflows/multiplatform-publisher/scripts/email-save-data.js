// Save email data before splitting attachments
const input = $input.item.json;
const email = input.email;

if (!email) {
  console.warn('No email data found in input:', Object.keys(input));
  // Return input as-is to prevent n8n from stopping
  return [{
    json: input
  }];
}

// Ensure email object has attachments array (even if empty)
const emailWithAttachments = {
  ...email,
  attachments: email.attachments || []
};

return [{
  json: {
    email: emailWithAttachments,
    emailData: emailWithAttachments // Store for later merge
  }
}];
