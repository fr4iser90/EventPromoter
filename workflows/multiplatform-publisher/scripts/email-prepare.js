// Prepare email data - extract email from body.email
// Webhook contract: { body: { email: {...} } }
// Workflow contract: { email: {...} }

const input = $input.item.json;

// If-Node verified: $json.body?.email && typeof $json.body.email === 'object'
// Email is in body.email (webhook structure)
const emailData = input.body?.email;

if (!emailData || typeof emailData !== 'object') {
  throw new Error('Invalid input: email is missing or not an object');
}

// Normalize to workflow contract: { email: {...} }
return [{
  json: {
    email: emailData
  }
}];
