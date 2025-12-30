// EN: Generate relevant hashtags for different platforms
// DE: Relevante Hashtags für verschiedene Plattformen generieren

const item = $input.item.json;

// Base hashtags for different categories
const hashtagDatabase = {
  music: ['#Music', '#LiveMusic', '#Concert', '#DJ', '#Techno', '#House', '#Electronic'],
  location: (city) => [`#${city.replace(/\s+/g, '')}`, `#${city}Events`, `#${city}Nightlife`],
  event: ['#Event', '#Nightlife', '#Club', '#Party', '#Festival', '#LiveEvent'],
  platform: {
    instagram: ['#Instamusic', '#ClubLife', '#NightOut'],
    twitter: ['#NowPlaying', '#MusicEvent'],
    facebook: ['#LocalEvent', '#Community'],
    linkedin: ['#Networking', '#ProfessionalEvent'],
    reddit: ['#MusicCommunity', '#EventShare']
  }
};

function generateHashtags() {
  const hashtags = new Set();

  // Add music-related hashtags
  hashtagDatabase.music.forEach(tag => hashtags.add(tag));

  // Add location-based hashtags
  if (item.city) {
    const locationTags = hashtagDatabase.location(item.city);
    locationTags.forEach(tag => hashtags.add(tag));
  }

  // Add event-related hashtags
  hashtagDatabase.event.forEach(tag => hashtags.add(tag));

  // Add platform-specific hashtags
  for (const [platform, enabled] of Object.entries(item.publishTo || {})) {
    if (enabled && hashtagDatabase.platform[platform]) {
      hashtagDatabase.platform[platform].forEach(tag => hashtags.add(tag));
    }
  }

  // Extract hashtags from description
  if (item.description) {
    const descriptionHashtags = item.description.match(/#\w+/g);
    if (descriptionHashtags) {
      descriptionHashtags.forEach(tag => hashtags.add(tag));
    }
  }

  // Convert to array and sort
  const result = Array.from(hashtags).sort();

  // Limit to reasonable amount per platform
  const limits = {
    twitter: 5,      // Twitter prefers fewer hashtags
    instagram: 10,   // Instagram can handle more
    facebook: 8,
    linkedin: 3,     // LinkedIn prefers professional look
    reddit: 5,
    email: 0         // Email usually doesn't need hashtags
  };

  return result.slice(0, limits[item.currentPlatform] || 5);
}

// Generate hashtags for each platform
const enhancedItem = { ...item };

for (const [platform, enabled] of Object.entries(item.publishTo || {})) {
  if (enabled) {
    // Temporarily set current platform for hashtag generation
    enhancedItem.currentPlatform = platform;
    const platformHashtags = generateHashtags();

    // Add hashtags to platform-specific text
    const textKey = `${platform}Text`;
    if (enhancedItem[textKey]) {
      // Only add hashtags if not already present
      const existingHashtags = enhancedItem[textKey].match(/#\w+/g) || [];
      const newHashtags = platformHashtags.filter(tag => !existingHashtags.includes(tag));

      if (newHashtags.length > 0) {
        enhancedItem[textKey] += '\n\n' + newHashtags.join(' ');
      }
    }

    enhancedItem[`${platform}Hashtags`] = platformHashtags;
  }
}

return [{
  json: {
    ...enhancedItem,
    hashtagsGenerated: true,
    generatedAt: new Date().toISOString()
  }
}];
