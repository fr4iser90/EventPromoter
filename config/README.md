# 📁 Configuration Files

Diese Dateien enthalten alle Einstellungen für dein EventPromoter-System. **Bearbeite sie direkt in deinem Code-Editor!**

## 📧 `emails.json` - Email-Konfiguration
```json
{
  "recipients": ["email1@example.com", "email2@example.com"],
  "groups": {
    "DJs": ["dj@example.com"],
    "Venues": ["venue@example.com"]
  }
}
```

## 🔴 `reddit.json` - Reddit-Subreddits
```json
{
  "availableSubreddits": ["DJs", "Techno", "berlin"],
  "selectedSubreddit": "",
  "defaultSubreddits": ["DJs", "Techno"]
}
```

## ⚙️ `app.json` - App-Einstellungen
```json
{
  "darkMode": false,
  "version": "1.0.0",
  "lastUpdated": "2025-12-30T12:00:00.000Z"
}
```

## 🐦 `twitter.json` - Twitter/X API
```json
{
  "enabled": false,
  "apiKey": "",
  "apiSecret": "",
  "accessToken": "",
  "accessTokenSecret": "",
  "bearerToken": "",
  "webhookUrl": "",
  "autoPost": true,
  "hashtags": ["#event", "#party"]
}
```

## 📸 `instagram.json` - Instagram API
```json
{
  "enabled": false,
  "username": "",
  "password": "",
  "appId": "",
  "appSecret": "",
  "accessToken": "",
  "webhookUrl": "",
  "autoPost": true,
  "hashtags": ["#event", "#party", "#instagram"]
}
```

## 📘 `facebook.json` - Facebook API
```json
{
  "enabled": false,
  "appId": "",
  "appSecret": "",
  "pageId": "",
  "pageAccessToken": "",
  "webhookUrl": "",
  "autoPost": true,
  "hashtags": ["#event", "#party", "#facebook"]
}
```

## 💼 `linkedin.json` - LinkedIn API
```json
{
  "enabled": false,
  "clientId": "",
  "clientSecret": "",
  "accessToken": "",
  "refreshToken": "",
  "organizationId": "",
  "webhookUrl": "",
  "autoPost": true,
  "hashtags": ["#event", "#party", "#linkedin", "#networking"]
}
```

## 🚀 Wie benutzt du es:

1. **Bearbeite die JSON-Dateien** in deinem Editor
2. **Speichere sie** (Ctrl+S)
3. **Refresh deine Browser-Tab** - die Änderungen sind sofort aktiv!

## 🔄 Automatische Synchronisation:

- **Frontend → Dateien**: Änderungen im UI werden automatisch gespeichert
- **Dateien → Frontend**: Beim nächsten Laden werden die Dateien gelesen

## 📂 Alle Dateien:

```
EventPromoter/config/
├── emails.json      ← Email-Listen & Gruppen
├── reddit.json      ← Reddit-Subreddits
├── app.json         ← App-Einstellungen (Dark Mode, etc.)
├── twitter.json     ← Twitter API Credentials
├── instagram.json   ← Instagram API Credentials
├── facebook.json    ← Facebook API Credentials
├── linkedin.json    ← LinkedIn API Credentials
└── README.md        ← Diese Anleitung
```

## 💡 Tipps:

- **API Credentials**: Trage deine echten API Keys ein
- **enabled**: Auf `true` setzen um Platform zu aktivieren
- **hashtags**: Platform-spezifische Hashtags definieren
- **Versionierung**: Committen für Backup & Versionierung

**Perfekt für Versionierung und Backups!** 🎉
