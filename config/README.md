# 📁 Configuration Files

Diese Dateien enthalten alle **öffentlichen** Einstellungen für dein EventPromoter-System.

## 🔐 Sicherheitshinweis

**Sensible Daten (API-Keys, Passwörter, Tokens) sind in `.env` ausgelagert!**

- ✅ **Config-Dateien:** Öffentliche Einstellungen (E-Mail-Listen, Hashtags, etc.)
- 🔴 **`.env`-Datei:** Secrets (API-Keys, SMTP-Passwörter)
- 🚫 **Niemals `.env` ins Git committen!**

## 📄 Einheitliches Config-Schema

**Alle Listen-Configs folgen diesem Schema:**

```json
{
  "available": [...],        // Alle verfügbaren Optionen
  "selected": [...],         // Aktuell ausgewählte (leer = alle/keine)
  "groups": {                // Kategorisierung (optional)
    "group1": [...],
    "group2": [...]
  },
  "content": {               // Unterschiedlicher Content (optional)
    "option1": "template1",
    "option2": "template2"
  }
}
```

## 📄 Config-Dateien Übersicht

### 📧 `emails.json` - E-Mail-Konfiguration
```json
{
  "available": ["dj-events@club.com", "events@venue.de"],
  "selected": [],
  "groups": {
    "DJs & Promoter": ["dj-events@club.com"],
    "Venue Manager": ["events@venue.de"]
  }
}
```

### 🏷️ `hashtags.json` - Globale Hashtags
```json
{
  "available": ["#event", "#party", "#techno"],
  "selected": [],
  "groups": {
    "General": ["#event", "#party"],
    "Music": ["#techno"]
  }
}
```

### 📱 `reddit.json` - Reddit-Subreddits
```json
{
  "available": ["DJs", "Techno", "berlin"],
  "selected": [],
  "groups": {
    "Music": ["DJs", "Techno"],
    "Location": ["berlin"]
  }
}
```

### ⚙️ `app.json` - App-Einstellungen
```json
{
  "n8nWebhookUrl": "http://localhost:5678/webhook/...",
  "darkMode": false
}
```

### 🐦 `twitter.json` - Twitter/X Settings
```json
{
  "enabled": false
}
```

### 📸 `instagram.json` - Instagram Settings
```json
{
  "enabled": false
}
```

### 📘 `facebook.json` - Facebook Settings
```json
{
  "enabled": false
}
```

### 💼 `linkedin.json` - LinkedIn Settings
```json
{
  "enabled": false
}
```

## 🚀 Verwendung

**Frontend** lädt Configs über API: `/api/config/{filename}`  
**Backend** lädt Secrets aus `.env` mit `process.env.VARIABLE_NAME`

**Perfekt einheitlich strukturiert!** ✅