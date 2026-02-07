# Visueller Template-Builder - Architektur & Implementierungsplan

## 🎯 Ziel

Ein visueller Template-Builder für normale Endnutzer (ohne HTML-Kenntnisse), der:
- Drag-and-Drop-Blöcke ermöglicht
- Live-Preview zeigt
- Variablen per Klick einfügt
- Keine HTML-Syntax erfordert

## 📐 Architektur-Übersicht

```
TemplateBuilder (GENERISCH)
├── Toolbar (Variablen-Buttons aus Schema, Block-Palette aus Schema)
├── Editor Area (Drag-and-Drop Canvas)
│   ├── BlockList (sortierte Liste der Blöcke)
│   └── Block Components (dynamisch aus Schema generiert)
│       ├── TextBlock (für type: 'text')
│       ├── RichTextBlock (für type: 'html' oder 'rich')
│       ├── ImageBlock (wenn Schema Images unterstützt)
│       └── CustomBlock (für erweiterte Schema-Typen)
└── Preview Panel (Live-Preview via PlatformPreview - GENERISCH)
```

**Schema-Driven:**
- Block-Typen kommen aus `schema.template.defaultStructure`
- Variablen kommen aus `schema.template.variables`
- Block-Palette wird aus Schema generiert
- Frontend kennt keine Platforms, nur Schemas

## 🧩 Komponenten-Struktur

### 1. **TemplateBuilder.jsx** (Hauptkomponente - GENERISCH)
```javascript
// Props
- platform: string // Platform-ID (z.B. 'email')
- template: Template | null // Bestehendes Template (optional)
- schema: TemplateSchema // Aus usePlatformSchema(platform)
- onSave: (template) => void

// State Management
- blocks: Array<Block> // Sortierte Liste der Blöcke (aus Schema generiert)
- selectedBlock: Block | null
- previewMode: 'desktop' | 'mobile' // Aus schema.preview.modes
- variables: Array<Variable> // Aus schema.template.variables

// Funktionen
- addBlock(fieldName, position) // fieldName aus schema.template.defaultStructure
- removeBlock(id)
- moveBlock(id, newPosition)
- updateBlock(id, data)
- insertVariable(blockId, variable)
- exportToSchemaFormat() // Konvertiert Blöcke zu Schema-Format (nicht HTML!)
```

### 2. **Block Types** (GENERISCH - basierend auf Schema)

**Block-Typen werden aus `schema.template.defaultStructure` abgeleitet:**

#### TextBlock (für `type: 'text'`)
- **Schema-Feld**: `{ type: 'text' }`
- **Props**: `content`, `align`, `color`
- **Output**: Text-Content (Platform-spezifisch)
- **Variables**: Aus `schema.template.variables`

#### RichTextBlock (für `type: 'html'` oder `type: 'rich'`)
- **Schema-Feld**: `{ type: 'html' }` oder `{ type: 'rich' }`
- **Props**: `content`, `align`, `color`, `formatting`
- **Output**: HTML-Content (für Email) oder Markdown (für andere)
- **Variables**: Aus `schema.template.variables`

#### ImageBlock (wenn Schema Images unterstützt)
- **Schema-Feld**: `{ type: 'image' }` oder Variable-Typ `'image'`
- **Props**: `src`, `alt`, `width`, `height`
- **Output**: `<img>` Tag oder Platform-spezifisches Format
- **Variables**: Image-Variablen aus Schema

**WICHTIG:**
- ❌ KEINE hardcodierten Block-Typen
- ✅ Block-Typen werden aus Schema-Feld-Typen generiert
- ✅ Email: `html` → RichTextBlock mit HTML-Output
- ✅ Reddit: `text` → TextBlock mit Markdown-Output
- ✅ Twitter: `text` → TextBlock mit Plain-Text-Output

### 3. **BlockPalette.jsx** (Sidebar - GENERISCH)
- Liste aller verfügbaren Block-Typen (aus `schema.template.defaultStructure`)
- Drag-and-Drop Quelle
- Icons + Labels für jeden Block-Typ (aus Schema)
- Nur Felder mit `type: 'html'` oder `type: 'rich'` zeigen visuellen Builder

### 4. **BlockEditor.jsx** (Block-Eigenschaften - GENERISCH)
- Formular für Block-Eigenschaften (basierend auf Schema-Feld-Typ)
- Variablen-Buttons zum Einfügen (aus `schema.template.variables`)
- Live-Update des Blocks

### 5. **VariableToolbar.jsx** (GENERISCH)
- Buttons für alle verfügbaren Variablen (aus `schema.template.variables`)
- Tooltips mit Beschreibung (aus Schema)
- Klick fügt Variable in aktuellen Block ein

### 6. **LivePreview.jsx** (GENERISCH)
- Nutzt `PlatformPreview` Komponente (generisch)
- Zeigt Desktop/Mobile Ansicht (aus `schema.preview.modes`)
- Aktualisiert sich bei jeder Änderung
- Backend rendert Preview basierend auf Platform

## 🔄 Datenfluss (GENERISCH)

```
User Action → Block State Update → Schema Format → Live Preview (via PlatformPreview)
     ↓
Block Editor (Properties) → Block Data Update → Re-render
     ↓
Variable Button Click → Insert Variable → Update Block Content
     ↓
Schema Load (usePlatformSchema) → Block-Typen generieren → Block-Palette
```

**WICHTIG:**
- ❌ KEINE HTML-Generierung im Frontend
- ✅ Frontend arbeitet nur mit Schema-Format
- ✅ Preview nutzt generische `PlatformPreview` Komponente
- ✅ Backend konvertiert Schema-Format zu Platform-spezifischem Output

## 📦 Technologie-Stack

### Drag-and-Drop
**Empfehlung: @dnd-kit/core** (modern, leichtgewichtig, TypeScript)
- Alternative: react-beautiful-dnd (etabliert, aber deprecated)
- Alternative: react-dnd (komplexer, mehr Features)

### Rich-Text-Editor (optional)
**Empfehlung: React-Quill** (einfach, gut dokumentiert)
- Alternative: TinyMCE (mächtig, aber groß)
- Alternative: Draft.js (flexibel, aber komplex)

### Code-Editor (für erweiterte Nutzer)
**Empfehlung: Monaco Editor** (VS Code Editor)
- Alternative: CodeMirror (leichter)

## 🗂️ Datei-Struktur

```
frontend/src/features/templates/
├── components/
│   ├── Editor.jsx (aktuell - wird erweitert)
│   ├── VisualBuilder/
│   │   ├── TemplateBuilder.jsx (Hauptkomponente - GENERISCH)
│   │   ├── BlockPalette.jsx (GENERISCH - nutzt Schema)
│   │   ├── BlockEditor.jsx (GENERISCH - nutzt Schema)
│   │   ├── VariableToolbar.jsx (GENERISCH - nutzt Schema)
│   │   ├── LivePreview.jsx (GENERISCH - nutzt PlatformPreview)
│   │   └── blocks/
│   │       ├── BlockRenderer.jsx (GENERISCH - rendert basierend auf Schema)
│   │       ├── TextBlock.jsx (GENERISCH)
│   │       ├── RichTextBlock.jsx (GENERISCH - für type: 'html' oder 'rich')
│   │       └── ImageBlock.jsx (GENERISCH - wenn Schema Image unterstützt)
│   └── ...
├── hooks/
│   ├── useTemplateBuilder.js (GENERISCH - nutzt Schema)
│   ├── useBlockDragDrop.js
│   └── useHTMLExporter.js (GENERISCH - konvertiert Blöcke zu Schema-Format)
└── utils/
    ├── blockToSchemaFormat.js (GENERISCH - konvertiert Blöcke zu Schema defaultStructure)
    ├── schemaToBlocks.js (GENERISCH - konvertiert Schema zu Blöcken)
    └── blockValidators.js (GENERISCH - nutzt Schema-Validation)
```

**WICHTIG:** 
- ❌ KEINE Platform-spezifischen Imports (z.B. `from '../../platform/email'`)
- ✅ ALLES basiert auf `schema.template.defaultStructure`
- ✅ Block-Typen werden aus Schema-Feld-Typen abgeleitet
- ✅ Frontend kennt keine Platforms, nur Schemas

## 🚀 Implementierungsplan (Schritt-für-Schritt)

### Phase 1: Foundation (MVP)
**Ziel:** Basis-Funktionalität ohne Drag-and-Drop

1. **Block-System (GENERISCH)**
   - Block-Komponenten erstellen (basierend auf Schema-Feld-Typen)
   - Block-Editor für Eigenschaften (Schema-basiert)
   - Block-Renderer für Schema-Format (nicht HTML!)

2. **Einfache Block-Liste**
   - Blöcke als Liste anzeigen (aus `schema.template.defaultStructure` generiert)
   - Add/Remove/Edit Buttons
   - Block-Reihenfolge per Up/Down Buttons

3. **Variablen-Integration (GENERISCH)**
   - VariableToolbar mit Buttons (aus `schema.template.variables`)
   - Variablen in Block-Content einfügen
   - Variable-Placeholder anzeigen

4. **Live-Preview (GENERISCH)**
   - Blöcke zu Schema-Format konvertieren
   - Preview-Panel nutzt `PlatformPreview` Komponente
   - Desktop/Mobile Toggle (aus `schema.preview.modes`)

### Phase 2: Drag-and-Drop
**Ziel:** Intuitive Block-Verwaltung

1. **@dnd-kit Integration**
   - Installieren: `npm install @dnd-kit/core @dnd-kit/sortable`
   - Drag-and-Drop für Block-Liste
   - Drag-and-Drop von Palette zu Editor

2. **Block-Palette**
   - Sidebar mit verfügbaren Block-Typen
   - Drag von Palette zu Editor
   - Visual Feedback beim Dragging

### Phase 3: Erweiterte Features
**Ziel:** Professionelle Features

1. **Block-Aktionen**
   - Duplizieren
   - Löschen mit Bestätigung
   - Block-Gruppen (Container)

2. **Rich-Text-Editor**
   - React-Quill für Text-Blöcke
   - Formatierung (Bold, Italic, Links)
   - Variablen per Button einfügen

3. **Template-Import/Export (GENERISCH)**
   - Schema-Format zu Blöcke konvertieren (Import)
   - Blöcke zu Schema-Format exportieren (bereits vorhanden)
   - Template-Vorlagen speichern
   - Optional: HTML/Markdown Import (wenn Platform es unterstützt)

4. **Responsive Preview**
   - Desktop/Mobile/Tablet Ansichten
   - Breakpoint-Vorschau

## 💾 Datenmodell

### Block Interface (GENERISCH)
```typescript
interface Block {
  id: string
  fieldName: string // Name aus schema.template.defaultStructure (z.B. 'html', 'text', 'subject')
  fieldType: 'text' | 'textarea' | 'html' | 'rich' // Aus Schema
  position: number // Sortier-Index
  data: {
    // Block-spezifische Daten (basierend auf Schema-Feld)
    value: string // Der eigentliche Content
    // Styling (optional, wenn Schema es unterstützt)
    align?: 'left' | 'center' | 'right'
    color?: string
    fontSize?: string
  }
}
```

### Template Structure (GENERISCH)
```typescript
interface VisualTemplate {
  // Entspricht schema.template.defaultStructure
  // Jedes Feld wird zu einem Block
  blocks: Block[] // Ein Block pro Schema-Feld
  variables: string[] // Aus schema.template.variables
}
```

**Konvertierung:**
- **Schema → Blocks**: `schema.template.defaultStructure` → Block-Array
- **Blocks → Schema**: Block-Array → `template.template` (für Backend)

## 🔄 Schema-Konvertierung (GENERISCH)

### Blocks → Schema Format
```javascript
function blocksToSchemaFormat(blocks, schema) {
  // Konvertiert Block-Array zu schema.template.defaultStructure Format
  const template = {}
  blocks.forEach(block => {
    template[block.fieldName] = block.data.value
  })
  return template
}
```

### Schema → Blocks
```javascript
function schemaToBlocks(template, schema) {
  // Konvertiert schema.template.defaultStructure zu Block-Array
  const defaultStructure = schema.template.defaultStructure
  return Object.entries(defaultStructure).map(([fieldName, field], index) => ({
    id: `block-${fieldName}`,
    fieldName,
    fieldType: field.type,
    position: index,
    data: {
      value: template[fieldName] || field.default || ''
    }
  }))
}
```

**WICHTIG:**
- ❌ KEINE HTML-Konvertierung im Frontend
- ✅ Frontend arbeitet nur mit Schema-Format
- ✅ Backend konvertiert Schema-Format zu HTML (Email) oder anderen Formaten

## 🎨 UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────┐
│ Toolbar: [Variables] [Preview Mode] [Save]     │
├──────────┬──────────────────────┬──────────────┤
│          │                      │              │
│ Block    │   Editor Canvas      │  Live        │
│ Palette  │   (Drag & Drop)      │  Preview     │
│          │                      │              │
│ [Text]   │  ┌──────────────┐   │  ┌────────┐  │
│ [Rich]   │  │ Text Block   │   │  │Preview │  │
│ [Image]  │  └──────────────┘   │  │(Schema)│  │
│          │  ┌──────────────┐   │  │        │  │
│          │ │ Rich Block   │   │  │        │  │
│          │ └──────────────┘   │  └────────┘  │
│          │                      │              │
└──────────┴──────────────────────┴──────────────┘
```

### Block-Editor (Sidebar rechts)
- Öffnet sich bei Block-Auswahl
- Zeigt Block-Eigenschaften
- Variablen-Buttons zum Einfügen
- Live-Update

## 📝 Beispiel-Implementierung

### Block Component (GENERISCH - basierend auf Schema)
```javascript
function BlockRenderer({ block, schema, onUpdate, onSelect, isSelected }) {
  // Block-Typ wird aus schema.template.defaultStructure[block.fieldName] abgeleitet
  const fieldSchema = schema.template.defaultStructure[block.fieldName]
  
  if (fieldSchema.type === 'html' || fieldSchema.type === 'rich') {
    return <RichTextBlock block={block} onUpdate={onUpdate} onSelect={onSelect} isSelected={isSelected} />
  } else if (fieldSchema.type === 'text') {
    return <TextBlock block={block} onUpdate={onUpdate} onSelect={onSelect} isSelected={isSelected} />
  }
  // ... weitere Typen
}
```

### Variable Toolbar
```javascript
function VariableToolbar({ variables, onInsert }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {variables.map(variable => (
        <Tooltip key={variable.name} title={variable.description}>
          <Button
            size="small"
            onClick={() => onInsert(`{${variable.name}}`)}
          >
            {variable.label}
          </Button>
        </Tooltip>
      ))}
    </Box>
  )
}
```

## 🎯 Quick Wins (Sofort umsetzbar)

1. **Größere Textareas** (5 Min)
   - `minRows={12}` statt `rows={4}`
   - `resize: 'vertical'`

2. **Variablen-Buttons** (30 Min)
   - Toolbar über Textarea
   - Buttons für alle Variablen
   - Klick fügt `{variable}` ein

3. **Live-Preview Toggle** (1 Stunde)
   - Split-View: Editor links, Preview rechts
   - Preview aktualisiert bei Änderung

4. **Syntax-Highlighting** (2 Stunden - GENERISCH)
   - Monaco Editor für Rich-Text-Felder (type: 'html' oder 'rich')
   - Syntax-Highlighting basierend auf Schema-Feld-Typ
   - Auto-Complete für Variablen (aus Schema)

## 📊 Priorisierung

### Must-Have (MVP)
- ✅ Größere Textareas
- ✅ Variablen-Buttons
- ✅ Live-Preview
- ✅ Block-System (einfach, ohne Drag-and-Drop)

### Should-Have (Phase 2)
- Drag-and-Drop
- Block-Palette
- Rich-Text-Editor für Text-Blöcke

### Nice-to-Have (Phase 3)
- Schema-Format Import/Export
- Block-Duplizieren
- Responsive Preview-Modi (aus Schema)
- Template-Vorlagen
- Optional: HTML/Markdown Import (wenn Platform es unterstützt)

## 🔧 Nächste Schritte

1. **Sofort:** Größere Textareas + Variablen-Buttons implementieren
2. **Diese Woche:** Block-System (einfach, ohne Drag-and-Drop)
3. **Nächste Woche:** Drag-and-Drop Integration
4. **Später:** Rich-Text-Editor + erweiterte Features

## 📚 Ressourcen

- **@dnd-kit Docs:** https://docs.dndkit.com/
- **React-Quill:** https://github.com/zenoamaro/react-quill
- **Monaco Editor:** https://microsoft.github.io/monaco-editor/
- **Schema-Driven UI:** Frontend arbeitet nur mit Schemas, keine Platform-spezifischen Imports
    