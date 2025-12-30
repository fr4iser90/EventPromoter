// EN: Validate platform credentials and requirements
// DE: Plattform-Credentials und Anforderungen validieren

const item = $input.item.json;

// Platform validation rules
const platformRules = {
  twitter: {
    required: ['eventTitle'],
    maxLength: 280,
    supports: ['text']
  },
  instagram: {
    required: ['eventTitle', 'imageUrl'],
    maxLength: 2200,
    supports: ['image', 'text']
  },
  facebook: {
    required: ['eventTitle'],
    maxLength: null, // No strict limit
    supports: ['text', 'image']
  },
  linkedin: {
    required: ['eventTitle'],
    maxLength: 3000,
    supports: ['text', 'image']
  },
  reddit: {
    required: ['eventTitle', 'redditSubreddit'],
    maxLength: null,
    supports: ['text', 'image']
  },
  email: {
    required: ['eventTitle', 'emailRecipients'],
    maxLength: null,
    supports: ['text', 'image', 'html']
  }
};

const validationResults = [];
let hasErrors = false;

// Check each enabled platform
for (const [platform, enabled] of Object.entries(item.publishTo || {})) {
  if (!enabled) continue;

  const rules = platformRules[platform];
  if (!rules) {
    validationResults.push({
      platform,
      valid: false,
      error: `Unknown platform: ${platform}`
    });
    hasErrors = true;
    continue;
  }

  // Check required fields
  const missingFields = rules.required.filter(field => !item[field]);
  if (missingFields.length > 0) {
    validationResults.push({
      platform,
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    });
    hasErrors = true;
    continue;
  }

  // Check content length if applicable
  if (rules.maxLength && item[`${platform}Text`] && item[`${platform}Text`].length > rules.maxLength) {
    validationResults.push({
      platform,
      valid: false,
      error: `Content too long: ${item[`${platform}Text`].length} > ${rules.maxLength} characters`
    });
    hasErrors = true;
    continue;
  }

  // Platform-specific validations
  if (platform === 'reddit' && !item.redditSubreddit) {
    validationResults.push({
      platform,
      valid: false,
      error: 'Reddit subreddit is required'
    });
    hasErrors = true;
    continue;
  }

  if (platform === 'email' && (!item.emailRecipients || item.emailRecipients.length === 0)) {
    validationResults.push({
      platform,
      valid: false,
      error: 'Email recipients are required'
    });
    hasErrors = true;
    continue;
  }

  validationResults.push({
    platform,
    valid: true,
    supports: rules.supports
  });
}

if (hasErrors) {
  throw new Error(`Platform validation failed:\n${validationResults
    .filter(r => !r.valid)
    .map(r => `${r.platform}: ${r.error}`)
    .join('\n')}`);
}

return [{
  json: {
    ...item,
    platformValidation: validationResults,
    validationPassed: true,
    validatedAt: new Date().toISOString()
  }
}];
