// EN: Transform form data to match webhook format
// DE: Form-Daten in Webhook-Format umwandeln

const item = $input.item.json;

// Transform form data to match the expected webhook format
const transformedData = {
  eventTitle: item.eventTitle,
  eventDate: item.eventDate,
  eventTime: item.eventTime || '22:00',
  venue: item.venue,
  city: item.city,
  description: item.description || '',
  imageUrl: item.imageUrl || '',
  ticketUrl: item.ticketUrl || '',
  publishTo: {
    twitter: item.publishTwitter || false,
    instagram: item.publishInstagram || false,
    facebook: item.publishFacebook || false,
    linkedin: false,
    reddit: false,
    email: item.publishEmail !== false // Default to true if not specified
  },
  emailRecipients: item.emailRecipient ? [item.emailRecipient] : [],
  source: 'form' // Mark as coming from form
};

return [{
  json: transformedData
}];
