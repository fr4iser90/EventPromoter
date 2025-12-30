// EN: Collect results from all posting operations
// DE: Sammelt Ergebnisse aller Posting-Operationen
const results = [];
const allItems = $input.all();

// Get original event data from first item / Hole ursprüngliche Event-Daten vom ersten Item
const inputData = allItems[0]?.json || {};

// Platform detection from data / Plattform-Erkennung aus Daten
const detectPlatform = (item) => {
  // Check for platform-specific fields / Prüfe plattform-spezifische Felder
  if (item.id_str || item.id) return 'Twitter/X';
  if (item.instagram_id || item.media_id) return 'Instagram';
  if (item.post_id || item.facebook_id) return 'Facebook';
  if (item.linkedin_id || item.urn) return 'LinkedIn';
  if (item.messageId || item.emailId) return 'Email';
  if (item.name && item.name.startsWith('t3_')) return 'Reddit';
  // Fallback: check for error or success indicators / Fallback: Prüfe Fehler- oder Erfolgs-Indikatoren
  if (item.error) return 'Unknown Platform';
  return 'Unknown Platform';
};

// Collect all outputs / Alle Ausgaben sammeln
allItems.forEach((item) => {
  const platform = detectPlatform(item.json);
  const hasError = item.json.error || item.json.errorMessage || false;

  results.push({
    platform: platform,
    success: !hasError,
    data: item.json,
    timestamp: new Date().toISOString()
  });
});

// If no results collected, create summary from input / Falls keine Ergebnisse gesammelt, erstelle Zusammenfassung aus Eingabe
if (results.length === 0 && inputData.eventTitle) {
  results.push({
    platform: 'No platforms enabled',
    success: true,
    data: { message: 'No platforms were enabled for posting' },
    timestamp: new Date().toISOString()
  });
}

return [{
  json: {
    eventTitle: inputData.eventTitle || 'Unknown Event',
    eventDate: inputData.eventDate || '',
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  }
}];
