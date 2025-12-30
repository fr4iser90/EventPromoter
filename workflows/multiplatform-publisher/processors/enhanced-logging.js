// EN: Enhanced logging and monitoring for all posting operations
// DE: Erweiterte Protokollierung und Überwachung aller Posting-Operationen

const item = $input.item.json;

// Create detailed execution log
const executionLog = {
  eventId: `${item.eventTitle}-${Date.now()}`,
  timestamp: new Date().toISOString(),
  event: {
    title: item.eventTitle,
    date: item.eventDate,
    venue: item.venue,
    city: item.city
  },
  platforms: {},
  summary: {
    totalPlatforms: 0,
    successful: 0,
    failed: 0,
    skipped: 0
  }
};

// Analyze platform results
if (item.results && Array.isArray(item.results)) {
  item.results.forEach(result => {
    executionLog.summary.totalPlatforms++;

    executionLog.platforms[result.platform] = {
      success: result.success,
      timestamp: result.timestamp,
      data: result.data
    };

    if (result.success) {
      executionLog.summary.successful++;
    } else {
      executionLog.summary.failed++;
    }
  });
}

// Calculate skipped platforms
const enabledPlatforms = Object.keys(item.publishTo || {}).filter(p => item.publishTo[p]);
executionLog.summary.skipped = enabledPlatforms.length - executionLog.summary.totalPlatforms;

// Performance metrics
executionLog.performance = {
  totalDuration: Date.now() - new Date(item.timestamp).getTime(),
  platformsPerSecond: executionLog.summary.totalPlatforms / ((Date.now() - new Date(item.timestamp).getTime()) / 1000)
};

// Generate human-readable summary
let summaryText = `🎫 Event: ${item.eventTitle}\n`;
summaryText += `📅 Date: ${item.formattedDate}\n`;
summaryText += `📍 Location: ${item.venue}, ${item.city}\n\n`;

summaryText += `📊 Posting Results:\n`;
summaryText += `✅ Successful: ${executionLog.summary.successful}\n`;
summaryText += `❌ Failed: ${executionLog.summary.failed}\n`;
summaryText += `⏭️  Skipped: ${executionLog.summary.skipped}\n\n`;

if (executionLog.summary.failed > 0) {
  summaryText += `⚠️  Failed Platforms:\n`;
  Object.entries(executionLog.platforms).forEach(([platform, data]) => {
    if (!data.success) {
      summaryText += `• ${platform}: ${data.data?.error || 'Unknown error'}\n`;
    }
  });
}

// Log to console for n8n logs
console.log('='.repeat(50));
console.log('🎫 MULTI-PLATFORM POSTING LOG');
console.log('='.repeat(50));
console.log(summaryText);
console.log(`⏱️  Total Duration: ${executionLog.performance.totalDuration}ms`);
console.log('='.repeat(50));

// Return enhanced data
return [{
  json: {
    ...item,
    executionLog: executionLog,
    summaryText: summaryText,
    logGenerated: true
  }
}];
