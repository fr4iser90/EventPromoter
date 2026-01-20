# Platform Config Struktur Analyse

## Übersicht: Panel vs Settings

### **PANEL** (`schema.panel`)
**Zweck:** Platform-spezifische Features/Options in der Sidebar
**Wo:** `frontend/src/features/platform/components/Panel.jsx`
**Schema:** `backend/src/platforms/{platform}/schema/panel.ts`

**Was ist drin:**
- ✅ Platform-spezifische Features (z.B. Email-Empfänger, Reddit-Subreddits)
- ✅ Interaktive Elemente (Empfänger hinzufügen, Gruppen erstellen)
- ✅ Dynamische Optionen (von Backend API geladen)
- ✅ Actions (API-Calls bei Änderungen)
- ❌ KEINE Credentials/API-Keys

**Beispiele:**
- Email: Empfänger-Verwaltung, Gruppen-Management
- Reddit: Subreddit-Verwaltung, Gruppen-Management

---

### **SETTINGS** (`schema.settings`)
**Zweck:** Credentials/API-Keys in einem Modal
**Wo:** `frontend/src/features/platform/components/SettingsModal.jsx`
**Schema:** `backend/src/platforms/{platform}/schema/settings.ts`

**Was ist drin:**
- ✅ Credentials (API Keys, Passwords, Tokens)
- ✅ Konfiguration (SMTP Host, Port, etc.)
- ✅ Validierung
- ✅ Field Groups (z.B. "SMTP Configuration")
- ❌ KEINE interaktiven Features

**Beispiele:**
- Email: SMTP Host, Port, Username, Password, From Email
- Reddit: Client ID, Client Secret, Username, Password

---

## Platform Config Struktur

### 1. **Settings Schema** (`schema.settings`)

```typescript
interface SettingsSchema {
  version: string
  title: string
  description?: string
  fields: FieldDefinition[]  // Form fields
  groups?: FieldGroup[]      // Optional: Group fields
}
```

**Field Types:**
- `text` - Text input
- `password` - Password input (masked)
- `number` - Number input
- `select` - Dropdown
- `multiselect` - Multi-select dropdown
- `textarea` - Multi-line text
- `checkbox` - Checkbox
- `switch` - Toggle switch

**Beispiel (Email):**
```typescript
fields: [
  {
    name: 'host',
    type: 'text',
    label: 'SMTP Host',
    required: true,
    validation: [...],
    ui: { width: 12, order: 1 }
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    required: true
  }
]
```

**API Endpoints:**
- `GET /api/platforms/{platform}/settings` - Settings laden
- `PUT /api/platforms/{platform}/settings` - Settings speichern

---

### 2. **Panel Schema** (`schema.panel`)

```typescript
interface PanelSchema {
  version: string
  title: string
  description?: string
  tabs?: Tab[]              // Optional: Tabs für Organisation
  sections: Section[]       // Panel sections
}
```

**Section Structure:**
```typescript
interface Section {
  id: string
  title: string
  description?: string
  fields: FieldDefinition[]  // Fields mit Actions
}
```

**Field Actions:**
```typescript
action: {
  endpoint: 'platforms/:platformId/recipients',
  method: 'POST',
  trigger: 'submit' | 'change' | 'blur',
  bodyMapping: { email: 'newEmail' },
  onSuccess: 'reload' | 'clear',
  reloadOptions: true
}
```

**Dynamic Options:**
```typescript
optionsSource: {
  endpoint: 'platforms/:platformId/recipients',
  method: 'GET',
  responsePath: 'options'  // Backend returns { success: true, options: [...] }
}
```

**Beispiel (Email Panel):**
```typescript
sections: [
  {
    id: 'recipient-list',
    title: 'Email-Empfänger',
    fields: [
      {
        name: 'recipients',
        type: 'multiselect',
        optionsSource: {
          endpoint: 'platforms/:platformId/recipients',
          responsePath: 'options'
        }
      }
    ]
  },
  {
    id: 'add-recipient',
    title: 'Neue Email hinzufügen',
    fields: [
      {
        name: 'newEmail',
        type: 'text',
        action: {
          endpoint: 'platforms/:platformId/recipients',
          method: 'POST',
          trigger: 'submit',
          bodyMapping: { email: 'newEmail' },
          onSuccess: 'reload'
        }
      }
    ]
  }
]
```

**API Endpoints (Platform-spezifisch):**
- Email: `/api/platforms/email/recipients`, `/api/platforms/email/recipient-groups`
- Reddit: `/api/platforms/reddit/subreddits`, `/api/platforms/reddit/subreddit-groups`

---

### 3. **Editor Schema** (`schema.editor`)

**Zweck:** Content-Editor Struktur
**Wo:** `backend/src/platforms/{platform}/schema/editor.ts`

**Struktur:**
```typescript
interface EditorSchema {
  version: string
  title: string
  blocks: ContentBlock[]  // Content blocks (title, text, image, etc.)
  mode?: 'simple' | 'advanced' | 'rich' | 'markdown'
  features?: EditorFeatures
  constraints?: EditorConstraints
}
```

**Content Block Types:**
- `text` - Text input
- `heading` - Heading
- `paragraph` - Paragraph
- `image` - Image upload
- `video` - Video upload
- `link` - Link input
- `targets` - Platform-specific targets (recipients, subreddits)

---

### 4. **Preview Schema** (`schema.preview`)

**Zweck:** Preview-Rendering Konfiguration
**Wo:** `backend/src/platforms/{platform}/schema/preview.ts`

**Struktur:**
```typescript
interface PreviewSchema {
  version: string
  title: string
  defaultMode: 'desktop' | 'mobile'
  modes: PreviewMode[]
  slots: PreviewSlot[]  // Layout slots (header, body, footer)
  styling?: StylingConfig
}
```

---

### 5. **Template Schema** (`schema.template`)

**Zweck:** Template-Management
**Wo:** `backend/src/platforms/{platform}/schema/template.ts`

**Struktur:**
```typescript
interface TemplateSchema {
  version: string
  title: string
  defaultStructure: Record<string, FieldDefinition>
  variables: VariableDefinition[]
  categories: Category[]
}
```

---

## Komplette Platform Schema Struktur

```typescript
interface PlatformSchema {
  version: string
  
  // 1. Settings (Credentials/API Keys) - Modal
  settings: SettingsSchema
  
  // 2. Editor (Content Editing) - Main Editor
  editor: EditorSchema
  
  // 3. Preview (Content Preview) - Preview Panel
  preview: PreviewSchema
  
  // 4. Panel (Platform Features) - Sidebar Panel
  panel?: PanelSchema  // Optional
  
  // 5. Template (Template Management) - Template System
  template?: TemplateSchema  // Optional
  
  // Metadata
  metadata?: {
    lastUpdated?: string
    author?: string
    description?: string
  }
}
```

---

## Frontend Komponenten Mapping

| Schema | Frontend Komponente | Wo wird es angezeigt |
|--------|---------------------|---------------------|
| `settings` | `SettingsModal.jsx` | Modal (Button: "Settings") |
| `panel` | `Panel.jsx` | Sidebar (rechts) |
| `editor` | `Editor.jsx` | Main Content Area |
| `preview` | `Preview.jsx` | Preview Tab |
| `template` | `TemplateSelector.jsx` | Template Dropdown |

---

## API Endpoints Übersicht

### Settings
- `GET /api/platforms/{platform}/settings` - Settings laden
- `PUT /api/platforms/{platform}/settings` - Settings speichern

### Panel (Platform-spezifisch)
- Email:
  - `GET /api/platforms/email/recipients` - Empfänger laden
  - `POST /api/platforms/email/recipients` - Empfänger hinzufügen
  - `GET /api/platforms/email/recipient-groups` - Gruppen laden
  - `POST /api/platforms/email/recipient-groups` - Gruppe erstellen
- Reddit:
  - `GET /api/platforms/reddit/subreddits` - Subreddits laden
  - `POST /api/platforms/reddit/subreddits` - Subreddit hinzufügen
  - `GET /api/platforms/reddit/subreddit-groups` - Gruppen laden
  - `POST /api/platforms/reddit/subreddit-groups` - Gruppe erstellen

### Schema
- `GET /api/platforms/{platform}/schema` - Komplettes Schema laden
- `GET /api/platforms/{platform}` - Platform mit Schema laden

---

## Zusammenfassung

**PANEL:**
- ✅ Platform Features (Empfänger, Subreddits, etc.)
- ✅ Interaktiv (Hinzufügen, Erstellen)
- ✅ Dynamische Optionen von API
- ✅ Sidebar rechts

**SETTINGS:**
- ✅ Credentials/API Keys
- ✅ Konfiguration (SMTP, etc.)
- ✅ Modal (Button "Settings")
- ✅ Validierung

**Unterschied:**
- **Panel** = Features/Management (was du mit der Platform machst)
- **Settings** = Credentials/Konfiguration (wie du dich verbindest)
