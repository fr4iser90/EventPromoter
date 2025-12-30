# Platform-Specific Configurations

Diese Dateien enthalten die plattformspezifischen Konfigurationen für den Multi-Platform Publisher.

## 📧 Email-Konfiguration (`email.json`)

### Empfängerlisten anpassen:

```json
{
  "recipients": {
    "defaultLists": {
      "fans": [
        "fan1@domain.com",
        "fan2@domain.com"
      ],
      "vip": [
        "vip1@domain.com"
      ],
      "press": [
        "press@news.com"
      ]
    }
  }
}
```

### Verwendung im Workflow:

Die Email-Empfänger werden automatisch aus diesen Listen geladen basierend auf:
- `publishTo.email: true` → Sendet an alle in der "fans" Liste
- Zusätzliche Listen können über `emailRecipients` im Input spezifiziert werden

## 🔴 Reddit-Konfiguration (`reddit.json`)

### Erlaubte Subreddits definieren:

```json
{
  "posting": {
    "allowedSubreddits": [
      "DJs",
      "Techno",
      "HouseMusic",
      "berlin"
    ],
    "defaultSubreddit": "DJs"
  },
  "subreddits": {
    "DJs": {
      "flair": "Event",
      "nsfw": false
    }
  }
}
```

## 👤 Facebook-Konfiguration (`facebook.json`)

### Facebook Page definieren:

```json
{
  "credentials": {
    "FACEBOOK_PAGE_ID": "123456789",
    "FACEBOOK_PAGE_NAME": "My Event Page"
  },
  "posting": {
    "targetPage": true
  }
}
```

## 📢 Notifications-Konfiguration (`notifications.json`)

### Discord/Telegram Webhooks:

```json
{
  "discord": {
    "webhookUrl": "${DISCORD_WEBHOOK_URL}",
    "embedColor": 3066993
  },
  "telegram": {
    "botToken": "${TELEGRAM_BOT_TOKEN}",
    "chatId": "${TELEGRAM_CHAT_ID}"
  }
}
```

## 🔧 Konfiguration bearbeiten:

1. **Email-Empfänger hinzufügen/entfernen**: Bearbeite `email.json`
2. **Reddit-Subreddits anpassen**: Bearbeite `reddit.json`
3. **Facebook-Seite ändern**: Bearbeite `facebook.json`
4. **Notifications konfigurieren**: Bearbeite `notifications.json`
5. **Workflow neu bauen**: `npm run build`

Die Konfigurationen werden automatisch beim Bauen des Workflows geladen und angewendet.
