// Prepare email data and handle multiple email format
const input = $input.item.json;
const emailData = input.email || input.emails;

// Handle both single email and multiple emails format
if (Array.isArray(emailData)) {
  // Multiple emails format: { emails: [...] }
  return emailData.map(email => ({
    json: {
      ...input,
      email: email
    }
  }));
} else if (emailData) {
  // Single email format
  return [{
    json: {
      ...input,
      email: emailData
    }
  }];
}

// No email data
return [];
