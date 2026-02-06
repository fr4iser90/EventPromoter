// Structure all platform responses into unified format
const result = {
  success: true,
  data: {}
};

// Platform mapping from node names/response patterns
const platformPatterns = {
  'twitter': ['twitter', 'tweet', 'id_str'],
  'instagram': ['instagram', 'media_id'],
  'facebook': ['facebook', 'pageId'],
  'linkedin': ['linkedin', 'urn'],
  'reddit': ['reddit', 'subreddit', 'name'],
  'email': ['email', 'recipients', 'messageId']
};

// Process all incoming items
for (const item of $input.all()) {
  const json = item.json || {};
  const responseData = json.json || json;
  
  // Try to identify platform
  let platform = null;
  
  // Method 1: Check if platform is explicitly set
  if (json.platform) {
    platform = json.platform;
  }
  // Method 2: Check response data patterns
  else {
    for (const [platformName, patterns] of Object.entries(platformPatterns)) {
      if (patterns.some(pattern => 
        json[pattern] !== undefined || 
        responseData[pattern] !== undefined ||
        JSON.stringify(json).toLowerCase().includes(pattern) ||
        JSON.stringify(responseData).toLowerCase().includes(pattern)
      )) {
        platform = platformName;
        break;
      }
    }
  }
  
  if (platform) {
    // Extract response data based on platform
    const extracted = {
      success: responseData.success !== false && !responseData.error && responseData.errorCode === undefined,
      error: responseData.error || responseData.errorMessage || (responseData.success === false ? responseData.message : undefined)
    };
    
    // Platform-specific extraction
    if (platform === 'twitter') {
      extracted.postId = responseData.id_str || responseData.id;
      extracted.url = responseData.url || (extracted.postId ? `https://twitter.com/i/web/status/${extracted.postId}` : undefined);
    } else if (platform === 'reddit') {
      extracted.postId = responseData.id || responseData.name?.replace('t3_', '');
      extracted.url = responseData.url || responseData.permalink || (extracted.postId ? `https://reddit.com${responseData.permalink || ''}` : undefined);
    } else if (platform === 'email') {
      extracted.postId = responseData.messageId || responseData.id;
      // Emails don't have URLs
    } else if (platform === 'instagram') {
      extracted.postId = responseData.id || responseData.media_id;
      extracted.url = responseData.url || (extracted.postId ? `https://instagram.com/p/${extracted.postId}/` : undefined);
    } else if (platform === 'facebook') {
      extracted.postId = responseData.id;
      extracted.url = responseData.url || (extracted.postId ? `https://facebook.com/${extracted.postId}` : undefined);
    } else if (platform === 'linkedin') {
      extracted.postId = responseData.id || responseData.urn?.split(':').pop();
      extracted.url = responseData.url || (extracted.postId ? `https://linkedin.com/feed/update/${extracted.postId}` : undefined);
    }
    
    // Remove undefined fields
    Object.keys(extracted).forEach(key => {
      if (extracted[key] === undefined) delete extracted[key];
    });
    
    result.data[platform] = extracted;
  }
}

// Check if any platform failed
const allSuccess = Object.values(result.data).every(p => p.success !== false);
result.success = allSuccess && Object.keys(result.data).length > 0;

return result;
