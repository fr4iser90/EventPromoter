# Helper-System: Betroffene Dateien Analyse

## Übersicht

Diese Analyse listet alle Dateien auf, die für die Implementierung des Helper-Systems betroffen sind:
- ✅ **Neue Dateien** die erstellt werden müssen
- 🔧 **Bestehende Dateien** die erweitert werden müssen
- 📝 **Optionale Dateien** für Beispiele/Dokumentation

---

## 1. Backend - Neue Dateien

### 1.1 Helper-Service & Controller

#### ✅ `backend/src/services/helperService.ts` (NEU)
- **Zweck**: Lädt Helper-Content aus Platform-spezifischen und globalen Helper-Dateien
- **Funktionen**:
  - `getPlatformHelpers()` - Lädt alle Helper für eine Platform
  - `getHelperContent()` - Lädt spezifischen Helper
  - `loadHelperIndex()` - Lädt Helper-Index JSON
  - `loadMarkdownContent()` - Lädt Markdown-Dateien
  - Caching-Mechanismus (ähnlich wie Translation-Loader)

#### ✅ `backend/src/controllers/helperController.ts` (NEU)
- **Zweck**: API-Endpoints für Helper-Requests
- **Endpoints**:
  - `GET /api/helpers` - Alle Helper für eine Platform
  - `GET /api/helpers/:helperId` - Spezifischer Helper

#### ✅ `backend/src/routes/helpers.ts` (NEU)
- **Zweck**: Route-Definitionen für Helper-API
- **Routes**:
  - `router.get('/', HelperController.getHelpers)`
  - `router.get('/:helperId', HelperController.getHelper)`

### 1.2 Globale Helper-Dateien

#### ✅ `backend/src/helpers/index.json` (NEU)
- **Zweck**: Globale Helper-Metadaten (Fallback für alle Platforms)
- **Struktur**: Helper-Index mit `displayMode`, `type`, `content`, etc.

#### ✅ `backend/src/helpers/upload.md` (NEU)
- **Zweck**: Globale Upload-Hilfe (Markdown)
- **Inhalt**: Unterstützte Formate, Dateigrößen, Upload-Methoden, Info-Dateien

#### ✅ `backend/src/helpers/editor.md` (NEU - optional)
- **Zweck**: Globale Editor-Hilfe
- **Inhalt**: Allgemeine Editor-Funktionen

#### ✅ `backend/src/helpers/settings.md` (NEU - optional)
- **Zweck**: Globale Settings-Hilfe
- **Inhalt**: Allgemeine Settings-Erklärungen

### 1.3 Platform-spezifische Helper-Dateien (Beispiele)

#### ✅ `backend/src/platforms/email/helpers/index.json` (NEU)
- **Zweck**: Email-spezifische Helper-Metadaten
- **Beispiele**: `editor.subject`, `settings.smtp.host`, etc.

#### ✅ `backend/src/platforms/email/helpers/upload.md` (NEU - optional)
- **Zweck**: Email-spezifische Upload-Hilfe
- **Inhalt**: Email-spezifische Besonderheiten (z.B. Attachment-Größen)

#### ✅ `backend/src/platforms/instagram/helpers/index.json` (NEU)
- **Zweck**: Instagram-spezifische Helper
- **Beispiele**: `upload.formats`, `editor.image`, etc.

#### ✅ `backend/src/platforms/instagram/helpers/upload.md` (NEU - optional)
- **Zweck**: Instagram-spezifische Upload-Hilfe
- **Inhalt**: Bildanforderungen, Seitenverhältnisse, etc.

**Hinweis**: Für jede Platform können Helper-Dateien erstellt werden. Die Struktur ist:
```
platforms/{platformId}/helpers/
├── index.json
├── upload.md (optional)
├── editor.md (optional)
├── settings.md (optional)
└── panel.md (optional)
```

---

## 2. Backend - Bestehende Dateien (Erweiterungen)

### 2.1 Routes

#### 🔧 `backend/src/routes/index.ts`
- **Änderung**: Helper-Route hinzufügen
- **Code**:
```typescript
import helperRoutes from './helpers.js'
// ...
router.use('/helpers', helperRoutes)
```

### 2.2 Types

#### 🔧 `backend/src/types/platformSchema.ts`
- **Änderung**: `helper` Feld zu `FieldDefinition` und `BlockDefinition` hinzufügen
- **Code**:
```typescript
export interface FieldDefinition {
  // ... existing fields
  helper?: string  // Helper-ID (optional)
  // ...
}

export interface ContentBlock {
  // ... existing fields
  helper?: string  // Helper-ID (optional)
  // ...
}
```

### 2.3 Platform-Schemas (Beispiele)

#### 🔧 `backend/src/platforms/email/schema/editor.ts`
- **Änderung**: Helper-IDs zu Editor-Blocks hinzufügen
- **Beispiel**:
```typescript
blocks: [
  {
    id: 'subject',
    type: 'text',
    label: 'Subject',
    helper: 'editor.subject',  // ← NEU
    // ...
  }
]
```

#### 🔧 `backend/src/platforms/email/schema/settings.ts`
- **Änderung**: Helper-IDs zu Settings-Fields hinzufügen
- **Beispiel**:
```typescript
fields: [
  {
    name: 'host',
    type: 'text',
    label: 'SMTP Host',
    helper: 'settings.smtp.host',  // ← NEU
    // ...
  }
]
```

**Betroffene Platform-Schema-Dateien** (31 Dateien):
- `email/schema/editor.ts`
- `email/schema/settings.ts`
- `email/schema/panel.ts`
- `instagram/schema/editor.ts`
- `instagram/schema/settings.ts`
- `instagram/schema/panel.ts`
- `twitter/schema/editor.ts`
- `twitter/schema/settings.ts`
- `twitter/schema/panel.ts`
- `facebook/schema/editor.ts`
- `facebook/schema/settings.ts`
- `facebook/schema/panel.ts`
- `linkedin/schema/editor.ts`
- `linkedin/schema/settings.ts`
- `linkedin/schema/panel.ts`
- `reddit/schema/editor.ts`
- `reddit/schema/settings.ts`
- `reddit/schema/panel.ts`
- ... (und weitere)

**Hinweis**: Helper-IDs müssen nicht sofort in allen Schemas hinzugefügt werden. Sie können schrittweise ergänzt werden.

---

## 3. Frontend - Neue Dateien

### 3.1 Helper-Komponente

#### ✅ `frontend/src/shared/components/ui/HelperIcon.jsx` (NEU)
- **Zweck**: Wiederverwendbare Helper-Icon-Komponente
- **Features**:
  - Lädt Helper-Content vom Backend
  - Respektiert `displayMode` (tooltip/dialog/inline)
  - Unterstützt Markdown-Rendering
  - Mehrsprachig (i18n)

### 3.2 Helper-Hook (optional)

#### ✅ `frontend/src/shared/hooks/useHelper.js` (NEU - optional)
- **Zweck**: Hook zum Laden von Helper-Content
- **Features**:
  - Caching von Helper-Content
  - Automatisches Laden bei Sprachwechsel
  - Fehlerbehandlung

---

## 4. Frontend - Bestehende Dateien (Erweiterungen)

### 4.1 Schema-Renderer

#### 🔧 `frontend/src/features/schema/components/Renderer.jsx`
- **Änderung**: HelperIcon neben Feldern rendern
- **Code** (in `renderField` Funktion):
```jsx
import HelperIcon from '../../../shared/components/ui/HelperIcon'

// In renderField Funktion:
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  {renderField(...)}
  {field.helper && (
    <HelperIcon 
      helperId={field.helper}
      platformId={platformId}
      context={`field.${field.name}`}
      size="small"
    />
  )}
</Box>
```

### 4.2 Platform-Editor

#### 🔧 `frontend/src/features/platform/components/Editor.jsx`
- **Änderung**: HelperIcon für Editor-Blocks
- **Code** (in Block-Rendering):
```jsx
import HelperIcon from '../../../shared/components/ui/HelperIcon'

// Beim Rendern von Blocks:
{block.helper && (
  <HelperIcon 
    helperId={block.helper}
    platformId={platform}
    context={`block.${block.id}`}
    size="small"
  />
)}
```

### 4.3 Settings-Modal

#### 🔧 `frontend/src/features/platform/components/SettingsModal.jsx`
- **Änderung**: HelperIcon für Settings-Fields
- **Code**: Ähnlich wie Schema-Renderer

### 4.4 Panel-Komponente

#### 🔧 `frontend/src/features/platform/components/Panel.jsx`
- **Änderung**: HelperIcon für Panel-Fields
- **Code**: Ähnlich wie Schema-Renderer

### 4.5 Upload-Komponente

#### 🔧 `frontend/src/flows/upload/FileUpload.jsx`
- **Änderung**: HelperIcon für Upload-Bereich
- **Code**:
```jsx
import HelperIcon from '../../../shared/components/ui/HelperIcon'

// Im Upload-Bereich:
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Typography variant="h6">
    {t('fileUpload.title')}
  </Typography>
  <HelperIcon 
    helperId="upload"
    context="upload"
    size="small"
  />
</Box>
```

### 4.6 Package.json (Frontend)

#### 🔧 `frontend/package.json`
- **Änderung**: `react-markdown` Dependency hinzufügen (für Markdown-Rendering)
- **Code**:
```json
{
  "dependencies": {
    "react-markdown": "^9.0.0"
  }
}
```

---

## 5. Dokumentation

### 5.1 Neue Dokumentation

#### ✅ `docs/development/helper-system.md` (NEU)
- **Zweck**: Entwickler-Dokumentation für Helper-System
- **Inhalt**:
  - Wie Helper erstellt werden
  - Helper-Index-Struktur
  - Platform-spezifische Helper
  - Frontend-Integration

#### ✅ `docs/development/helper-examples.md` (NEU - optional)
- **Zweck**: Beispiele für Helper-Implementierungen
- **Inhalt**: Konkrete Beispiele für verschiedene Helper-Typen

### 5.2 Bestehende Dokumentation (Erweiterungen)

#### 🔧 `docs/development/adding-new-platforms.md`
- **Änderung**: Abschnitt über Helper-System hinzufügen
- **Inhalt**: Wie Helper für neue Platforms erstellt werden

#### 🔧 `backend/src/platforms/_blueprint/README.md`
- **Änderung**: Helper-System in Blueprint-Dokumentation aufnehmen
- **Inhalt**: Helper-Struktur für neue Platforms

---

## 6. Zusammenfassung

### Neue Dateien (Backend)
- ✅ `backend/src/services/helperService.ts`
- ✅ `backend/src/controllers/helperController.ts`
- ✅ `backend/src/routes/helpers.ts`
- ✅ `backend/src/helpers/index.json`
- ✅ `backend/src/helpers/upload.md`
- ✅ `backend/src/platforms/{platformId}/helpers/index.json` (für jede Platform)
- ✅ `backend/src/platforms/{platformId}/helpers/*.md` (optional, pro Platform)

### Neue Dateien (Frontend)
- ✅ `frontend/src/shared/components/ui/HelperIcon.jsx`
- ✅ `frontend/src/shared/hooks/useHelper.js` (optional)

### Erweiterte Dateien (Backend)
- 🔧 `backend/src/routes/index.ts`
- 🔧 `backend/src/types/platformSchema.ts`
- 🔧 `backend/src/platforms/{platformId}/schema/*.ts` (31+ Dateien, optional/schrittweise)

### Erweiterte Dateien (Frontend)
- 🔧 `frontend/src/features/schema/components/Renderer.jsx`
- 🔧 `frontend/src/features/platform/components/Editor.jsx`
- 🔧 `frontend/src/features/platform/components/SettingsModal.jsx`
- 🔧 `frontend/src/features/platform/components/Panel.jsx`
- 🔧 `frontend/src/flows/upload/FileUpload.jsx`
- 🔧 `frontend/package.json`

### Dokumentation
- ✅ `docs/development/helper-system.md`
- 🔧 `docs/development/adding-new-platforms.md`
- 🔧 `backend/src/platforms/_blueprint/README.md`

---

## 7. Implementierungs-Reihenfolge

### Phase 1: Backend-Infrastruktur
1. ✅ `backend/src/services/helperService.ts` erstellen
2. ✅ `backend/src/controllers/helperController.ts` erstellen
3. ✅ `backend/src/routes/helpers.ts` erstellen
4. ✅ `backend/src/routes/index.ts` erweitern
5. ✅ `backend/src/types/platformSchema.ts` erweitern

### Phase 2: Globale Helper
1. ✅ `backend/src/helpers/index.json` erstellen
2. ✅ `backend/src/helpers/upload.md` erstellen

### Phase 3: Frontend-Komponente
1. ✅ `frontend/package.json` erweitern (react-markdown)
2. ✅ `frontend/src/shared/components/ui/HelperIcon.jsx` erstellen

### Phase 4: Frontend-Integration
1. ✅ `frontend/src/features/schema/components/Renderer.jsx` erweitern
2. ✅ `frontend/src/flows/upload/FileUpload.jsx` erweitern
3. ✅ `frontend/src/features/platform/components/Editor.jsx` erweitern
4. ✅ `frontend/src/features/platform/components/SettingsModal.jsx` erweitern
5. ✅ `frontend/src/features/platform/components/Panel.jsx` erweitern

### Phase 5: Platform-spezifische Helper (schrittweise)
1. ✅ `backend/src/platforms/email/helpers/index.json` erstellen
2. ✅ `backend/src/platforms/instagram/helpers/index.json` erstellen
3. ✅ Weitere Platforms nach Bedarf

### Phase 6: Schema-Integration (schrittweise)
1. ✅ Helper-IDs zu ausgewählten Schema-Dateien hinzufügen
2. ✅ Testen und iterieren

### Phase 7: Dokumentation
1. ✅ `docs/development/helper-system.md` erstellen
2. ✅ Bestehende Dokumentation erweitern

---

## 8. Wichtige Hinweise

### ⚠️ Breaking Changes
- **Keine**: Das Helper-System ist vollständig optional
- Helper-Felder in Schemas sind optional (`helper?: string`)
- Frontend-Komponenten funktionieren auch ohne Helper

### ⚠️ Abhängigkeiten
- **Frontend**: `react-markdown` muss installiert werden
- **Backend**: Keine neuen Dependencies nötig

### ⚠️ Migration
- **Keine Migration nötig**: Bestehende Platforms funktionieren ohne Helper
- Helper können schrittweise hinzugefügt werden
- Keine Datenbank-Änderungen nötig

### ⚠️ Testing
- Helper-Service testen (Unit-Tests)
- Helper-Controller testen (Integration-Tests)
- Frontend HelperIcon-Komponente testen
- End-to-End Tests für Helper-Integration

---

## 9. Datei-Statistik

| Kategorie | Anzahl | Status |
|-----------|--------|--------|
| **Neue Backend-Dateien** | ~15-20 | Zu erstellen |
| **Neue Frontend-Dateien** | 1-2 | Zu erstellen |
| **Erweiterte Backend-Dateien** | ~35+ | Zu erweitern |
| **Erweiterte Frontend-Dateien** | ~6 | Zu erweitern |
| **Dokumentation** | 3 | Zu erstellen/erweitern |
| **Gesamt** | ~60+ | |

**Hinweis**: Viele Dateien können schrittweise erweitert werden. Nicht alle müssen sofort geändert werden.

---

## 10. Nächste Schritte

1. ✅ **Analyse abgeschlossen** - Diese Datei
2. ⏭️ **Backend-Infrastruktur implementieren** (Phase 1)
3. ⏭️ **Globale Helper erstellen** (Phase 2)
4. ⏭️ **Frontend-Komponente implementieren** (Phase 3)
5. ⏭️ **Frontend-Integration** (Phase 4)
6. ⏭️ **Platform-spezifische Helper** (Phase 5)
7. ⏭️ **Schema-Integration** (Phase 6)
8. ⏭️ **Dokumentation** (Phase 7)
