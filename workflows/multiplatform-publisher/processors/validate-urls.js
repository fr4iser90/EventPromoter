// EN: Validate image and ticket URLs
// DE: Bild- und Ticket-URLs validieren

const item = $input.item.json;
const axios = require('axios');

async function validateUrl(url, timeout = 5000) {
  if (!url) return { valid: true, reachable: false }; // Optional URL

  try {
    // Basic URL format validation
    new URL(url);

    // Try to reach the URL (HEAD request for efficiency)
    const response = await axios.head(url, {
      timeout,
      headers: {
        'User-Agent': 'n8n-workflow/1.0 (URL Validation)'
      }
    });

    return {
      valid: true,
      reachable: response.status >= 200 && response.status < 400,
      statusCode: response.status,
      contentType: response.headers['content-type']
    };
  } catch (error) {
    return {
      valid: false,
      reachable: false,
      error: error.message,
      reason: error.code || 'Unknown error'
    };
  }
}

async function main() {
  const results = {};

  // Validate image URL
  if (item.imageUrl) {
    console.log(`🔍 Validating image URL: ${item.imageUrl}`);
    results.imageUrl = await validateUrl(item.imageUrl);

    if (results.imageUrl.valid && results.imageUrl.reachable) {
      // Check if it's actually an image
      const contentType = results.imageUrl.contentType;
      if (contentType && !contentType.startsWith('image/')) {
        results.imageUrl.warning = `URL does not point to an image (Content-Type: ${contentType})`;
      }
    }
  }

  // Validate ticket URL
  if (item.ticketUrl) {
    console.log(`🔍 Validating ticket URL: ${item.ticketUrl}`);
    results.ticketUrl = await validateUrl(item.ticketUrl);
  }

  // Check for validation errors
  const imageError = results.imageUrl && !results.imageUrl.valid;
  const ticketError = results.ticketUrl && !results.ticketUrl.valid;

  if (imageError || ticketError) {
    const errors = [];
    if (imageError) errors.push(`Image URL: ${results.imageUrl.error}`);
    if (ticketError) errors.push(`Ticket URL: ${results.ticketUrl.error}`);

    throw new Error(`URL validation failed:\n${errors.join('\n')}`);
  }

  // Log warnings
  if (results.imageUrl?.warning) {
    console.warn(`⚠️  ${results.imageUrl.warning}`);
  }

  return [{
    json: {
      ...item,
      urlValidation: results,
      urlsValidated: true,
      validatedAt: new Date().toISOString()
    }
  }];
}

return main();
