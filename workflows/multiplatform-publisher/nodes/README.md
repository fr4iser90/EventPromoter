# 📦 Node-Dateien Struktur

Die Nodes sind jetzt in separate Dateien aufgeteilt für bessere Übersicht und einfachere Bearbeitung.

## 📁 Struktur

```
nodes/
├── core/                    # Core-Workflow Nodes
│   ├── webhook-trigger.json
│   ├── structure-response.json
│   └── webhook-response.json
└── platforms/              # Platform-spezifische Nodes
    ├── twitter.json
    ├── instagram.json
    ├── facebook.json
    ├── linkedin.json
    ├── reddit.json
    └── email.json
```

## ✏️ Bearbeiten

### Eine Node bearbeiten
1. Öffne die entsprechende `.json` Datei (z.B. `platforms/twitter.json`)
2. Bearbeite die Node-Definition
3. Führe `node build.js` aus

### Neue Node hinzufügen
1. Füge die Node-Definition zur entsprechenden `.json` Datei hinzu
2. Aktualisiere die `connections` in `config.json`
3. Führe `node build.js` aus

### Script ändern
1. Bearbeite die `.js` Datei in `scripts/` (z.B. `scripts/email-prepare.js`)
2. Führe `node build.js` aus

## 📝 Format

### Einzelne Node (Object)
```json
{
  "id": "node-id",
  "name": "Node Name",
  "type": "code",
  "script": "script-name.js",
  "parameters": {
    "mode": "runOnceForEachItem"
  },
  "position": [100, 200],
  "typeVersion": 2
}
```

### Mehrere Nodes (Array)
```json
[
  {
    "id": "node-1",
    "name": "Node 1",
    ...
  },
  {
    "id": "node-2",
    "name": "Node 2",
    ...
  }
]
```

## 🔗 Script-Referenzen

Wenn eine Node ein Script verwendet, referenziere es mit:
```json
{
  "type": "code",
  "script": "script-name.js"  // Ohne Pfad, nur Dateiname
}
```

Die Scripts müssen im `scripts/` Ordner liegen.
