# Platform Blueprint & Validation Guide

## ✅ Backend-Analyse: Vollständig generisch & zentral

### Was bereits funktioniert:

1. **✅ Zentrale Discovery/Registry**
   - `PlatformRegistry` - Zentraler Service für alle Platforms
   - `platformDiscovery.ts` - Automatische Discovery beim Start
   - Keine manuelle Registrierung nötig

2. **✅ Validierungen**
   - `schemaValidator.ts` - Vollständige Schema-Validierung
   - `PlatformRegistry.validatePlatform()` - Platform-Struktur-Validierung
   - Automatische Validierung beim Discovery

3. **✅ Generische Routes**
   - `/api/platforms/:platformId/*` - Alle Routes sind generisch
   - Keine hardcoded Platform-Routes

4. **✅ Schema-Driven**
   - Alle UI-Komponenten kommen aus Schema
   - Frontend ist vollständig generisch

### ⚠️ Noch zu verbessern:

1. **Hardcoded Logik in `platformController.ts`**
   - `generateFieldConfig()` hat hardcoded Instagram/Reddit/Email-Logik
   - `EmailRecipientService` direkt importiert
   - **Lösung**: Diese Methoden entfernen/refactoren

2. **Kein Blueprint-Script**
   - Blueprint existiert jetzt, aber kein Generator-Script
   - **Lösung**: Optional - kann manuell kopiert werden

## 📋 Blueprint-Verwendung

### Schritt 1: Blueprint kopieren

```bash
cd backend/src/platforms
cp -r _blueprint myplatform
cd myplatform
```

### Schritt 2: Platzhalter ersetzen

Ersetze in allen Dateien:
- `PLATFORM_ID` → Deine Platform-ID (z.B. `discord`)
- `PLATFORM_DISPLAY_NAME` → Anzeigename (z.B. `Discord`)
- `PLATFORM_DESCRIPTION` → Beschreibung

**Automatisch mit sed:**
```bash
find . -type f -name "*.ts" -exec sed -i 's/PLATFORM_ID/discord/g' {} +
find . -type f -name "*.ts" -exec sed -i 's/PLATFORM_DISPLAY_NAME/Discord/g' {} +
find . -type f -name "*.ts" -exec sed -i 's/PLATFORM_DESCRIPTION/Discord integration/g' {} +
```

### Schritt 3: Anpassen

1. **schema.ts**: Anpassen an deine Platform-Anforderungen
2. **parser.ts**: Event-Daten-Parsing implementieren
3. **service.ts**: API-Integration implementieren
4. **validator.ts**: Validierungsregeln anpassen

### Schritt 4: Validierung

Die Platform wird automatisch validiert beim Server-Start:
- ✅ Schema-Struktur
- ✅ Field-Definitionen
- ✅ Block-Definitionen
- ✅ Platform-Module-Struktur

## 🔍 Validierungen

### Automatische Validierungen:

1. **Schema-Validierung** (`schemaValidator.ts`)
   - Settings-Schema
   - Editor-Schema
   - Preview-Schema
   - Template-Schema (optional)
   - Panel-Schema (optional)

2. **Platform-Module-Validierung** (`PlatformRegistry.validatePlatform()`)
   - Metadata vorhanden
   - Schema vorhanden
   - Capabilities vorhanden
   - Service vorhanden
   - Parser vorhanden
   - Validator vorhanden

3. **Discovery-Validierung** (`platformDiscovery.ts`)
   - `index.ts` existiert
   - Default-Export vorhanden
   - `PlatformModule` Interface erfüllt

### Validierungs-Fehler beheben:

```bash
# Starte Backend mit Validierung
npm run dev

# Prüfe Logs für Validierungs-Fehler
# Beispiel:
# ❌ Platform discord has invalid schema: Field 'apiKey' is required
# ✅ Platform discord registered successfully
```

## 📁 Blueprint-Struktur

```
_blueprint/
├── README.md          # Blueprint-Dokumentation
├── index.ts           # Platform-Module (MUSS existieren)
├── schema.ts          # Platform-Schema (MUSS existieren)
├── parser.ts          # Content-Parser (MUSS existieren)
├── service.ts         # Platform-Service (MUSS existieren)
└── validator.ts       # Content-Validator (MUSS existieren)
```

## ✅ Checkliste für neue Platform

- [ ] Blueprint kopiert und Platzhalter ersetzt
- [ ] `schema.ts` angepasst (Settings, Editor, Preview, Template)
- [ ] `parser.ts` implementiert
- [ ] `service.ts` implementiert (publish, validate, transform)
- [ ] `validator.ts` implementiert (validate, getLimits)
- [ ] `index.ts` exportiert default `PlatformModule`
- [ ] Server gestartet und Platform entdeckt
- [ ] API-Endpoint `/api/platforms/myplatform` funktioniert
- [ ] Schema-Endpoint `/api/platforms/myplatform/schema` funktioniert
- [ ] Frontend zeigt Platform automatisch an

## 🚀 Beispiel: Discord Platform hinzufügen

```bash
# 1. Blueprint kopieren
cd backend/src/platforms
cp -r _blueprint discord

# 2. Platzhalter ersetzen
cd discord
find . -type f -name "*.ts" -exec sed -i 's/PLATFORM_ID/discord/g' {} +
find . -type f -name "*.ts" -exec sed -i 's/PLATFORM_DISPLAY_NAME/Discord/g' {} +
find . -type f -name "*.ts" -exec sed -i 's/PLATFORM_DESCRIPTION/Discord webhook integration/g' {} +

# 3. Schema anpassen (Discord-spezifisch)
# - settings: webhookUrl statt apiKey
# - editor: blocks für Discord-Format
# - preview: Discord-Embed-Style

# 4. Service implementieren
# - publish(): Discord Webhook API call

# 5. Server starten
npm run dev

# 6. Testen
curl http://localhost:4000/api/platforms/discord
```

## 📝 Nächste Schritte

1. **Hardcoded Logik entfernen** (optional)
   - `generateFieldConfig()` aus `platformController.ts` entfernen
   - `EmailRecipientService` Import generisch machen

2. **Blueprint-Script erstellen** (optional)
   - `scripts/create-platform.js` für automatische Generierung

3. **Weitere Validierungen** (optional)
   - Template-Validierung
   - API-Endpoint-Validierung
   - Rate-Limit-Validierung

## ✅ Fazit

**Das Backend ist bereits vollständig generisch und zentral!**

- ✅ Neue Platform = Nur Ordner hinzufügen
- ✅ Automatische Discovery & Validierung
- ✅ Keine manuelle Registrierung nötig
- ✅ Blueprint vorhanden
- ✅ Validierungen vorhanden

**Einzige Verbesserung:** Hardcoded Logik in `platformController.ts` entfernen (optional).

