# Frontend Architecture - Wie funktioniert das Frontend?

## Übersicht

Das Frontend ist **vollständig schema-basiert** und lädt alle Platform-Konfigurationen vom Backend. Es gibt **keine hardcodierten Platform-Daten** im Frontend.

## ⚠️ WICHTIG: Architektur-Prinzip

> **Frontend ist 100% generisch - kennt keine Platforms, keine Themes, keine Tokens**

> **Backend ist Source of Truth - resolved alle Tokens zu konkreten Werten**

**Siehe auch:** [`../architecture/theme-token-resolution.md`](../architecture/theme-token-resolution.md) für die vollständige Token-Resolution Architektur.

---

## 1. Dark Mode / Light Mode - Wie funktioniert das?

### Flow:

```
1. Store (darkMode State) - Globaler State-Manager (Zustand)
   ↓
2. App.jsx: createAppTheme(darkMode)
   ↓
3. ThemeProvider: Stellt Theme allen Komponenten zur Verfügung
   ↓
4. CssBaseline: Setzt automatisch data-mui-color-scheme="dark" auf <body>
   ↓
5. index.css: body[data-mui-color-scheme="dark"] aktiviert Dark Mode CSS-Variablen
```

### Was ist der Store?

Der **Store** ist ein **temporärer State-Manager im Frontend** (verwendet [Zustand](https://github.com/pmndrs/zustand)).

**Wichtig:** Der Store speichert **NICHT** dauerhaft - er ist nur **temporär im Browser**!

**Zweck:**
- Speichert **temporären App-State** während der Session (z.B. `darkMode`, `currentEvent`, `uploadedFileRefs`)
- Kann von **allen Komponenten** verwendet werden
- **Sendet Daten an Backend** → Backend speichert dauerhaft

**Wie funktioniert die Persistierung?**

```
Frontend Store (temporär im Browser)
  ↓
State ändert sich (z.B. darkMode = true)
  ↓
Store sendet an Backend API (z.B. POST /api/config/app)
  ↓
Backend speichert dauerhaft (z.B. config/app.json)
```

**Beispiel:**
```javascript
// store.js
setDarkMode: async (darkMode) => {
  set({ darkMode })  // ← Temporär im Browser
  
  // Speichert im Backend
  await fetch('/api/config/app', {
    method: 'POST',
    body: JSON.stringify({ darkMode })
  })
}
```

**Vorteile:**
- ✅ Einfacher als Redux
- ✅ Kein Provider nötig
- ✅ Automatische Re-Renders bei State-Änderungen
- ✅ Backend speichert alles dauerhaft

### Schritt-für-Schritt:

**1. Dark Mode State im Store:**
```javascript
// store.js
darkMode: false,  // State wird im Store gespeichert
setDarkMode: async (darkMode) => {
  set({ darkMode })
  // Speichert auch im Backend
}
```

**2. App.jsx erstellt Theme:**
```javascript
// App.jsx
const { darkMode } = useStore()  // Holt Dark Mode State
const theme = createAppTheme(darkMode)  // Erstellt Theme mit mode: 'dark' oder 'light'
```

**3. CssBaseline setzt Attribut:**
```javascript
// App.jsx
<ThemeProvider theme={theme}>
  <CssBaseline />  {/* ← Setzt automatisch data-mui-color-scheme="dark" auf <body> */}
</ThemeProvider>
```

**4. CSS reagiert auf Attribut:**
```css
/* index.css */
:root {
  --bg-paper: #ffffff;  /* Light Mode Standard */
}

body[data-mui-color-scheme="dark"] {
  --bg-paper: #1e1e1e;  /* Dark Mode - wird aktiviert wenn Attribut gesetzt ist */
}
```

### Wie weiß das Frontend, ob Dark Mode aktiv ist?

- **Material-UI CssBaseline** setzt automatisch `data-mui-color-scheme="dark"` auf `<body>`, wenn `theme.palette.mode === 'dark'`
- **CSS** reagiert auf dieses Attribut: `body[data-mui-color-scheme="dark"]`
- **Keine JavaScript nötig** - reines CSS!

---

## 2. Daten-Persistierung - Wer speichert was?

### Wichtig: Backend speichert ALLES dauerhaft!

**Frontend Store:**
- ✅ Temporärer State im Browser (nur während Session)
- ✅ Schneller Zugriff für Komponenten
- ❌ Wird beim Neuladen gelöscht

**Backend:**
- ✅ Speichert ALLES dauerhaft (Events, Configs, Files, etc.)
- ✅ Persistiert in Dateien/DB
- ✅ Wird beim Neuladen geladen

### Beispiel-Flow:

```
1. User ändert darkMode im Frontend
   ↓
2. Store setzt darkMode = true (temporär)
   ↓
3. Store sendet POST /api/config/app { darkMode: true }
   ↓
4. Backend speichert in config/app.json
   ↓
5. Beim Neuladen: Backend lädt darkMode aus config/app.json
   ↓
6. Store wird mit Backend-Daten initialisiert
```

### Was speichert das Backend?

- ✅ **Events:** `events/{eventId}/event.json`
- ✅ **Configs:** `config/app.json`, `config/hashtags.json`
- ✅ **Parsed Data:** `events/{eventId}/parsed-data.json`
- ✅ **Platform Content:** `events/{eventId}/platform-content/{platform}.json`
- ✅ **Files:** `events/{eventId}/files/`

**Der Store ist nur ein Zwischenspeicher!**

---

## 3. Backend-Schemas - Wie werden sie verwendet?

### Flow:

```
1. Backend: Platform-Schemas (z.B. /api/platforms/email/schema)
   ↓
2. Frontend: usePlatformSchema Hook lädt Schema
   ↓
3. Komponenten: Verwenden Schema für Editor, Preview, etc.
```

### Schritt-für-Schritt:

**1. Backend stellt Schemas bereit:**
```typescript
// backend/src/platforms/email/schema/index.ts
export const emailSchema: PlatformSchema = {
  editor: { blocks: [...] },      // Editor-Konfiguration
  preview: { contentMapping: [...] },  // Preview-Konfiguration
  settings: {...},                 // Settings-Konfiguration
  template: {...}                  // Template-Konfiguration
}
```

**2. Frontend lädt Schema:**
```javascript
// frontend/src/hooks/usePlatformSchema.js
export function usePlatformSchema(platformId) {
  const [schema, setSchema] = useState(null)
  
  useEffect(() => {
    fetch(`/api/platforms/${platformId}/schema`)
      .then(res => res.json())
      .then(data => setSchema(data))
  }, [platformId])
  
  return { schema }
}
```

**3. Komponenten verwenden Schema:**
```javascript
// GenericPlatformEditor.jsx
const { schema } = usePlatformSchema(platform)

// Rendert Editor-Blocks basierend auf Schema
schema.editor.blocks.forEach(block => {
  // Rendert Input-Felder basierend auf block.type, block.constraints, etc.
})
```

### Beispiel: Email Platform

**Backend Schema:**
```typescript
{
  editor: {
    blocks: [
      { id: 'subject', type: 'text', label: 'Subject', required: true },
      { id: 'body', type: 'html', label: 'Body', maxLength: 50000 }
    ]
  },
  preview: {
    contentMapping: [
      { field: 'subject', renderAs: 'heading' },
      { field: 'body', renderAs: 'html' }
    ]
  }
}
```

**Frontend verwendet Schema:**
```javascript
// GenericPlatformEditor rendert automatisch:
// - TextField für 'subject'
// - HTML-Editor für 'body'

// PlatformPreview rendert automatisch:
// - Heading für 'subject'
// - HTML für 'body'
```

---

## 4. CSS-Variablen - Wie werden sie verwendet?

### Aktueller Stand:

**index.css definiert CSS-Variablen:**
```css
:root {
  --bg-paper: #ffffff;      /* Light Mode */
  --text-primary: #000000;
}

body[data-mui-color-scheme="dark"] {
  --bg-paper: #1e1e1e;      /* Dark Mode */
  --text-primary: #ffffff;
}
```

**CSS verwendet Variablen:**
```css
body {
  background-color: var(--bg-default);  /* Nutzt CSS-Variable */
  color: var(--text-primary);
}
```

**Material-UI Komponenten nutzen Theme-Tokens:**
```javascript
// Komponenten verwenden Theme-Tokens (nicht CSS-Variablen)
<Box sx={{ bgcolor: 'background.paper' }}>  // Material-UI Theme
```

### Zwei Systeme:

1. **CSS-Variablen** (`--bg-paper`) → Für native HTML-Elemente (body, a, button)
2. **Material-UI Theme-Tokens** (`background.paper`) → Für Material-UI Komponenten

**Warum beide?**
- CSS-Variablen funktionieren in normalem CSS
- Material-UI Theme-Tokens funktionieren in `sx` Props
- Beide werden automatisch synchronisiert durch CssBaseline

---

## 5. Schema-basierte Komponenten

### GenericPlatformEditor

**Lädt Schema:**
```javascript
const { schema } = usePlatformSchema(platform)
const editorBlocks = schema?.editor?.blocks || []
```

**Rendert dynamisch:**
```javascript
editorBlocks.forEach(block => {
  switch(block.type) {
    case 'text': return <TextField />
    case 'html': return <HTML Editor />
    case 'image': return <Image Upload />
  }
})
```

### PlatformPreview

**Lädt Schema:**
```javascript
const { schema } = usePlatformSchema(platform)
const contentMapping = schema?.preview?.contentMapping || []
```

**Rendert dynamisch:**
```javascript
contentMapping.forEach(mapping => {
  switch(mapping.renderAs) {
    case 'heading': return <Typography variant="h6" />
    case 'html': return <Box dangerouslySetInnerHTML />
    case 'image': return <img />
  }
})
```

---

## 6. Zusammenfassung

### Dark Mode:
✅ **Store** → **App.jsx** → **ThemeProvider** → **CssBaseline** → **CSS-Attribut** → **CSS-Variablen**

### Backend-Schemas:
✅ **Backend API** → **usePlatformSchema Hook** → **Komponenten** → **Dynamisches Rendering**

### CSS-Variablen:
✅ **index.css definiert** → **body/a/button verwenden** → **Material-UI nutzt Theme-Tokens**

### Schema-basiert:
✅ **Keine hardcodierten Platforms** → **Alles kommt vom Backend** → **Frontend ist generisch**

---

## Wichtige Dateien:

- `frontend/src/App.jsx` - Theme-Erstellung, CssBaseline
- `frontend/src/index.css` - CSS-Variablen für Light/Dark Mode
- `frontend/src/store.js` - Dark Mode State
- `frontend/src/hooks/usePlatformSchema.js` - Lädt Backend-Schemas
- `frontend/src/components/GenericPlatformEditor/` - Schema-basierter Editor
- `frontend/src/components/PlatformPreview/` - Schema-basierter Preview

