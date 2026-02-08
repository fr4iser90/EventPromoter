# Frontend Structure Analysis - ECHTE ANALYSE

## 🔴 PROBLEME & INKONSISTENZEN

---

## 📁 ORDNER-STRUKTUR ANALYSE

### ❌ **1. `flows/` - UNNÖTIGER ORDNER!**

**Was ist drin:**
```
flows/
├── parser/
│   ├── EventParser.jsx
│   ├── HashtagBuilder.jsx  ⚠️ DOPPELT!
│   ├── PublishParser.jsx
│   └── UploadParser.jsx
├── upload/
│   └── FileUpload.jsx
└── publish/
    └── Results.jsx
```

**Problem:**
- `flows/` ist ein **UNNÖTIGER ORDNER**!
- Das sind alles **Features**, nicht "Flows"!
- Sollte in `features/` rein:
  - `features/parser/` ✅
  - `features/upload/` ✅
  - `features/publish/` ✅

**Warum existiert es?**
- Vermutlich dachte jemand "Workflow = flows"
- Aber das ist **KEIN Standard**!
- React Best Practice: Alles in `features/` oder `components/`

**✅ PROFIS würden machen:**
```
features/
├── parser/
├── upload/
└── publish/
```

---

### ❌ **2. `styles/` - LEERER ORDNER!**

**Problem:**
- Ordner existiert, ist aber **LEER**!
- Unnötiger Ordner

**✅ PROFIS würden machen:**
- Löschen oder Styles in `shared/styles/` oder direkt in Components

---

### ✅ **3. `app/` - OK**

```
app/
├── App.jsx        ✅ Main App Component
└── main.jsx       ✅ Entry Point
```

**Status:** ✅ KORREKT - Standard React Setup

---

### ⚠️ **4. `features/` - GEMISCHTE NAMING CONVENTIONS**

**Struktur:**
```
features/
├── event/         ✅ OK
├── history/       ⚠️ WARUM GETRENNT VON event?
├── platform/      ✅ OK
├── schema/        ✅ OK
└── templates/     ✅ OK
```

**Problem:**
- `history/` ist eigentlich Teil von `event/`!
- Warum getrennt?
- `features/event/history/` wäre logischer!

---

### ✅ **5. `pages/` - OK**

```
pages/
├── HomePage.jsx           ✅ PascalCase
├── TemplatesPage.jsx      ✅ PascalCase
├── HistoryPage.jsx        ✅ PascalCase
├── EventDetailPage.jsx    ✅ PascalCase
└── PlatformsPage.jsx     ✅ PascalCase
```

**Status:** ✅ KORREKT - Alle PascalCase

---

### ✅ **6. `shared/` - OK**

```
shared/
├── components/    ✅ Shared Components
├── hooks/          ✅ Shared Hooks
└── utils/           ✅ Shared Utils
```

**Status:** ✅ KORREKT

---

### ✅ **7. `i18n/` - OK**

```
i18n/
├── index.ts
└── locales/
    ├── de.json
    ├── en.json
    └── es.json
```

**Status:** ✅ KORREKT

---

## 🔴 NAMING CONVENTIONS - GEMISCHT!

### ❌ **1. Doppelte Component-Namen**

#### **HashtagBuilder.jsx - 2x!**
- `flows/parser/HashtagBuilder.jsx` ⚠️
- `features/platform/components/HashtagBuilder.jsx` ⚠️

**Problem:**
- Gleicher Name, unterschiedliche Orte!
- Verwirrend!
- Welcher wird wo verwendet?

**✅ PROFIS würden machen:**
- `features/platform/components/HashtagBuilder.jsx` (für Platform)
- `features/parser/components/HashtagBuilder.jsx` (für Parser)
- Oder: `ParserHashtagBuilder.jsx` vs `PlatformHashtagBuilder.jsx`

---

#### **Selector.jsx - 2x!**
- `features/platform/components/Selector.jsx` ⚠️
- `features/templates/components/Selector.jsx` ⚠️

**Problem:**
- Gleicher Name!
- Muss immer umbenannt werden: `Selector as PlatformSelector`

**✅ PROFIS würden machen:**
- `PlatformSelector.jsx` ✅
- `TemplateSelector.jsx` ✅
- Oder: `features/platform/components/PlatformSelector.jsx`

---

#### **Editor.jsx - 2x!**
- `features/platform/components/Editor.jsx` ⚠️
- `features/templates/components/Editor.jsx` ⚠️

**Problem:**
- Gleicher Name!
- Muss immer umbenannt werden: `Editor as TemplateEditor`

**✅ PROFIS würden machen:**
- `PlatformEditor.jsx` ✅
- `TemplateEditor.jsx` ✅

---

#### **Preview.jsx - 2x!**
- `features/platform/components/Preview.jsx` ⚠️
- `features/templates/components/Preview.jsx` ⚠️

**Problem:**
- Gleicher Name!
- Muss immer umbenannt werden: `Preview as TemplatePreview`

**✅ PROFIS würden machen:**
- `PlatformPreview.jsx` ✅
- `TemplatePreview.jsx` ✅

---

### ❌ **2. Inkonsistente Card-Namen**

#### **HistoryCard vs EventCard**
- `features/event/components/HistoryCard.jsx` ⚠️
- `features/history/components/EventCard.jsx` ⚠️

**Problem:**
- Beide sind Cards für Events!
- Warum unterschiedliche Namen?
- `HistoryCard` ist für HomePage
- `EventCard` ist für HistoryPage

**✅ PROFIS würden machen:**
- `EventHistoryCard.jsx` (für HomePage)
- `EventCard.jsx` (für HistoryPage)
- Oder: `EventCard.jsx` (beide, aber in unterschiedlichen Features)

---

### ❌ **3. Inkonsistente Preview-Namen**

#### **DataPreview vs Preview**
- `features/event/components/DataPreview.jsx` ⚠️
- `features/platform/components/Preview.jsx` ⚠️
- `features/templates/components/Preview.jsx` ⚠️

**Problem:**
- Warum heißt einer `DataPreview` und die anderen `Preview`?
- Inkonsistent!

**✅ PROFIS würden machen:**
- `EventDataPreview.jsx` ✅
- `PlatformPreview.jsx` ✅
- `TemplatePreview.jsx` ✅
- Oder: Alle `Preview.jsx`, aber in unterschiedlichen Features (OK wenn klar getrennt)

---

## 📊 FEATURES-STRUKTUR ANALYSE

### ✅ **1. `features/event/`**

```
event/
├── components/
│   ├── DataPreview.jsx      ⚠️ Sollte EventDataPreview.jsx heißen?
│   ├── History.jsx           ✅ OK
│   └── HistoryCard.jsx      ⚠️ Sollte EventHistoryCard.jsx heißen?
└── index.js                  ✅ OK
```

**Exports:**
```js
export { default as DataPreview } from './components/DataPreview'
export { default as History } from './components/History'
export { default as HistoryCard } from './components/HistoryCard'
```

**Problem:**
- `DataPreview` - zu generisch!
- `HistoryCard` - zu generisch!

---

### ⚠️ **2. `features/history/`**

```
history/
└── components/
    ├── EventCard.jsx         ✅ OK (aber warum nicht in event/?)
    └── PlatformStatsCard.jsx ✅ OK
```

**Problem:**
- Warum getrennt von `event/`?
- `history` ist Teil von `event`!
- Sollte `features/event/history/` sein!

**✅ PROFIS würden machen:**
```
features/event/
├── components/
│   ├── EventCard.jsx          (für HistoryPage)
│   ├── EventHistoryCard.jsx  (für HomePage)
│   └── PlatformStatsCard.jsx (für EventDetailPage)
└── history/
    └── components/
        └── EventCard.jsx
```

Oder alles in `features/event/components/`!

---

### ⚠️ **3. `features/platform/`**

```
platform/
├── components/
│   ├── Selector.jsx          ⚠️ Sollte PlatformSelector.jsx heißen
│   ├── Editor.jsx            ⚠️ Sollte PlatformEditor.jsx heißen
│   ├── Preview.jsx           ⚠️ Sollte PlatformPreview.jsx heißen
│   └── HashtagBuilder.jsx    ✅ OK (aber doppelt mit flows/)
├── hooks/
└── index.js
```

**Exports:**
```js
export { default as Editor } from './components/Editor'
export { default as Container } from './components/Container'
export { default as Selector } from './components/Selector'
// ...
```

**Problem:**
- Zu generische Namen!
- Muss immer umbenannt werden beim Import!

---

### ⚠️ **4. `features/templates/`**

```
templates/
├── components/
│   ├── Selector.jsx          ⚠️ Sollte TemplateSelector.jsx heißen
│   ├── Editor.jsx           ⚠️ Sollte TemplateEditor.jsx heißen
│   ├── Preview.jsx           ⚠️ Sollte TemplatePreview.jsx heißen
│   └── List.jsx              ✅ OK
└── index.js
```

**Exports:**
```js
export { default as List } from './components/List'
export { default as Selector } from './components/Selector'
export { default as Preview } from './components/Preview'
export { default as Editor } from './components/Editor'
```

**Problem:**
- Zu generische Namen!
- Muss immer umbenannt werden beim Import!

---

### ✅ **5. `features/schema/`**

```
schema/
├── components/
│   ├── Renderer.jsx          ✅ OK
│   ├── CompositeRenderer.jsx ✅ OK
│   └── ...
└── index.js
```

**Status:** ✅ KORREKT - Eindeutige Namen

---

## 🎯 PROFIS WÜRDEN MACHEN:

### ✅ **1. Ordner-Struktur**

```
src/
├── app/                    ✅ OK
├── features/               ✅ OK (aber alles hier!)
│   ├── event/              ✅
│   │   ├── components/     ✅
│   │   │   ├── EventCard.jsx              ✅ (für HistoryPage)
│   │   │   ├── EventHistoryCard.jsx      ✅ (für HomePage)
│   │   │   ├── EventDataPreview.jsx      ✅
│   │   │   └── PlatformStatsCard.jsx     ✅
│   │   └── index.js
│   ├── parser/             ✅ (statt flows/parser/)
│   │   ├── components/
│   │   │   ├── EventParser.jsx
│   │   │   ├── ParserHashtagBuilder.jsx  ✅ (statt HashtagBuilder.jsx)
│   │   │   └── ...
│   ├── upload/              ✅ (statt flows/upload/)
│   ├── publish/             ✅ (statt flows/publish/)
│   ├── platform/
│   │   ├── components/
│   │   │   ├── PlatformSelector.jsx      ✅ (statt Selector.jsx)
│   │   │   ├── PlatformEditor.jsx        ✅ (statt Editor.jsx)
│   │   │   ├── PlatformPreview.jsx       ✅ (statt Preview.jsx)
│   │   │   └── PlatformHashtagBuilder.jsx ✅
│   ├── templates/
│   │   ├── components/
│   │   │   ├── TemplateSelector.jsx         ✅ (statt Selector.jsx)
│   │   │   ├── TemplateEditor.jsx        ✅ (statt Editor.jsx)
│   │   │   └── TemplatePreview.jsx       ✅ (statt Preview.jsx)
│   └── schema/              ✅ OK
├── pages/                   ✅ OK
├── shared/                  ✅ OK
├── i18n/                    ✅ OK
└── styles/                  ❌ LÖSCHEN (leer!)
```

---

### ✅ **2. Naming Conventions**

**Regel:**
- **PascalCase** für Components ✅
- **Eindeutige Namen** - kein `Selector.jsx`, sondern `PlatformSelector.jsx` ✅
- **Feature-Präfix** wenn nötig: `EventCard`, `PlatformEditor`, `TemplateSelector` ✅

**Beispiele:**
- ❌ `Selector.jsx` → ✅ `PlatformSelector.jsx`
- ❌ `Editor.jsx` → ✅ `PlatformEditor.jsx`
- ❌ `Preview.jsx` → ✅ `PlatformPreview.jsx`
- ❌ `DataPreview.jsx` → ✅ `EventDataPreview.jsx`
- ❌ `HistoryCard.jsx` → ✅ `EventHistoryCard.jsx`

---

### ✅ **3. Index.js Exports**

**Aktuell:**
```js
// features/platform/index.js
export { default as Selector } from './components/Selector'
export { default as Editor } from './components/Editor'
```

**✅ PROFIS würden machen:**
```js
// features/platform/index.js
export { default as PlatformSelector } from './components/PlatformSelector'
export { default as PlatformEditor } from './components/PlatformEditor'
```

**Vorteil:**
- Keine Umbenennung nötig beim Import!
- `import { PlatformSelector } from '../features/platform'` ✅

---

## 📋 ZUSAMMENFASSUNG

### ❌ **HAUPTPROBLEME:**

1. **`flows/` ist UNNÖTIG** - sollte in `features/` rein
2. **`styles/` ist LEER** - löschen
3. **Doppelte Components:** `HashtagBuilder.jsx` (2x), `Selector.jsx` (2x), `Editor.jsx` (2x), `Preview.jsx` (2x)
4. **Zu generische Namen:** `Selector`, `Editor`, `Preview`, `DataPreview`
5. **`history/` getrennt von `event/`** - sollte zusammen sein
6. **Inkonsistente Naming:** `HistoryCard` vs `EventCard`

### ✅ **WAS IST OK:**

1. `pages/` - Alle PascalCase ✅
2. `shared/` - Struktur OK ✅
3. `i18n/` - OK ✅
4. `app/` - OK ✅
5. `features/` - Grundstruktur OK, aber Naming verbessern ✅

---

## 🚀 EMPFEHLUNGEN

1. **`flows/` → `features/`** umbenennen
2. **`styles/` löschen** (leer)
3. **`history/` → `features/event/history/`** verschieben
4. **Component-Namen eindeutig machen:**
   - `Selector.jsx` → `PlatformSelector.jsx` / `TemplateSelector.jsx`
   - `Editor.jsx` → `PlatformEditor.jsx` / `TemplateEditor.jsx`
   - `Preview.jsx` → `PlatformPreview.jsx` / `TemplatePreview.jsx`
   - `DataPreview.jsx` → `EventDataPreview.jsx`
   - `HistoryCard.jsx` → `EventHistoryCard.jsx`
5. **Index.js Exports anpassen** - mit eindeutigen Namen



.
├── app
│   ├── App.jsx
│   └── main.jsx
├── config.js
├── features
│   ├── event
│   │   ├── components
│   │   │   ├── DataPreview.jsx
│   │   │   ├── HistoryCard.jsx
│   │   │   └── History.jsx
│   │   └── index.js
│   ├── history
│   │   └── components
│   │       ├── EventCard.jsx
│   │       └── PlatformStatsCard.jsx
│   ├── platform
│   │   ├── components
│   │   │   ├── blocks
│   │   │   │   └── FileSelectionBlock.jsx
│   │   │   ├── Container.jsx
│   │   │   ├── Editor.jsx
│   │   │   ├── HashtagBuilder.jsx
│   │   │   ├── HashtagSelector.jsx
│   │   │   ├── Panel.jsx
│   │   │   ├── Preview.jsx
│   │   │   ├── Selector.jsx
│   │   │   └── SettingsModal.jsx
│   │   ├── hooks
│   │   │   ├── usePlatformSchema.js
│   │   │   └── usePlatformTranslations.js
│   │   └── index.js
│   ├── schema
│   │   ├── components
│   │   │   ├── CompositeRenderer.jsx
│   │   │   ├── custom
│   │   │   ├── GroupList.jsx
│   │   │   ├── Renderer.jsx
│   │   │   └── TargetList.jsx
│   │   └── index.js
│   └── templates
│       ├── components
│       │   ├── BulkApplier.jsx
│       │   ├── Editor.jsx
│       │   ├── List.jsx
│       │   ├── Preview.jsx
│       │   ├── Selector.jsx
│       │   ├── utils
│       │   │   └── schemaConverter.js
│       │   └── VisualBuilder
│       │       ├── BlockPalette.jsx
│       │       ├── blocks
│       │       │   ├── BlockRenderer.jsx
│       │       │   ├── RichTextBlock.jsx
│       │       │   └── TextBlock.jsx
│       │       ├── DropZone.jsx
│       │       ├── hooks
│       │       │   └── useBlockDragDrop.js
│       │       ├── LivePreview.jsx
│       │       ├── SortableBlockItem.jsx
│       │       ├── TemplateBuilder.jsx
│       │       └── VariableToolbar.jsx
│       ├── hooks
│       │   ├── useTemplateCategories.js
│       │   ├── useTemplatesByCategory.js
│       │   └── useTemplates.js
│       └── index.js
├── flows
│   ├── parser
│   │   ├── EventParser.jsx
│   │   ├── HashtagBuilder.jsx
│   │   ├── PublishParser.jsx
│   │   └── UploadParser.jsx
│   ├── publish
│   │   └── Results.jsx
│   └── upload
│       └── FileUpload.jsx
├── i18n
│   ├── index.ts
│   └── locales
│       ├── de.json
│       ├── en.json
│       └── es.json
├── index.css
├── pages
│   ├── EventDetailPage.jsx
│   ├── HistoryPage.jsx
│   ├── HomePage.jsx
│   ├── PlatformsPage.jsx
│   └── TemplatesPage.jsx
├── shared
│   ├── components
│   │   ├── EditModal.jsx
│   │   ├── Header.jsx
│   │   ├── PreviewFrame.jsx
│   │   └── ui
│   │       ├── DateDisplay.tsx
│   │       ├── DateInput.tsx
│   │       ├── Dialog
│   │       │   ├── Duplicate.jsx
│   │       │   └── Settings.jsx
│   │       ├── HelperIcon.jsx
│   │       └── TimeInput.tsx
│   ├── hooks
│   └── utils
│       ├── api.js
│       ├── axiosConfig.js
│       ├── dateUtils.ts
│       ├── localeUtils.ts
│       ├── targetUtils.ts
│       ├── templateUtils.js
│       ├── urlUtils.js
│       └── validation.js
├── store.js
└── styles

35 directories, 80 files


## 🌳 TREE SHOULD LOOK BE:

```
frontend/src/
├── app/                              ✅ OK
│   ├── App.jsx
│   └── main.jsx
│
├── config.js                         ✅ OK
│
├── features/                         ✅ ALLE FEATURES HIER!
│   ├── event/                       ✅ Event Features
│   │   ├── components/
│   │   │   ├── EventCard.jsx                    ✅ (für HistoryPage - umbenannt von history/EventCard.jsx)
│   │   │   ├── EventHistoryCard.jsx            ✅ (für HomePage - umbenannt von HistoryCard.jsx)
│   │   │   ├── EventDataPreview.jsx             ✅ (umbenannt von DataPreview.jsx)
│   │   │   ├── EventHistory.jsx                 ✅ (umbenannt von History.jsx)
│   │   │   └── PlatformStatsCard.jsx            ✅ (verschoben von history/PlatformStatsCard.jsx)
│   │   └── index.js
│   │
│   ├── parser/                      ✅ (verschoben von flows/parser/)
│   │   ├── components/
│   │   │   ├── EventParser.jsx
│   │   │   ├── ParserHashtagBuilder.jsx         ✅ (umbenannt von HashtagBuilder.jsx)
│   │   │   ├── PublishParser.jsx
│   │   │   └── UploadParser.jsx
│   │   └── index.js
│   │
│   ├── upload/                      ✅ (verschoben von flows/upload/)
│   │   ├── components/
│   │   │   └── FileUpload.jsx
│   │   └── index.js
│   │
│   ├── publish/                     ✅ (verschoben von flows/publish/)
│   │   ├── components/
│   │   │   └── Results.jsx
│   │   └── index.js
│   │
│   ├── platform/                    ✅ Platform Features
│   │   ├── components/
│   │   │   ├── blocks/
│   │   │   │   └── FileSelectionBlock.jsx
│   │   │   ├── Container.jsx
│   │   │   ├── PlatformEditor.jsx               ✅ (umbenannt von Editor.jsx)
│   │   │   ├── PlatformHashtagBuilder.jsx      ✅ (umbenannt von HashtagBuilder.jsx)
│   │   │   ├── HashtagSelector.jsx
│   │   │   ├── Panel.jsx
│   │   │   ├── PlatformPreview.jsx            ✅ (umbenannt von Preview.jsx)
│   │   │   ├── PlatformSelector.jsx            ✅ (umbenannt von Selector.jsx)
│   │   │   └── SettingsModal.jsx
│   │   ├── hooks/
│   │   │   ├── usePlatformSchema.js
│   │   │   └── usePlatformTranslations.js
│   │   └── index.js
│   │
│   ├── schema/                      ✅ Schema Features
│   │   ├── components/
│   │   │   ├── CompositeRenderer.jsx
│   │   │   ├── custom/
│   │   │   ├── GroupList.jsx
│   │   │   ├── Renderer.jsx
│   │   │   └── TargetList.jsx
│   │   └── index.js
│   │
│   └── templates/                   ✅ Template Features
│       ├── components/
│       │   ├── BulkApplier.jsx
│       │   ├── TemplateEditor.jsx              ✅ (umbenannt von Editor.jsx)
│       │   ├── List.jsx
│       │   ├── TemplatePreview.jsx            ✅ (umbenannt von Preview.jsx)
│       │   ├── TemplateSelector.jsx            ✅ (umbenannt von Selector.jsx)
│       │   ├── utils/
│       │   │   └── schemaConverter.js
│       │   └── VisualBuilder/
│       │       ├── BlockPalette.jsx
│       │       ├── blocks/
│       │       │   ├── BlockRenderer.jsx
│       │       │   ├── RichTextBlock.jsx
│       │       │   └── TextBlock.jsx
│       │       ├── DropZone.jsx
│       │       ├── hooks/
│       │       │   └── useBlockDragDrop.js
│       │       ├── LivePreview.jsx
│       │       ├── SortableBlockItem.jsx
│       │       ├── TemplateBuilder.jsx
│       │       └── VariableToolbar.jsx
│       ├── hooks/
│       │   ├── useTemplateCategories.js
│       │   ├── useTemplatesByCategory.js
│       │   └── useTemplates.js
│       └── index.js
│
├── i18n/                            ✅ OK
│   ├── index.ts
│   └── locales/
│       ├── de.json
│       ├── en.json
│       └── es.json
│
├── index.css                        ✅ OK
│
├── pages/                           ✅ OK - Alle PascalCase, Event-bezogen
│   ├── EventWorkflowPage.jsx        ✅ (umbenannt von HomePage.jsx)
│   ├── TemplateManagementPage.jsx   ✅ (umbenannt von TemplatesPage.jsx)
│   ├── EventHistoryPage.jsx         ✅ (umbenannt von HistoryPage.jsx)
│   ├── EventDetailPage.jsx          ✅ (bleibt gleich)
│   └── PlatformSettingsPage.jsx     ✅ (umbenannt von PlatformsPage.jsx)
│
├── shared/                          ✅ OK
│   ├── components/
│   │   ├── EditModal.jsx
│   │   ├── Header.jsx
│   │   ├── PreviewFrame.jsx
│   │   └── ui/
│   │       ├── DateDisplay.tsx
│   │       ├── DateInput.tsx
│   │       ├── Dialog/
│   │       │   ├── Duplicate.jsx
│   │       │   └── Settings.jsx
│   │       ├── HelperIcon.jsx
│   │       └── TimeInput.tsx
│   ├── hooks/
│   └── utils/
│       ├── api.js
│       ├── axiosConfig.js
│       ├── dateUtils.ts
│       ├── localeUtils.ts
│       ├── targetUtils.ts
│       ├── templateUtils.js
│       ├── urlUtils.js
│       └── validation.js
│
└── store.js                         ✅ OK

❌ GELÖSCHT:
- flows/                             ❌ (verschoben nach features/)
- styles/                            ❌ (leer, unnötig)
- features/history/                  ❌ (verschoben nach features/event/components/)
```

---

## 📝 ÄNDERUNGS-LISTE:

### 1. **Ordner-Verschiebungen:**
- ✅ `flows/parser/` → `features/parser/`
- ✅ `flows/upload/` → `features/upload/`
- ✅ `flows/publish/` → `features/publish/`
- ✅ `features/history/` → `features/event/components/` (Components verschoben)
- ❌ `styles/` → **GELÖSCHT** (leer)

### 2. **Component-Umbenennungen:**

#### **features/event/components/**
- ✅ `HistoryCard.jsx` → `EventHistoryCard.jsx`
- ✅ `DataPreview.jsx` → `EventDataPreview.jsx`
- ✅ `History.jsx` → `EventHistory.jsx` (optional, aber konsistenter)

#### **features/history/components/** → **features/event/components/**
- ✅ `EventCard.jsx` → bleibt `EventCard.jsx` (verschoben)
- ✅ `PlatformStatsCard.jsx` → bleibt `PlatformStatsCard.jsx` (verschoben)

#### **features/platform/components/**
- ✅ `Selector.jsx` → `PlatformSelector.jsx`
- ✅ `Editor.jsx` → `PlatformEditor.jsx`
- ✅ `Preview.jsx` → `PlatformPreview.jsx`
- ✅ `HashtagBuilder.jsx` → `PlatformHashtagBuilder.jsx`

#### **features/templates/components/**
- ✅ `Selector.jsx` → `TemplateSelector.jsx`
- ✅ `Editor.jsx` → `TemplateEditor.jsx`
- ✅ `Preview.jsx` → `TemplatePreview.jsx`

#### **features/parser/components/**
- ✅ `HashtagBuilder.jsx` → `ParserHashtagBuilder.jsx`

### 3. **Index.js Updates:**

#### **features/event/index.js**
```js
export { default as EventCard } from './components/EventCard'
export { default as EventHistoryCard } from './components/EventHistoryCard'
export { default as EventDataPreview } from './components/EventDataPreview'
export { default as EventHistory } from './components/EventHistory'
export { default as PlatformStatsCard } from './components/PlatformStatsCard'
```

#### **features/platform/index.js**
```js
export { default as Container } from './components/Container'
export { default as PlatformSelector } from './components/PlatformSelector'
export { default as PlatformEditor } from './components/PlatformEditor'
export { default as PlatformPreview } from './components/PlatformPreview'
export { default as PlatformHashtagBuilder } from './components/PlatformHashtagBuilder'
export { default as HashtagSelector } from './components/HashtagSelector'
export { default as Panel } from './components/Panel'
export { default as SettingsModal } from './components/SettingsModal'
```

#### **features/templates/index.js**
```js
export { default as List } from './components/List'
export { default as TemplateSelector } from './components/TemplateSelector'
export { default as TemplatePreview } from './components/TemplatePreview'
export { default as TemplateEditor } from './components/TemplateEditor'
export { default as BulkApplier } from './components/BulkApplier'
```

#### **features/parser/index.js** (NEU)
```js
export { default as EventParser } from './components/EventParser'
export { default as ParserHashtagBuilder } from './components/ParserHashtagBuilder'
export { default as PublishParser } from './components/PublishParser'
export { default as UploadParser } from './components/UploadParser'
```

#### **features/upload/index.js** (NEU)
```js
export { default as FileUpload } from './components/FileUpload'
```

#### **features/publish/index.js** (NEU)
```js
export { default as Results } from './components/Results'
```

### 4. **Import-Updates in Pages:**

#### **HomePage.jsx**
```js
// ALT:
import { History as EventHistory } from '../features/event'
import FileUpload from '../flows/upload/FileUpload'
import { DataPreview as Preview } from '../features/event'
import { Selector as PlatformSelector } from '../features/platform'
import HashtagBuilder from '../flows/parser/HashtagBuilder'

// NEU:
import { EventHistory, EventDataPreview } from '../features/event'
import { FileUpload } from '../features/upload'
import { PlatformSelector } from '../features/platform'
import { ParserHashtagBuilder } from '../features/parser'
```

#### **HistoryPage.jsx**
```js
// ALT:
import EventCard from '../features/history/components/EventCard'

// NEU:
import { EventCard } from '../features/event'
```

#### **EventDetailPage.jsx**
```js
// ALT:
import PlatformStatsCard from '../features/history/components/PlatformStatsCard'

// NEU:
import { PlatformStatsCard } from '../features/event'
```

#### **TemplatesPage.jsx**
```js
// ALT:
import { List as TemplateList } from '../features/templates'
import { Preview as TemplatePreview } from '../features/templates'
import { Editor as TemplateEditor } from '../features/templates'

// NEU:
import { List, TemplatePreview, TemplateEditor } from '../features/templates'
```

---

## ✅ VORTEILE DER NEUEN STRUKTUR:

1. **Keine doppelten Component-Namen mehr** ✅
2. **Eindeutige Imports** - keine Umbenennung nötig ✅
3. **Konsistente Naming Conventions** ✅
4. **Alles in `features/`** - keine unnötigen Ordner ✅
5. **Klare Feature-Trennung** ✅
6. **Einfachere Wartung** ✅

---

## 📄 PAGE-NAMEN ANALYSE & EMPFEHLUNGEN

### ⚠️ **AKTUELLE PAGE-NAMEN - ZU GENERISCH**

```
pages/
├── HomePage.jsx           ⚠️ Zu generisch - was ist "Home"?
├── TemplatesPage.jsx     ⚠️ OK, aber könnte spezifischer sein
├── HistoryPage.jsx        ⚠️ Zu generisch - History von was?
├── EventDetailPage.jsx    ✅ OK - klar Event-bezogen
└── PlatformsPage.jsx     ⚠️ Zu generisch - was macht die Page?
```

**Problem:**
- `HomePage` - Was ist "Home"? Zu generisch!
- `HistoryPage` - History von was? Zu generisch!
- `PlatformsPage` - Was macht die Page? Zu generisch!
- Nicht Event-bezogen genug für einen **Event Promoter**

---

### ✅ **BESSERE PAGE-NAMEN (EVENT-BEZOGEN)**

```
pages/
├── EventWorkflowPage.jsx      ✅ Event Creation Workflow
├── TemplateManagementPage.jsx ✅ Template CRUD
├── EventHistoryPage.jsx       ✅ Event Tracking
├── EventDetailPage.jsx        ✅ Event Details (bleibt)
└── PlatformSettingsPage.jsx   ✅ Platform Configuration
```

---

### 📋 **DETAILLIERTE BEGRÜNDUNG**

#### **1. `HomePage` → `EventWorkflowPage`**

**Warum:**
- ❌ "Home" ist zu generisch - was ist "Home"?
- ✅ Die Page ist der **Event-Workflow**: Upload → Parse → Edit → Publish
- ✅ Name beschreibt die **Funktion**, nicht den Ort

**Alternativen:**
- `EventCreationPage` - Fokussiert auf Erstellung
- `EventWorkflowPage` - Beschreibt den Workflow ✅ **EMPFOHLEN**
- `CreateEventPage` - Kürzer, aber weniger beschreibend

**Route:** `/` (bleibt gleich)

---

#### **2. `TemplatesPage` → `TemplateManagementPage`**

**Warum:**
- ⚠️ "Templates" allein ist zu generisch
- ✅ Die Page **verwaltet** Templates (CRUD: Create, Read, Update, Delete)
- ✅ Name macht die **Funktion** klar

**Alternativen:**
- `TemplatesPage` - Kürzer, aber weniger klar
- `TemplateManagementPage` - Klar, aber länger ✅ **EMPFOHLEN**

**Route:** `/templates` (bleibt gleich)

---

#### **3. `HistoryPage` → `EventHistoryPage`**

**Warum:**
- ❌ "History" ist zu generisch - History von was?
- ✅ Es geht um **Event-History**
- ✅ Konsistent mit `EventDetailPage`
- ✅ Event-bezogen für **Event Promoter**

**Route:** `/events` oder `/history` (beide OK)

---

#### **4. `EventDetailPage` → bleibt gleich**

**Warum:**
- ✅ Name ist bereits klar und Event-bezogen
- ✅ Keine Änderung nötig

**Route:** `/events/:eventId` oder `/history/:eventId`

---

#### **5. `PlatformsPage` → `PlatformSettingsPage`**

**Warum:**
- ❌ "Platforms" ist zu generisch - was macht die Page?
- ✅ Die Page ist für **Platform-Einstellungen** (ähnlich Settings Modal)
- ✅ Name macht die **Funktion** klar

**Alternativen:**
- `PlatformConfigurationPage` - Länger, aber präziser
- `PlatformSettingsPage` - Kürzer, klar ✅ **EMPFOHLEN**

**Route:** `/platforms` oder `/settings/platforms`

---

## 🎯 FINALE EMPFEHLUNG

### **Page-Namen:**

| Aktuell | Besser | Grund |
|---------|--------|-------|
| `HomePage` | `EventWorkflowPage` | Beschreibt den Workflow |
| `TemplatesPage` | `TemplateManagementPage` | Macht CRUD klar |
| `HistoryPage` | `EventHistoryPage` | Event-bezogen, konsistent |
| `EventDetailPage` | `EventDetailPage` | Bereits gut ✅ |
| `PlatformsPage` | `PlatformSettingsPage` | Macht Funktion klar |

### **Routing-Updates:**

```js
// App.jsx
<Routes>
  <Route path="/" element={<EventWorkflowPage />} />
  <Route path="/templates" element={<TemplateManagementPage />} />
  <Route path="/events" element={<EventHistoryPage />} />
  <Route path="/events/:eventId" element={<EventDetailPage />} />
  <Route path="/settings/platforms" element={<PlatformSettingsPage />} />
</Routes>
```

**Oder kürzere Routes (beide OK):**
```js
<Routes>
  <Route path="/" element={<EventWorkflowPage />} />
  <Route path="/templates" element={<TemplateManagementPage />} />
  <Route path="/history" element={<EventHistoryPage />} />
  <Route path="/history/:eventId" element={<EventDetailPage />} />
  <Route path="/platforms" element={<PlatformSettingsPage />} />
</Routes>
```

---

## ✅ **VORTEILE DER NEUEN NAMEN:**

1. **Event-bezogen** - Alle Namen beziehen sich auf Events (außer Templates/Platforms)
2. **Selbsterklärend** - Name beschreibt die Funktion
3. **Konsistent** - Einheitliche Namenskonvention
4. **Professionell** - Klare, beschreibende Namen

---

## 📝 **UMBENENNUNGS-LISTE:**

1. ✅ `HomePage.jsx` → `EventWorkflowPage.jsx`
2. ✅ `TemplatesPage.jsx` → `TemplateManagementPage.jsx`
3. ✅ `HistoryPage.jsx` → `EventHistoryPage.jsx`
4. ✅ `PlatformsPage.jsx` → `PlatformSettingsPage.jsx`
5. ✅ `EventDetailPage.jsx` → bleibt gleich ✅

### **Import-Updates:**

#### **App.jsx**
```js
// ALT:
import HomePage from '../pages/HomePage'
import TemplatesPage from '../pages/TemplatesPage'
import HistoryPage from '../pages/HistoryPage'
import PlatformsPage from '../pages/PlatformsPage'

// NEU:
import EventWorkflowPage from '../pages/EventWorkflowPage'
import TemplateManagementPage from '../pages/TemplateManagementPage'
import EventHistoryPage from '../pages/EventHistoryPage'
import PlatformSettingsPage from '../pages/PlatformSettingsPage'
```

---

*Letzte Aktualisierung: 2025-01-XX*