# i18n System Dokumentation

## Übersicht

Das System verwendet **react-i18next** (Frontend) und **i18next** (Backend) für Internationalisierung.

**Unterstützte Sprachen:** `en` (English), `de` (Deutsch), `es` (Español)

---

## Datei-Struktur

### Frontend Translate-Dateien

```
frontend/src/i18n/
├── index.ts                    # i18n Initialisierung
└── locales/
    ├── en.json                 # ✅ Frontend Common Translations (EN)
    ├── de.json                 # ✅ Frontend Common Translations (DE)
    └── es.json                 # ✅ Frontend Common Translations (ES)
```

**Was gehört hier rein:**
- UI-Strings (Buttons, Labels, Workflow)
- Allgemeine App-Strings
- Template-Management UI
- Common Actions (Save, Cancel, Delete, etc.)

### Backend Translate-Dateien

#### Backend Common
```
backend/src/i18n/
├── index.ts                    # Backend i18n Setup
└── locales/
    ├── en.json                 # ✅ Backend Common (Errors, Validation)
    ├── de.json                 # ✅ Backend Common (Errors, Validation)
    └── es.json                 # ✅ Backend Common (Errors, Validation)
```

**Was gehört hier rein:**
- Error Messages
- Validation Messages
- Backend-spezifische Strings

#### Platform-spezifische Translations
```
backend/src/platforms/{platform}/locales/
├── en.json                     # ✅ Platform-spezifische Translations
├── de.json                     # ✅ Platform-spezifische Translations
└── es.json                     # ✅ Platform-spezifische Translations
```

**Beispiele:**
- `backend/src/platforms/email/locales/en.json`
- `backend/src/platforms/email/locales/de.json`
- `backend/src/platforms/twitter/locales/en.json`
- etc.

**Was gehört hier rein:**
- Platform-spezifische Labels
- Platform-spezifische Beschreibungen
- Platform-spezifische Error Messages

---

## Wie das System funktioniert

### Frontend

1. **Initialisierung:**
   - `frontend/src/i18n/index.ts` lädt Common Translations
   - Automatische Sprach-Erkennung (localStorage, Browser, HTML)

2. **Platform Translations:**
   - Werden dynamisch geladen via `usePlatformTranslations` Hook
   - Endpoint: `GET /api/translations/{platformId}/{lang}`
   - Werden in i18n Namespace `platform.{platformId}.*` gemerged

3. **Verwendung:**
   ```jsx
   import { useTranslation } from 'react-i18next'
   
   const { t } = useTranslation()
   
   // Common translations
   t('common.cancel')
   t('template.applyTemplate')
   
   // Platform translations (nach dem Laden)
   t('platform.email.subject')
   ```

### Backend

1. **Initialisierung:**
   - `backend/src/i18n/index.ts` lädt Common Translations
   - Sprache wird aus HTTP Headers/Query/Cookies erkannt

2. **Platform Translations:**
   - Werden aus `platforms/{platform}/locales/{lang}.json` geladen
   - Via `getPlatformTranslations()` Service

3. **Verwendung:**
   ```typescript
   import i18next from '../i18n'
   
   i18next.t('errors.missing_required_field', { field: 'title' })
   ```

---

## Template Variables System

### Wie Variables funktionieren

**Variables sind NICHT übersetzt** - sie sind Platzhalter für Daten:

```javascript
// Template Content:
"Event: {title} at {venue} on {date}"

// Variables werden ersetzt mit:
{
  title: "Depeche Mode Party",
  venue: "Werk 2, Leipzig",
  date: "2026-05-16"
}

// Ergebnis:
"Event: Depeche Mode Party at Werk 2, Leipzig on 2026-05-16"
```

### Variable-Namen

**Variables sind immer in Englisch** (technische Namen):
- `{title}`, `{venue}`, `{date}`, `{time}`, `{city}`
- `{description}`, `{organizer}`, `{lineup}`
- `{image1}`, `{img1}`, `{image}` (für erste Bild)
- `{ticketInfo}`, `{prepTips}`, `{highlights}` (custom)

**Warum Englisch?**
- Variables sind technische Platzhalter
- Werden durch Daten ersetzt (die können übersetzt sein)
- Template-Struktur bleibt sprachunabhängig

### Template-Content kann übersetzt sein

**Templates selbst können übersetzte Versionen haben:**

```json
{
  "template": {
    "subject": "Event Reminder: {title}",
    "html": "<h1>Event: {title}</h1><p>Date: {date}</p>"
  },
  "translations": {
    "de": {
      "subject": "Event-Erinnerung: {title}",
      "html": "<h1>Event: {title}</h1><p>Datum: {date}</p>"
    }
  }
}
```

**Aber:** Variables (`{title}`, `{date}`) bleiben gleich!

---

## Hardcoded Strings - Aktueller Stand

### ❌ Gefundene Hardcoded Strings in `Selector.jsx`:

1. **Zeile 198-200:** Template Count
   ```jsx
   {templates.length === 0 ? 'No templates' :
    templates.length === 1 ? '1 template' :
    `${templates.length} templates`}
   ```
   **Sollte sein:** `t('template.count', { count: templates.length })`

2. **Zeile 207:** Error Message
   ```jsx
   Error loading templates
   ```
   **Sollte sein:** `t('template.errorLoading')`

3. **Zeile 222:** No Templates Available
   ```jsx
   No templates available
   ```
   **Sollte sein:** `t('template.noTemplatesAvailable')`

4. **Zeile 253:** Default Chip
   ```jsx
   <Chip label="Default" ... />
   ```
   **Sollte sein:** `t('template.default')` (existiert bereits!)

5. **Zeile 257:** Variables Label
   ```jsx
   Variables: {template.variables.join(', ')}
   ```
   **Sollte sein:** `t('template.variables') + ': ' + ...`

6. **Zeile 284:** Dialog Title
   ```jsx
   Apply Template: {selectedTemplate?.name}
   ```
   **Sollte sein:** `t('template.applyTemplate') + ': ' + ...`

7. **Zeile 304-305:** Tab Labels
   ```jsx
   <Tab label="Configuration" />
   <Tab label="Preview" />
   ```
   **Sollte sein:** `t('template.configuration')` / `t('template.preview')`

8. **Zeile 312:** Alert Message
   ```jsx
   This template will replace your current content. Variables have been filled with data extracted from your current content.
   ```
   **Sollte sein:** `t('template.applyWarning')`

9. **Zeile 315:** Variables Used Label
   ```jsx
   Variables used:
   ```
   **Sollte sein:** `t('template.variablesUsed')` (existiert als `availableVariables`)

10. **Zeile 339, 575:** Targets Fallback
    ```jsx
    {targetsBlock.label || 'Targets'}
    ```
    **Sollte sein:** `targetsBlock.label || t('template.targets')`

11. **Zeile 376, 611:** Anhänge Title (DEUTSCH!) - **EMAIL PLATFORM**
    ```jsx
    Anhänge für diesen Run
    ```
    **Sollte sein:** `t('platform.email.attachments.forRun')` (nach `usePlatformTranslations('email')`)

12. **Zeile 380, 625:** Anhänge Description (DEUTSCH!) - **EMAIL PLATFORM**
    ```jsx
    Wählen Sie zusätzliche Anhänge für diese Gruppe aus. Standard-Anhänge sind bereits voreingestellt.
    ```
    **Sollte sein:** `t('platform.email.attachments.description')` (nach `usePlatformTranslations('email')`)

13. **Zeile 395, 436, 670, 671:** Tooltips (DEUTSCH!) - **EMAIL PLATFORM**
    ```jsx
    <Tooltip title="Öffentlich (Public)">
    <Tooltip title="Intern (Internal)">
    ```
    **Sollte sein:** `t('platform.email.fileVisibility.public')` / `t('platform.email.fileVisibility.internal')` (nach `usePlatformTranslations('email')`)

14. **Zeile 409, 449, 684:** Attachment Count (DEUTSCH!) - **EMAIL PLATFORM**
    ```jsx
    Gesamt für diese Gruppe: {specificFiles.length + globalFiles.length} Anhänge
    ```
    **Sollte sein:** `t('platform.email.attachments.total', { count: ... })` (nach `usePlatformTranslations('email')`)

15. **Zeile 428, 461, 707:** Preview Label
    ```jsx
    Preview:
    ```
    **Sollte sein:** `t('template.preview')` (existiert bereits!)

16. **Zeile 779, 780:** Dialog Actions
    ```jsx
    <Button onClick={...}>Cancel</Button>
    <Button onClick={...}>Apply Template</Button>
    ```
    **Sollte sein:** `t('common.cancel')` / `t('template.applyTemplate')`

---

## Was noch zu machen ist

### 🔴 Hoch (Kritisch)

1. **Hardcoded Strings in Selector.jsx ersetzen**
   - Alle oben genannten Strings durch `t()` Aufrufe ersetzen
   - Neue Keys in `frontend/src/i18n/locales/*.json` hinzufügen

2. **Template Modal Strings hinzufügen**
   - Keys für alle Modal-Strings erstellen
   - EN/DE/ES Übersetzungen hinzufügen

3. **Email-spezifische Strings**
   - ✅ **Platform-spezifisch!** Email ist eine Platform
   - ✅ Gehört in: `backend/src/platforms/email/locales/{lang}.json`
   - ✅ Wird geladen via `usePlatformTranslations('email')` Hook
   - ✅ Verwendung im Frontend: `t('platform.email.attachments.forRun')`

### 🟡 Mittel (Wichtig)

4. **Variables in Templates**
   - Dokumentation: Variables sind technisch (Englisch)
   - Template-Content kann übersetzt sein
   - Variables bleiben gleich: `{title}`, `{date}`, etc.

5. **Schema-basierte Labels**
   - `targetsBlock.label` kommt vom Backend Schema
   - Sollte bereits übersetzt sein (via Platform Translations)
   - Fallback: `t('template.targets')`

6. **Pluralisierung**
   - Template Count: "1 template" vs "2 templates"
   - i18next Plural Support nutzen: `t('template.count', { count })`

### 🟢 Niedrig (Nice-to-have)

7. **Template Content Übersetzung**
   - Templates können `translations.{lang}` haben
   - Backend rendert basierend auf User-Sprache
   - Variables bleiben gleich

8. **Dynamische Category-Namen**
   - Categories kommen vom Backend
   - Sollten bereits übersetzt sein
   - Fallback funktioniert bereits

---

## Empfohlene Translation-Keys Struktur

### Frontend Common (`frontend/src/i18n/locales/*.json`)

```json
{
  "template": {
    // ... existing keys ...
    
    // Neue Keys für Selector.jsx:
    "count": "{{count}} template",
    "count_plural": "{{count}} templates",
    "count_zero": "No templates",
    "errorLoading": "Error loading templates",
    "noTemplatesAvailable": "No templates available",
    "applyTemplate": "Apply Template",
    "applyTemplateTitle": "Apply Template: {{name}}",
    "configuration": "Configuration",
    "preview": "Preview",
    "applyWarning": "This template will replace your current content. Variables have been filled with data extracted from your current content.",
    "variablesUsed": "Variables used:",
    "targets": "Targets",
    "attachmentsForRun": "Attachments for this run",
    "attachmentsDescription": "Select additional attachments for this group. Standard attachments are already preset.",
    "attachmentsTotal": "Total for this group: {{count}} attachments",
    "fileVisibility": {
      "public": "Public",
      "internal": "Internal"
    }
  }
}
```

### Platform-spezifisch (Email)

**Email-spezifische Strings gehören in die Email-Platform-Translations:**

```json
// backend/src/platforms/email/locales/en.json
{
  "attachments": {
    "forRun": "Attachments for this run",
    "description": "Select additional attachments for this group. Standard attachments are already preset.",
    "total": "Total for this group: {{count}} attachments"
  },
  "fileVisibility": {
    "public": "Public",
    "internal": "Internal"
  }
}
```

```json
// backend/src/platforms/email/locales/de.json
{
  "attachments": {
    "forRun": "Anhänge für diesen Run",
    "description": "Wählen Sie zusätzliche Anhänge für diese Gruppe aus. Standard-Anhänge sind bereits voreingestellt.",
    "total": "Gesamt für diese Gruppe: {{count}} Anhänge"
  },
  "fileVisibility": {
    "public": "Öffentlich (Public)",
    "internal": "Intern (Internal)"
  }
}
```

**Verwendung im Frontend (`Selector.jsx`):**
```jsx
// Nachdem usePlatformTranslations('email') geladen hat:
t('platform.email.attachments.forRun')
t('platform.email.attachments.description')
t('platform.email.attachments.total', { count: specificFiles.length + globalFiles.length })
t('platform.email.fileVisibility.public')
t('platform.email.fileVisibility.internal')
```

---

## Best Practices

### 1. Wo kommen Strings hin?

**Frontend Common (`frontend/src/i18n/locales/`):**
- ✅ UI-Strings (Buttons, Labels, Messages)
- ✅ Workflow-Strings
- ✅ Template-Management UI
- ✅ Allgemeine App-Strings

**Backend Common (`backend/src/i18n/locales/`):**
- ✅ Error Messages
- ✅ Validation Messages
- ✅ Backend-spezifische Messages

**Platform-spezifisch (`backend/src/platforms/{platform}/locales/`):**
- ✅ Platform-spezifische Labels
- ✅ Platform-spezifische Beschreibungen
- ✅ Platform-spezifische Error Messages
- ✅ **Email-spezifische UI-Strings** (z.B. "Anhänge für diesen Run", File Visibility Labels)
  - Werden via `usePlatformTranslations('email')` geladen
  - Zugriff via `t('platform.email.attachments.*')` oder `t('platform.email.fileVisibility.*')`

### 2. Variables in Templates

**✅ RICHTIG:**
```javascript
// Template Content (kann übersetzt sein):
"Event: {title} at {venue}"

// Variables (technisch, Englisch):
{title: "Depeche Mode Party"}
{venue: "Werk 2, Leipzig"}
```

**❌ FALSCH:**
```javascript
// Variables NICHT übersetzen:
"{titel}" // ❌ Falsch - sollte {title} sein
"{datum}" // ❌ Falsch - sollte {date} sein
```

### 3. Pluralisierung

**✅ RICHTIG:**
```json
{
  "template": {
    "count": "{{count}} template",
    "count_plural": "{{count}} templates",
    "count_zero": "No templates"
  }
}
```

```jsx
t('template.count', { count: templates.length })
```

### 4. Interpolation mit Variablen

**✅ RICHTIG:**
```jsx
t('template.applyTemplateTitle', { name: selectedTemplate?.name })
```

```json
{
  "template": {
    "applyTemplateTitle": "Apply Template: {{name}}"
  }
}
```

---

## Implementierungs-Checkliste

### Selector.jsx

- [ ] Zeile 198-200: Template Count → `t('template.count', { count })`
- [ ] Zeile 207: Error Message → `t('template.errorLoading')`
- [ ] Zeile 222: No Templates → `t('template.noTemplatesAvailable')`
- [ ] Zeile 253: Default Chip → `t('template.default')`
- [ ] Zeile 257: Variables Label → `t('template.variablesUsed')`
- [ ] Zeile 284: Dialog Title → `t('template.applyTemplateTitle', { name })`
- [ ] Zeile 304-305: Tab Labels → `t('template.configuration')` / `t('template.preview')`
- [ ] Zeile 312: Alert → `t('template.applyWarning')`
- [ ] Zeile 315: Variables Used → `t('template.variablesUsed')`
- [ ] Zeile 339, 575: Targets Fallback → `t('template.targets')`
- [ ] Zeile 376, 611: Anhänge Title → `t('platform.email.attachments.forRun')` (Email Platform)
- [ ] Zeile 380, 625: Anhänge Description → `t('platform.email.attachments.description')` (Email Platform)
- [ ] Zeile 395, 436, 670, 671: Tooltips → `t('platform.email.fileVisibility.public')` / `t('platform.email.fileVisibility.internal')` (Email Platform)
- [ ] Zeile 409, 449, 684: Attachment Count → `t('platform.email.attachments.total', { count })` (Email Platform)
- [ ] Zeile 428, 461, 707: Preview Label → `t('template.preview')`
- [ ] Zeile 779, 780: Buttons → `t('common.cancel')` / `t('template.applyTemplate')`

### Translation Files

**Frontend Common:**
- [ ] `frontend/src/i18n/locales/en.json` - Neue Keys hinzufügen
- [ ] `frontend/src/i18n/locales/de.json` - Deutsche Übersetzungen
- [ ] `frontend/src/i18n/locales/es.json` - Spanische Übersetzungen

**Email Platform (Backend):**
- [ ] `backend/src/platforms/email/locales/en.json` - Attachments & File Visibility Keys
- [ ] `backend/src/platforms/email/locales/de.json` - Deutsche Übersetzungen
- [ ] `backend/src/platforms/email/locales/es.json` - Spanische Übersetzungen

---

## Zusammenfassung

### ✅ Was bereits gut funktioniert:
- i18n System ist eingerichtet
- Platform Translations werden dynamisch geladen
- Common Translations funktionieren
- Variables System ist klar getrennt

### ❌ Was noch fehlt:
- Hardcoded Strings in Selector.jsx (16+ Stellen)
- Fehlende Translation Keys (Frontend Common + Email Platform)
- Deutsche Strings hardcoded (sollten übersetzt sein)
- Email-spezifische Strings gehören in Email-Platform-Translations
- Pluralisierung nicht genutzt

### 🎯 Nächste Schritte:
1. Alle hardcoded Strings identifizieren
2. Translation Keys erstellen
3. Strings durch `t()` ersetzen
4. Übersetzungen hinzufügen (EN/DE/ES)
