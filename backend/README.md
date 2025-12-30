# 🚀 EventPromoter Backend

Express/TypeScript API für Konfigurationsmanagement. Läuft auf Port 4000 und managed alle Settings-Dateien.

## 📦 Installation & Start

```bash
cd backend
npm install
npm run dev    # Development mit auto-reload
npm run build  # Production build
npm start      # Production server
```

## 🔌 API Endpoints

### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-12-30T12:00:00.000Z"
}
```

### Email Konfiguration
```http
GET  /api/config/emails
POST /api/config/emails
```
**GET Response:**
```json
{
  "recipients": ["email1@example.com", "email2@example.com"],
  "groups": {
    "DJs": ["dj@example.com"],
    "Venues": ["venue@example.com"]
  }
}
```

### Reddit Konfiguration
```http
GET  /api/config/reddit
POST /api/config/reddit
```
**GET Response:**
```json
{
  "availableSubreddits": ["DJs", "Techno", "berlin"],
  "selectedSubreddit": "DJs",
  "defaultSubreddits": ["DJs", "Techno"]
}
```

### App Einstellungen
```http
GET  /api/config/app
POST /api/config/app
```
**GET Response:**
```json
{
  "darkMode": false,
  "version": "1.0.0",
  "lastUpdated": "2025-12-30T12:00:00.000Z"
}
```

## 📁 Konfigurationsdateien

Die API liest/schreibt diese Dateien:

```
backend/../config/
├── emails.json    ← Email-Empfänger & Gruppen
├── reddit.json    ← Reddit-Subreddits
├── app.json       ← App-Einstellungen
└── README.md      ← Anleitung für User
```

## 🔗 n8n Integration

Die Config-Dateien können von n8n verwendet werden:

1. **n8n HTTP Request Node** → `GET http://localhost:4000/api/config/twitter`
2. **Credentials aus JSON extrahieren**
3. **API Calls zu Social Media Platforms**

### Beispiel n8n Workflow:
```
Webhook → HTTP Request (get config) → Set Credentials → API Call → Success
```

## 🛠️ Erweitern

### Neue Platform-Konfiguration hinzufügen:

1. **Konfigurationsdatei erstellen:**
```bash
touch ../config/discord.json
```

2. **Inhalt hinzufügen:**
```json
{
  "description": "Discord webhook configuration",
  "enabled": false,
  "webhookUrl": "",
  "botToken": "",
  "channelId": "",
  "autoPost": true,
  "lastUpdated": "2025-12-30T12:00:00.000Z"
}
```

3. **API ist automatisch verfügbar:**
```http
GET  /api/config/discord
POST /api/config/discord
```

4. **Frontend Panel erstellen:**
```jsx
// In deinem React Component:
const loadDiscordConfig = async () => {
  const response = await fetch('http://localhost:4000/api/config/discord')
  const config = await response.json()
  // ... use config
}
```

## 🔧 Was du hinzufügen könntest:

### Weitere Features:
- **Validation** für Config-Daten (z.B. Email-Format, URL-Format)
- **Backup/Restore** Endpoints für alle Configs
- **Bulk Import/Export** aller Konfigurationen
- **Versionierung** für Config-Änderungen
- **Environment-spezifische Configs** (dev/staging/prod)
- **Credential Encryption** für sensitive Daten
- **Config Schema Validation** mit JSON Schema

### Monitoring & Logging:
- **Config Change History** (wann wurde was geändert)
- **Error Logging** für fehlgeschlagene Saves
- **Health Checks** für alle Config-Dateien

### UI Enhancements:
- **Config Editor** direkt im Frontend
- **Import/Export Dialoge** für alle Configs
- **Validation Feedback** in Echtzeit
- **Backup & Restore** Buttons

## 🐛 Development

```bash
npm run dev  # tsx watch mode
```

**Hot Reload:** Änderungen werden automatisch neu kompiliert.

## 🚀 Production

```bash
npm run build  # Erstellt dist/
npm start       # Startet production server
```

## 📋 Dependencies

- **express** - Web framework
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Security middleware
- **tsx** - TypeScript execution (dev)
- **typescript** - TypeScript compiler

## 🔒 Security

- CORS nur für localhost:3000 erlaubt
- Helmet für grundlegende Sicherheit
- Keine Authentifizierung (lokales Tool)

Für Production: Füge Auth/Token hinzu!
