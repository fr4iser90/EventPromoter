# 🛠️ Modular n8n Workflow Builder

Dieses System ermöglicht es dir, n8n-Workflows modular zu entwickeln, anstatt alles in einer großen JSON-Datei zu bearbeiten.

## 📁 Verzeichnis-Struktur

```
workflows/
├── my-workflow/
│   ├── config.json          # Workflow-Konfiguration (Nodes, Connections, etc.)
│   ├── scripts/             # JavaScript-Codes für Code-Nodes
│   │   ├── validate.js
│   │   ├── process.js
│   │   └── format.js
│   ├── sticky-notes/        # Dokumentation & Hilfetexte (Markdown)
│   │   ├── overview.md
│   │   ├── input-format.md
│   │   └── credentials.md
│   ├── nodes/               # Zusätzliche Node-Definitionen (optional)
│   ├── build.js             # Build-Script für diesen Workflow
│   └── README.md            # Workflow-Dokumentation (optional)
└── README.md                # Diese Datei
```

## 🚀 Schnellstart

### 1. Neuen Workflow erstellen

```bash
# Erstelle Verzeichnis-Struktur
mkdir -p workflows/mein-workflow/scripts

# Erstelle config.json (kopiere von einem bestehenden Workflow)
cp workflows/multiplatform-publisher/config.json workflows/mein-workflow/

# Bearbeite die config.json für deinen Workflow
nano workflows/mein-workflow/config.json
```

### 2. Scripts bearbeiten

Lege deine JavaScript-Codes in separate `.js` Dateien im `scripts/` Ordner ab:

```javascript
// scripts/validate-input.js
const item = $input.item.json;

// Deine Validierungslogik hier
if (!item.name) {
  throw new Error('Name is required');
}

return [{
  json: {
    ...item,
    validated: true,
    timestamp: new Date().toISOString()
  }
}];
```

### 3. Workflow bauen

```bash
# Einzelnen Workflow bauen
cd workflows/mein-workflow
node build.js

# Alle Workflows bauen
cd ../../..
node build-all.js
```

## 📝 Config.json Format

```json
{
  "name": "Mein Workflow",
  "description": "Beschreibung was der Workflow macht",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "webhook-trigger",
      "name": "Webhook",
      "type": "webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "my-endpoint"
      },
      "position": [100, 100]
    },
    {
      "id": "validate-data",
      "name": "Daten validieren",
      "type": "code",
      "script": "validate-input.js",
      "position": [300, 100],
      "typeVersion": 2
    }
  ],
  "connections": {
    "webhook-trigger": {
      "main": [
        [
          {
            "node": "validate-data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 🔧 Verfügbare Node-Typen

- `webhook` → `n8n-nodes-base.webhook`
- `code` → `n8n-nodes-base.code`
- `if` → `n8n-nodes-base.if`
- `set` → `n8n-nodes-base.set`
- `httpRequest` → `n8n-nodes-base.httpRequest`
- `twitter` → `n8n-nodes-base.twitter`
- `instagram` → `n8n-nodes-base.instagram`
- `facebook` → `n8n-nodes-base.facebook`
- `linkedIn` → `n8n-nodes-base.linkedIn`
- `emailSend` → `n8n-nodes-base.emailSend`
- `manualTrigger` → `n8n-nodes-base.manualTrigger`

## 📋 Workflow bearbeiten

1. **Scripts ändern**: Bearbeite die `.js` Dateien im `scripts/` Ordner
2. **Nodes hinzufügen**: Füge neue Nodes zur `config.json` hinzu
3. **Connections ändern**: Aktualisiere die `connections` in der `config.json`
4. **Bauen**: `node build.js` oder `node ../../build-all.js`

## 🎯 Vorteile

- ✅ **Syntax-Highlighting** für JavaScript
- ✅ **Versionierung** einzelner Scripts
- ✅ **Wiederverwendbarkeit** von Scripts
- ✅ **Einfachere Fehlerbehebung**
- ✅ **Teamarbeit** möglich
- ✅ **Modulare Entwicklung**

## 🔄 Migration bestehender Workflows

1. Erstelle neuen Workflow-Ordner: `mkdir workflows/mein-workflow`
2. Extrahiere alle `jsCode` Blöcke in separate `.js` Dateien
3. Kopiere die Node-Struktur in `config.json`
4. Entferne JSON-Escaping (`\\n` → echte Zeilenumbrüche)
5. Teste das Build: `node build.js`

## 🆘 Hilfe

Bei Problemen:
1. Prüfe die `config.json` Syntax
2. Stelle sicher, dass alle Script-Dateien existieren
3. Überprüfe die Node-IDs in den Connections
4. Schaue in die bestehenden Beispiele (multiplatform-publisher)

---

**Erstellt von:** fr4iser
**Version:** 1.0.0
