// EN: Send notifications to Discord/Telegram about posting results
// DE: Sende Benachrichtigungen an Discord/Telegram über Posting-Ergebnisse

const item = $input.item.json;
const axios = require('axios');

async function sendDiscordNotification(webhookUrl, message) {
  try {
    await axios.post(webhookUrl, {
      content: message,
      embeds: [{
        title: "🎫 Multi-Platform Event Posting",
        description: item.summaryText,
        color: item.executionLog?.summary?.failed > 0 ? 0xff0000 : 0x00ff00,
        fields: [
          {
            name: "📊 Results",
            value: `✅ ${item.executionLog?.summary?.successful || 0} | ❌ ${item.executionLog?.summary?.failed || 0} | ⏭️ ${item.executionLog?.summary?.skipped || 0}`,
            inline: true
          },
          {
            name: "⏱️ Duration",
            value: `${item.executionLog?.performance?.totalDuration || 0}ms`,
            inline: true
          },
          {
            name: "📅 Event",
            value: `${item.eventTitle} - ${item.formattedDate}`,
            inline: false
          }
        ],
        timestamp: new Date().toISOString()
      }]
    });
    return { platform: 'discord', success: true };
  } catch (error) {
    return { platform: 'discord', success: false, error: error.message };
  }
}

async function sendTelegramNotification(botToken, chatId, message) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    return { platform: 'telegram', success: true };
  } catch (error) {
    return { platform: 'telegram', success: false, error: error.message };
  }
}

async function main() {
  const notifications = [];

  // Discord Notification
  const discordWebhook = $env.DISCORD_WEBHOOK_URL;
  if (discordWebhook) {
    console.log('📢 Sending Discord notification...');
    const discordResult = await sendDiscordNotification(discordWebhook, item.summaryText);
    notifications.push(discordResult);

    if (discordResult.success) {
      console.log('✅ Discord notification sent');
    } else {
      console.error('❌ Discord notification failed:', discordResult.error);
    }
  }

  // Telegram Notification
  const telegramBotToken = $env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = $env.TELEGRAM_CHAT_ID;

  if (telegramBotToken && telegramChatId) {
    console.log('📢 Sending Telegram notification...');

    // Format message for Telegram (HTML)
    const telegramMessage = `
🎫 <b>Multi-Platform Event Posting</b>

📅 <b>${item.eventTitle}</b>
📍 ${item.venue}, ${item.city}
🕐 ${item.formattedDate}

📊 <b>Results:</b>
✅ Successful: ${item.executionLog?.summary?.successful || 0}
❌ Failed: ${item.executionLog?.summary?.failed || 0}
⏭️ Skipped: ${item.executionLog?.summary?.skipped || 0}

⏱️ Duration: ${item.executionLog?.performance?.totalDuration || 0}ms
    `.trim();

    const telegramResult = await sendTelegramNotification(telegramBotToken, telegramChatId, telegramMessage);
    notifications.push(telegramResult);

    if (telegramResult.success) {
      console.log('✅ Telegram notification sent');
    } else {
      console.error('❌ Telegram notification failed:', telegramResult.error);
    }
  }

  // If no notification methods configured, log to console
  if (notifications.length === 0) {
    console.log('ℹ️  No notification methods configured');
    console.log('📊 Posting Summary:');
    console.log(item.summaryText);
  }

  return [{
    json: {
      ...item,
      notifications: notifications,
      notificationsSent: notifications.length > 0,
      notificationTimestamp: new Date().toISOString()
    }
  }];
}

return main();
