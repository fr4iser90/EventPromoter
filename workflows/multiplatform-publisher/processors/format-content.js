// EN: Format content for different platforms
// DE: Content für verschiedene Plattformen formatieren
const item = $input.item.json;

// Base text / Basistext
const baseText = `${item.eventTitle}\n\n📅 ${item.formattedDate}\n🕐 ${item.eventTime}\n📍 ${item.venue}, ${item.city}\n\n${item.description || ''}`.trim();

// Twitter/X format (280 chars max) / Twitter/X Format (max. 280 Zeichen)
let twitterText = baseText;
if (item.ticketUrl) {
  twitterText += `\n\n🎫 Tickets: ${item.ticketUrl}`;
}
// Truncate if too long / Kürzen falls zu lang
if (twitterText.length > 280) {
  twitterText = twitterText.substring(0, 277) + '...';
}

// Instagram format (2200 chars max, supports emojis) / Instagram Format (max. 2200 Zeichen)
let instagramText = `${item.eventTitle}\n\n📅 ${item.formattedDate}\n🕐 ${item.eventTime}\n📍 ${item.venue}, ${item.city}\n\n${item.description || ''}`;
if (item.ticketUrl) {
  instagramText += `\n\n🎫 Link in Bio oder: ${item.ticketUrl}`;
}
instagramText += `\n\n#DJ #Event #${item.city.replace(/\s/g, '')} #Nightlife`;

// Facebook format / Facebook Format
let facebookText = `${item.eventTitle}\n\n📅 ${item.formattedDate}\n🕐 ${item.eventTime}\n📍 ${item.venue}, ${item.city}\n\n${item.description || ''}`;
if (item.ticketUrl) {
  facebookText += `\n\n🎫 Tickets: ${item.ticketUrl}`;
}

// LinkedIn format (professional tone) / LinkedIn Format (professioneller Ton)
let linkedinText = `🎧 ${item.eventTitle}\n\n📅 Date: ${item.formattedDate}\n🕐 Time: ${item.eventTime}\n📍 Location: ${item.venue}, ${item.city}\n\n${item.description || 'Join us for an amazing night!'}`;
if (item.ticketUrl) {
  linkedinText += `\n\n🎫 Get your tickets: ${item.ticketUrl}`;
}

// Reddit format (Markdown supported) / Reddit Format (Markdown unterstützt)
let redditText = `# ${item.eventTitle}\n\n**📅 Date:** ${item.formattedDate}\n**🕐 Time:** ${item.eventTime}\n**📍 Location:** ${item.venue}, ${item.city}\n\n${item.description || ''}\n\n---\n\n**Event Details:**\n- **Venue:** ${item.venue}\n- **City:** ${item.city}\n- **Date:** ${item.formattedDate}\n- **Time:** ${item.eventTime}`;

if (item.ticketUrl) {
  redditText += `\n\n**🎫 [Get Tickets](${item.ticketUrl})**`;
}

if (item.imageUrl) {
  redditText += `\n\n![Event Image](${item.imageUrl})`;
}

redditText += `\n\n---\n\n*Posted by automated system*`;

// Email format (HTML) / E-Mail Format (HTML)
const emailHtml = `\n  <h2>${item.eventTitle}</h2>\n  <p><strong>📅 Date:</strong> ${item.formattedDate}</p>\n  <p><strong>🕐 Time:</strong> ${item.eventTime}</p>\n  <p><strong>📍 Location:</strong> ${item.venue}, ${item.city}</p>\n  ${item.description ? `<p>${item.description}</p>` : ''}\n  ${item.ticketUrl ? `<p><a href="${item.ticketUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">🎫 Get Tickets</a></p>` : ''}\n`;

const emailText = `${item.eventTitle}\n\nDate: ${item.formattedDate}\nTime: ${item.eventTime}\nLocation: ${item.venue}, ${item.city}\n\n${item.description || ''}\n\n${item.ticketUrl ? `Tickets: ${item.ticketUrl}` : ''}`;

return [{
  json: {
    ...item,
    twitterText: twitterText,
    instagramText: instagramText,
    facebookText: facebookText,
    linkedinText: linkedinText,
    redditText: redditText,
    emailHtml: emailHtml,
    emailText: emailText
  }
}];
