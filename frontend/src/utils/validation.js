// EN: Validation utilities for frontend
// DE: Validierungsfunktionen für das Frontend

/**
 * Platform validation rules
 */
export const PLATFORM_RULES = {
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
};

/**
 * Validate required fields for event data
 */
export function validateEventData(eventData) {
  const errors = [];

  // Required fields
  const requiredFields = ['eventTitle', 'eventDate', 'venue', 'city'];
  for (const field of requiredFields) {
    if (!eventData[field] || eventData[field].trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Date validation
  if (eventData.eventDate) {
    const date = new Date(eventData.eventDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }

  // Time validation (if provided)
  if (eventData.eventTime) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(eventData.eventTime)) {
      errors.push('Invalid time format (use HH:MM)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate platform-specific requirements
 */
export function validatePlatforms(platformContent, selectedPlatforms) {
  const validationResults = [];
  let hasErrors = false;

  // Check each enabled platform
  for (const [platform, enabled] of Object.entries(selectedPlatforms || {})) {
    if (!enabled) continue;

    const rules = PLATFORM_RULES[platform];
    if (!rules) {
      validationResults.push({
        platform,
        valid: false,
        error: `Unknown platform: ${platform}`
      });
      hasErrors = true;
      continue;
    }

    const content = platformContent[platform];
    const errors = [];

    // Check required fields
    for (const field of rules.required) {
      if (field === 'eventTitle') {
        if (!platformContent.eventTitle) {
          errors.push('Event title is required');
        }
      } else if (field === 'imageUrl') {
        if (!platformContent.imageUrl) {
          errors.push('Image is required for this platform');
        }
      } else if (field === 'redditSubreddit') {
        if (!content || !content.subreddit) {
          errors.push('Reddit subreddit is required');
        }
      }
    }

    // Check content length
    if (rules.maxLength && content && content.text && content.text.length > rules.maxLength) {
      errors.push(`Content too long: ${content.text.length} > ${rules.maxLength} characters`);
    }


    if (errors.length > 0) {
      validationResults.push({
        platform,
        valid: false,
        errors
      });
      hasErrors = true;
    } else {
      validationResults.push({
        platform,
        valid: true,
        supports: rules.supports
      });
    }
  }

  return {
    isValid: !hasErrors,
    results: validationResults
  };
}

/**
 * Validate URL format (basic validation)
 */
export function validateUrl(url) {
  if (!url) return { valid: true, reachable: false };

  try {
    new URL(url);
    return {
      valid: true,
      reachable: false, // We don't check reachability in frontend
      url
    };
  } catch (error) {
    return {
      valid: false,
      reachable: false,
      error: 'Invalid URL format',
      url
    };
  }
}

/**
 * Format date for display
 */
export function formatDateForDisplay(dateString, timeString = null) {
  try {
    const date = timeString
      ? new Date(`${dateString}T${timeString}`)
      : new Date(dateString);

    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString; // Fallback
  }
}

/**
 * Get platform-specific validation rules for UI
 */
export function getPlatformRequirements(platform) {
  return PLATFORM_RULES[platform] || null;
}
