// EN: Validate and prepare input data
// DE: Eingabedaten validieren und vorbereiten
const item = $input.item.json;

// Check if this is interface data or form data / Prüfen ob Interface- oder Form-Daten
const isInterfaceData = item.files && Array.isArray(item.files);

// Interface data validation / Interface-Daten validierung
if (isInterfaceData) {
  // Required fields for interface data
  if (!item.files || item.files.length === 0) {
    throw new Error('No files provided');
  }
  if (!item.publishTo || Object.keys(item.publishTo).length === 0) {
    throw new Error('No platforms selected for publishing');
  }

  // Create content from files and hashtags / Inhalt aus Dateien und Hashtags erstellen
  const imageFiles = item.files.filter(f => f.isImage);
  const textFiles = item.files.filter(f => !f.isImage);

  // Use first text file as main content or create from hashtags
  let eventTitle = 'Multi-Platform Post';
  let description = '';

  if (textFiles.length > 0) {
    // Try to extract title from first text file
    const firstTextFile = textFiles[0];
    const contentLines = Buffer.from(firstTextFile.base64, 'base64').toString().split('\n');
    eventTitle = contentLines[0]?.trim() || 'Multi-Platform Post';
    description = contentLines.slice(1).join('\n').trim();
  }

  // Add hashtags to description
  if (item.hashtags && item.hashtags.length > 0) {
    description += '\n\n' + item.hashtags.join(' ');
  }

  // Prepare output for interface data / Ausgabe für Interface-Daten vorbereiten
  return [{
    json: {
      eventTitle: eventTitle,
      eventDate: new Date().toISOString().split('T')[0], // Today's date
      eventTime: new Date().toTimeString().slice(0,5), // Current time
      formattedDate: new Date().toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      venue: 'Online',
      city: 'Web',
      description: description,
      imageUrl: imageFiles.length > 0 ? `data:${imageFiles[0].type};base64,${imageFiles[0].base64}` : '',
      ticketUrl: '',
      publishTo: item.publishTo,
      emailRecipients: [],
      redditSubreddit: item.platformSettings?.reddit?.subreddit || '',
      redditFlair: item.platformSettings?.reddit?.flair || '',
      redditNsfw: false,
      redditSpoiler: false,
      redditPostType: 'text',
      // Interface-specific data
      interfaceData: {
        files: item.files,
        hashtags: item.hashtags || [],
        platformSettings: item.platformSettings || {},
        metadata: item.metadata || {}
      },
      timestamp: new Date().toISOString()
    }
  }];
}

// Form data validation / Form-Daten validierung
const requiredFields = ['eventTitle', 'eventDate', 'venue', 'city'];
const missingFields = requiredFields.filter(field => !item[field]);

if (missingFields.length > 0) {
  throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
}

// Set defaults / Standardwerte setzen
const publishTo = item.publishTo || {
  twitter: true,
  instagram: true,
  facebook: true,
  linkedin: false,
  reddit: false,
  email: false
};

// Format date / Datum formatieren
let formattedDate = item.eventDate;
if (item.eventDate && item.eventTime) {
  const date = new Date(`${item.eventDate}T${item.eventTime}`);
  formattedDate = date.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Prepare output / Ausgabe vorbereiten
return [{
  json: {
    eventTitle: item.eventTitle,
    eventDate: item.eventDate,
    eventTime: item.eventTime || '22:00',
    formattedDate: formattedDate,
    venue: item.venue,
    city: item.city,
    description: item.description || '',
    imageUrl: item.imageUrl || '',
    ticketUrl: item.ticketUrl || '',
    publishTo: publishTo,
    emailRecipients: item.emailRecipients || [],
    // Reddit-specific fields / Reddit-spezifische Felder
    redditSubreddit: item.redditSubreddit || '',
    redditFlair: item.redditFlair || '',
    redditNsfw: item.redditNsfw || false,
    redditSpoiler: item.redditSpoiler || false,
    redditPostType: item.redditPostType || 'text', // 'text' or 'link'
    timestamp: new Date().toISOString()
  }
}];
