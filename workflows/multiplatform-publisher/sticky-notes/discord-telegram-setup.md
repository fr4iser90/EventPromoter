# 📢 Discord & Telegram Notifications

## Discord Webhook Setup

1. **Go to your Discord server**
2. **Right-click on a channel** → **Edit Channel** → **Integrations** → **Webhooks**
3. **Create new Webhook** with a name (e.g., "n8n-workflow")
4. **Copy the Webhook URL**

## In n8n Environment Variables:
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

## Telegram Bot Setup

1. **Message @BotFather** on Telegram
2. **Send:** `/newbot`
3. **Follow instructions** to create your bot
4. **Get your Bot Token** from BotFather

## In n8n Environment Variables:
```bash
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

### How to get Chat ID:
1. **Message your bot** with any text
2. **Visit:** `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. **Find your chat ID** in the response

## Features:
- ✅ **Rich Discord embeds** with colors and formatting
- ✅ **HTML Telegram messages** with markup
- ✅ **Success/Failure indicators** with colors
- ✅ **Performance metrics** included
- ✅ **Automatic fallbacks** to console logging

## Example Notification:

**Discord:** Rich embed with event details, success rates, and timing
**Telegram:** Formatted message with HTML markup and statistics

---

*(Doppelklick zum Bearbeiten)*
