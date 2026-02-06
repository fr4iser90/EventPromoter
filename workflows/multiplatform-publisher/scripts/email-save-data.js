// Save email data before splitting attachments
const email = $input.item.json.email;
return [{
  json: {
    email: email,
    emailData: email // Store for later merge
  }
}];
