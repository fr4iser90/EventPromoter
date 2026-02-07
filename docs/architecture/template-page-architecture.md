# 🏗️ Template Page Architecture - Frontend/Backend Trennung

## 📋 Übersicht

Dieses Dokument definiert die klare Trennung zwischen Frontend und Backend für die Template-Management-Seite.

## 🎯 Prinzipien

1. **Schema-basiertes Frontend**: Frontend rendert nur, basierend auf Backend-Schemas
2. **Backend = Domain Logic**: Alle platform-spezifischen Logik im Backend
3. **Frontend = Presentation**: Frontend zeigt nur an, keine Business-Logik
4. **Keine Modals**: Alles inline im Viewport (Split-View)

---

## 🔵 BACKEND Verantwortlichkeiten

### 1. Template CRUD Operations
**Endpoints:**
- `GET /api/templates/:platform` - Liste aller Templates
- `GET /api/templates/:platform/:id` - Einzelnes Template
- `POST /api/templates/:platform` - Template erstellen
- `PUT /api/templates/:platform/:id` - Template aktualisieren
- `DELETE /api/templates/:platform/:id` - Template löschen
- `GET /api/templates/categories` - Kategorien

**Service:** `TemplateService`
- Lädt Default Templates aus Platform Modules
- Lädt Custom Templates aus JSON Files
- Speichert Custom Templates in JSON Files
- Validiert Template-Struktur

### 2. Template Schema Definition
**Location:** `backend/src/platforms/{platform}/schema/template.ts`

**Definiert:**
- `defaultStructure`: Welche Felder ein Template haben muss
- `variables`: Verfügbare Variablen (z.B. `{title}`, `{date}`)
- `categories`: Template-Kategorien
- `validation`: Validierungsregeln

**Beispiel:**
```typescript
{
  defaultStructure: {
    subject: { type: 'text', label: 'Subject', required: true },
    html: { type: 'html', label: 'HTML Content', required: true }
  },
  variables: [
    { name: 'title', label: 'Event Title', type: 'string' },
    { name: 'date', label: 'Event Date', type: 'date' }
  ]
}
```

### 3. Template Preview Rendering
**Endpoint:** `POST /api/platforms/:platformId/preview`

**Service:** `PreviewRenderer`
- Rendert Template mit Beispiel-Daten zu HTML
- Nutzt Platform Preview Schema
- Unterstützt verschiedene Modi (desktop, mobile)
- Unterstützt Locale (en, de, es)

**Input:**
```json
{
  "content": { "subject": "Welcome {name}!", "html": "Hi {name}..." },
  "mode": "desktop",
  "locale": "en"
}
```

**Output:**
```json
{
  "html": "<div>...</div>",
  "css": "...",
  "dimensions": { "width": 600, "height": 400 }
}
```

### 4. Template Variable Extraction
**Service:** `TemplateMappingService`
- Extrahiert Variablen aus Template-Content
- Validiert Variablen gegen Schema
- Mappt Templates zu Editor Content

### 5. Template Validation
**Service:** `TemplateService.validateTemplate()`
- Validiert Template-Struktur gegen Schema
- Prüft required Fields
- Prüft Variable-Syntax
- Prüft Content-Constraints (z.B. max length)

---

## 🟢 FRONTEND Verantwortlichkeiten

### 1. Template List Rendering
**Component:** `TemplateList`
- Zeigt Templates als Cards
- Gruppiert nach Kategorien
- Filter/Search (Frontend-only, client-side)
- Sortierung (Frontend-only, client-side)

**Keine Business-Logik:**
- ❌ Keine Template-Validierung
- ❌ Keine Variable-Extraktion
- ❌ Keine Platform-spezifische Logik

### 2. Schema-basiertes Form Rendering
**Component:** `SchemaRenderer`
- Rendert Form-Felder basierend auf `schema.template.defaultStructure`
- Nutzt Schema für:
  - Field Types (text, textarea, html)
  - Labels
  - Placeholders
  - Required Fields
  - Descriptions

**Input:** Schema von Backend
**Output:** Form Fields (Material-UI Components)

### 3. Template Preview Display
**Component:** `TemplatePreview`
- Zeigt gerendertes HTML (vom Backend)
- Lädt Preview via API: `POST /api/platforms/:platformId/preview`
- Zeigt verschiedene Modi (desktop, mobile)
- Zeigt Variablen-Liste (aus Schema)

**Keine Rendering-Logik:**
- ❌ Kein HTML-Rendering im Frontend
- ❌ Keine Variable-Substitution
- ❌ Keine Platform-spezifische Formatierung

### 4. State Management
**Hook:** `useTemplates`
- Lädt Templates via API
- CRUD Operations (create, update, delete)
- Loading/Error States

**Local State:**
- Selected Template
- Edit Mode (view/edit)
- Form Data (Draft)
- Dirty State

### 5. UI/UX
- Split-View Layout (List | Preview/Editor)
- Inline Editing (keine Modals)
- Live Preview (lädt bei Änderungen)
- Variable Highlighting (nur visuell)

---

## 🔄 Data Flow

### Template Laden
```
Frontend: useTemplates Hook
  ↓ GET /api/templates/:platform
Backend: TemplateController.getTemplates()
  ↓
Backend: TemplateService.getAllTemplates()
  ↓ Lädt Default + Custom Templates
  ↓
Backend: resolveTemplates() - wendet Mode an
  ↓
Backend: Übersetzt Template-Namen (i18n)
  ↓
Frontend: Zeigt Templates in List
```

### Template Preview
```
Frontend: TemplatePreview Component
  ↓ POST /api/platforms/:platformId/preview
  ↓ Body: { content: template.template, mode: 'desktop', locale: 'en' }
Backend: PlatformController.renderPreview()
  ↓
Backend: PreviewRenderer.render()
  ↓ Nutzt Platform Preview Schema
  ↓ Rendert HTML mit Beispiel-Daten
  ↓
Frontend: Zeigt HTML in iframe/div
```

### Template Erstellen/Bearbeiten
```
Frontend: SchemaRenderer (Form)
  ↓ User füllt Form aus
  ↓ POST /api/templates/:platform (create)
  ↓ PUT /api/templates/:platform/:id (update)
Backend: TemplateController.createTemplate() / updateTemplate()
  ↓
Backend: TemplateService.validateTemplate()
  ↓ Validiert gegen Schema
  ↓
Backend: TemplateService.saveCustomTemplates()
  ↓ Speichert in JSON File
  ↓
Frontend: Reload Templates
```

---

## 📐 Template Schema Structure

### Backend Schema (Platform Definition)
```typescript
// backend/src/platforms/email/schema/template.ts
{
  defaultStructure: {
    subject: {
      type: 'text',
      label: 'Email Subject',
      required: true,
      placeholder: 'Enter subject...'
    },
    html: {
      type: 'html',
      label: 'HTML Content',
      required: true,
      placeholder: 'Enter HTML...'
    }
  },
  variables: [
    { name: 'title', label: 'Event Title', type: 'string' },
    { name: 'date', label: 'Event Date', type: 'date' }
  ],
  categories: [
    { id: 'general', label: 'General' },
    { id: 'events', label: 'Events' }
  ]
}
```

### Frontend Rendering
```jsx
// Frontend nutzt Schema für Form-Rendering
<SchemaRenderer
  fields={Object.entries(schema.template.defaultStructure).map(([key, field]) => ({
    name: key,
    type: field.type,
    label: field.label,
    placeholder: field.placeholder,
    required: field.required
  }))}
  values={formData.template}
  onChange={(fieldName, value) => updateFormData(fieldName, value)}
/>
```

---

## 🚫 Was NICHT im Frontend

### ❌ Template Validierung
- Backend validiert gegen Schema
- Frontend zeigt nur Errors an

### ❌ Variable Extraction
- Backend extrahiert Variablen
- Frontend zeigt nur an

### ❌ Preview Rendering
- Backend rendert HTML
- Frontend zeigt nur an

### ❌ Platform-spezifische Logik
- Alles im Backend
- Frontend nutzt nur Schemas

### ❌ Template Mapping
- Backend mappt Templates zu Editor Content
- Frontend nutzt nur Ergebnis

---

## ✅ Was IM Frontend

### ✅ UI Rendering
- Template Cards
- Form Fields (Schema-basiert)
- Preview Display (HTML vom Backend)

### ✅ Client-side Filtering/Sorting
- Suche in Template-Namen
- Filter nach Kategorien
- Sortierung

### ✅ State Management
- Selected Template
- Edit Mode
- Form Draft
- Dirty State

### ✅ UX Features
- Inline Editing
- Live Preview (lädt bei Änderungen)
- Variable Highlighting (visuell)

---

## 🔐 API Contracts

### Template List Response
```typescript
{
  success: boolean
  templates: Array<{
    id: string
    name: string
    description: string
    platform: string
    category: string
    template: Record<string, any> // Platform-specific structure
    variables: string[] // Extracted variables
    isDefault: boolean
  }>
  defaultCount: number
  customCount: number
}
```

### Template Preview Request
```typescript
POST /api/platforms/:platformId/preview
{
  content: Record<string, any> // Template content
  mode?: 'desktop' | 'mobile'
  locale?: 'en' | 'de' | 'es'
}
```

### Template Preview Response
```typescript
{
  success: boolean
  html: string
  css?: string
  dimensions?: { width: number, height: number }
}
```

---

## 🎨 Layout Structure

### Split-View (Desktop)
```
┌─────────────────────────────────────────────────────────┐
│ Header (fixed)                                          │
├─────────────────────────────────────────────────────────┤
│ Toolbar: [Search] [Category] [+ New]                   │
│ Tabs: [Email] [Twitter] [Facebook] ...                 │
├──────────────────────────┬──────────────────────────────┤
│ LEFT (60%)              │ RIGHT (40%)                  │
│ Template List           │ Preview / Editor              │
│ - Cards                 │ - Preview (View Mode)        │
│ - Selected State        │ - Editor (Edit Mode)         │
│                         │ - Variables                  │
└──────────────────────────┴──────────────────────────────┘
```

### Mobile
```
┌─────────────────────────┐
│ Header                  │
├─────────────────────────┤
│ Toolbar                 │
│ Tabs                    │
├─────────────────────────┤
│ Template List           │
│ (Full Width)           │
│                         │
│ [Tap Template]          │
│ → Preview Bottom Sheet │
│ → Edit Fullscreen      │
└─────────────────────────┘
```

---

## 🧪 Testing Strategy

### Backend Tests
- Template CRUD Operations
- Template Validation
- Preview Rendering
- Variable Extraction

### Frontend Tests
- Component Rendering
- State Management
- API Integration (Mock)
- User Interactions

---

## 📝 Zusammenfassung

**Backend = Domain:**
- Template CRUD
- Schema Definition
- Preview Rendering
- Validation
- Variable Extraction

**Frontend = Presentation:**
- UI Rendering (Schema-basiert)
- State Management
- User Interactions
- Client-side Filtering/Sorting

**Keine Modals:**
- Alles inline im Viewport
- Split-View Layout
- Inline Editing
