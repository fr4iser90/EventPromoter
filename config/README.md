# 📁 Configuration Files

Diese Dateien enthalten alle Einstellungen für dein EventPromoter-System. **Bearbeite sie direkt in deinem Code-Editor!**

## 📧 `emails.json`
```json
{
  "description": "Email recipients configuration",
  "recipients": [
    "dj-events@club.com",
    "booking@venue.de"
  ],
  "groups": {
    "DJs & Promoter": ["dj-events@club.com"],
    "Venue Manager": ["booking@venue.de"]
  }
}
```

**Bearbeiten:**
- `"recipients"`: Array deiner Email-Empfänger
- `"groups"`: Benannte Gruppen für schnelle Auswahl

## 🔴 `reddit.json`
```json
{
  "description": "Reddit subreddits configuration",
  "availableSubreddits": [
    "DJs", "Techno", "berlin"
  ],
  "selectedSubreddit": "",
  "defaultSubreddits": ["DJs", "Techno"]
}
```

**Bearbeiten:**
- `"availableSubreddits"`: Alle verfügbaren Subreddits
- `"defaultSubreddits"`: Subreddits die nicht gelöscht werden können

## ⚙️ `app.json`
```json
{
  "description": "Application settings",
  "darkMode": false,
  "version": "1.0.0",
  "lastUpdated": "2025-12-30"
}
```

**Bearbeiten:**
- `"darkMode"`: `true` für dunklen Modus, `false` für hell

## 🚀 Wie benutzt du es:

1. **Bearbeite die JSON-Dateien** in deinem Editor
2. **Speichere sie** (Ctrl+S)
3. **Refresh deine Browser-Tab** - die Änderungen sind sofort aktiv!

## 🔄 Automatische Synchronisation:

- **Frontend → Dateien**: Änderungen im UI werden automatisch gespeichert
- **Dateien → Frontend**: Beim nächsten Laden werden die Dateien gelesen

## 📂 Dateipfade:

```
EventPromoter/
├── config/
│   ├── emails.json      ← Email-Listen & Gruppen
│   ├── reddit.json      ← Reddit-Subreddits
│   ├── app.json         ← App-Einstellungen
│   └── README.md        ← Diese Datei
```

**Perfekt für Versionierung und Backups!** 🎉
