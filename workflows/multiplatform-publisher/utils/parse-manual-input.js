// EN: Parse manual input - detect markdown or images
// DE: Manuelle Eingabe parsen - Markdown oder Bilder erkennen

const item = $input.item.json;

// Check if input is markdown or just text
let content = item.content || item.text || '';

// Detect if content is an image URL
const imageUrlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/i;
const imageMatch = content.match(imageUrlRegex);

// Detect if content is markdown
const isMarkdown = content.includes('#') || content.includes('*') || content.includes('[') || content.includes('![');

let parsedData = {};

if (imageMatch && content.trim() === imageMatch[0]) {
  // Content is JUST an image URL
  parsedData = {
    eventTitle: "Quick Image Post",
    eventDate: new Date().toISOString().split('T')[0], // Today's date
    eventTime: "12:00",
    venue: "Online",
    city: "Digital",
    description: "Shared image",
    imageUrl: imageMatch[0],
    ticketUrl: "",
    emailRecipient: "default@email.com",
    publishTo: {
      twitter: true,
      instagram: true,
      facebook: false,
      linkedin: false,
      reddit: false,
      email: false
    },
    emailRecipients: ["default@email.com"],
    source: 'manual-image'
  };
} else if (isMarkdown) {
  // Parse markdown content
  // Simple markdown parser for event data
  const lines = content.split('\n');
  let title = '';
  let date = '';
  let time = '22:00';
  let venue = '';
  let city = '';
  let description = '';
  let imageUrl = '';
  let ticketUrl = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      title = trimmed.substring(2).trim();
    } else if (trimmed.includes('Date:') || trimmed.includes('Datum:')) {
      date = trimmed.split(':')[1]?.trim() || '';
    } else if (trimmed.includes('Time:') || trimmed.includes('Uhrzeit:')) {
      time = trimmed.split(':')[1]?.trim() || '22:00';
    } else if (trimmed.includes('Venue:') || trimmed.includes('Ort:')) {
      venue = trimmed.split(':')[1]?.trim() || '';
    } else if (trimmed.includes('City:') || trimmed.includes('Stadt:')) {
      city = trimmed.split(':')[1]?.trim() || '';
    } else if (trimmed.includes('Image:') || trimmed.includes('Bild:')) {
      imageUrl = trimmed.split(':')[1]?.trim() || '';
    } else if (trimmed.includes('Tickets:') || trimmed.includes('Tickets:')) {
      ticketUrl = trimmed.split(':')[1]?.trim() || '';
    } else if (trimmed && !trimmed.startsWith('#') && !trimmed.includes(':')) {
      description += trimmed + ' ';
    }
  }

  parsedData = {
    eventTitle: title || "Manual Event Post",
    eventDate: date || new Date().toISOString().split('T')[0],
    eventTime: time,
    venue: venue || "TBA",
    city: city || "TBA",
    description: description.trim() || "Event description",
    imageUrl: imageUrl,
    ticketUrl: ticketUrl,
    emailRecipient: "default@email.com",
    publishTo: {
      twitter: true,
      instagram: true,
      facebook: false,
      linkedin: false,
      reddit: false,
      email: false
    },
    emailRecipients: ["default@email.com"],
    source: 'manual-markdown'
  };
} else {
  // Plain text - treat as description
  parsedData = {
    eventTitle: "Quick Text Post",
    eventDate: new Date().toISOString().split('T')[0],
    eventTime: "12:00",
    venue: "Online",
    city: "Digital",
    description: content,
    imageUrl: "",
    ticketUrl: "",
    emailRecipient: "default@email.com",
    publishTo: {
      twitter: true,
      instagram: false,
      facebook: false,
      linkedin: false,
      reddit: false,
      email: false
    },
    emailRecipients: ["default@email.com"],
    source: 'manual-text'
  };
}

return [{
  json: parsedData
}];
