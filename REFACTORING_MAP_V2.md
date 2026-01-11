# Component Refactoring Map V2 - Feature-Based Structure

## Finale Struktur (Tree)

```
src/
├── app/                          # App-Level (Routing, Theme, etc.)
│   ├── App.jsx
│   └── main.jsx
│
├── pages/                        # Routes/Pages (Layout + Routing)
│   ├── HomePage.jsx              # Main App (EventPromoter)
│   ├── templates.jsx             # TemplatePage
│   ├── templates.jsx             # TemplatePage
│   └── templates.jsx             # TemplatePage    
│
├── features/                     # Feature Modules (Domain Logic)
│   │
│   ├── templates/                # Template Feature
│   │   ├── components/
│   │   │   ├── List.jsx          # TemplateList
│   │   │   ├── Selector.jsx       # TemplateSelector
│   │   │   ├── Preview.jsx        # TemplatePreview
│   │   │   └── BulkApplier.jsx   # BulkTemplateApplier
│   │   ├── hooks/
│   │   │   ├── useTemplates.js
│   │   │   └── useTemplateCategories.js
│   │   └── index.js              # Feature Exports
│   │
│   ├── platform/                 # Platform Feature
│   │   ├── components/
│   │   │   ├── Editor.jsx        # GenericPlatformEditor (1 Platform)
│   │   │   ├── Container.jsx    # ContentEditor (Multi-Platform)
│   │   │   ├── Selector.jsx     # PlatformSelector
│   │   │   ├── Preview.jsx       # PlatformPreview
│   │   │   ├── HashtagBuilder.jsx
│   │   │   ├── HashtagSelector.jsx
│   │   │   ├── Panel.jsx         # DynamicPanelWrapper
│   │   │   └── SettingsModal.jsx # SchemaSettingsPanel
│   │   ├── hooks/
│   │   │   ├── usePlatformSchema.js
│   │   │   └── usePlatformTranslations.js
│   │   └── index.js
│   │
│   ├── event/                    # Event Feature
│   │   ├── components/
│   │   │   ├── DataPreview.jsx   # Preview/Preview.jsx
│   │   │   ├── History.jsx       # EventHistory
│   │   │   └── HistoryCard.jsx  # EventHistoryCard
│   │   └── index.js
│   │
│   └── schema/                   # Schema Feature
│       ├── components/
│       │   └── Renderer.jsx      # SchemaRenderer
│       └── index.js
│
├── flows/                        # Use-Cases / Workflows
│   ├── parser/
│   │   ├── EventParser.jsx
│   │   ├── UploadParser.jsx
│   │   └── PublishParser.jsx
│   │
│   ├── upload/
│   │   └── FileUpload.jsx
│   │
│   └── publish/
│       └── Results.jsx           # PublishResults
│
└── shared/                       # Shared across features
    ├── components/               # Generic/Reusable Components
    │   ├── ui/
    │   │   ├── Dialog/
    │   │   │   ├── Duplicate.jsx
    │   │   │   └── Settings.jsx  # SettingsModal (N8N Webhook)
    │   │   └── DateDisplay.tsx
    │   └── index.js
    │
    ├── hooks/                    # Shared Hooks
    │   └── (shared hooks)
    │
    └── utils/                     # Shared Utils
        ├── dateUtils.ts
        ├── templateUtils.js
        └── validation.js
```

## Mapping Table

### PAGES/
| Alt | Neu | Notizen |
|-----|-----|---------|
| `pages/TemplatePage.jsx` | `pages/templates/index.jsx` | Template Management Page |

### FEATURES/templates/
| Alt | Neu | Notizen |
|-----|-----|---------|
| `components/TemplateEditor/TemplateList.jsx` | `features/templates/components/List.jsx` | |
| `components/TemplateEditor/TemplateSelector.jsx` | `features/templates/components/Selector.jsx` | |
| `components/TemplateEditor/TemplatePreview.jsx` | `features/templates/components/Preview.jsx` | |
| `components/BulkTemplateApplier/BulkTemplateApplier.jsx` | `features/templates/components/BulkApplier.jsx` | |
| `hooks/useTemplates.js` | `features/templates/hooks/useTemplates.js` | |
| `hooks/useTemplateCategories.js` | `features/templates/hooks/useTemplateCategories.js` | |

### FEATURES/platform/
| Alt | Neu | Notizen |
|-----|-----|---------|
| `components/GenericPlatformEditor/GenericPlatformEditor.jsx` | `features/platform/components/Editor.jsx` | |
| `components/ContentEditor/ContentEditor.jsx` | `features/platform/components/Container.jsx` | |
| `components/PlatformSelector/PlatformSelector.jsx` | `features/platform/components/Selector.jsx` | |
| `components/PlatformPreview/PlatformPreview.jsx` | `features/platform/components/Preview.jsx` | |
| `components/HashtagBuilder/HashtagBuilder.jsx` | `features/platform/components/HashtagBuilder.jsx` | |
| `components/HashtagSelector/HashtagSelector.jsx` | `features/platform/components/HashtagSelector.jsx` | |
| `components/Panels/DynamicPanelWrapper.jsx` | `features/platform/components/Panel.jsx` | |
| `components/SchemaSettingsPanel/SchemaSettingsPanel.jsx` | `features/platform/components/SettingsModal.jsx` | |
| `hooks/usePlatformSchema.js` | `features/platform/hooks/usePlatformSchema.js` | |
| `hooks/usePlatformTranslations.js` | `features/platform/hooks/usePlatformTranslations.js` | |

### FEATURES/event/
| Alt | Neu | Notizen |
|-----|-----|---------|
| `components/Preview/Preview.jsx` | `features/event/components/DataPreview.jsx` | |
| `components/EventHistory/EventHistory.jsx` | `features/event/components/History.jsx` | |
| `components/EventHistoryCard/EventHistoryCard.jsx` | `features/event/components/HistoryCard.jsx` | |

### FEATURES/schema/
| Alt | Neu | Notizen |
|-----|-----|---------|
| `components/SchemaRenderer/SchemaRenderer.jsx` | `features/schema/components/Renderer.jsx` | |

### FLOWS/
| Alt | Neu | Notizen |
|-----|-----|---------|
| `components/EventParser/EventParser.jsx` | `flows/parser/EventParser.jsx` | |
| `components/Parser/UploadParser.jsx` | `flows/parser/UploadParser.jsx` | |
| `components/Parser/PublishParser.jsx` | `flows/parser/PublishParser.jsx` | |
| `components/FileUpload/FileUpload.jsx` | `flows/upload/FileUpload.jsx` | |
| `components/PublishResults/PublishResults.jsx` | `flows/publish/Results.jsx` | |

### SHARED/
| Alt | Neu | Notizen |
|-----|-----|---------|
| `components/DuplicateDialog/DuplicateDialog.jsx` | `shared/components/ui/Dialog/Duplicate.jsx` | |
| `components/SettingsModal/SettingsModal.jsx` | `shared/components/ui/Dialog/Settings.jsx` | App-Level (N8N) |
| `components/DateDisplay.tsx` | `shared/components/ui/DateDisplay.tsx` | |
| `utils/` | `shared/utils/` | |

## Vorteile dieser Struktur

✅ **Klare Trennung:**
- `pages/` = Routes/Layouts
- `features/` = Domain Logic (Components + Hooks zusammen)
- `flows/` = Use-Cases/Workflows
- `shared/` = Wiederverwendbare Teile

✅ **Feature Cohesion:**
- Alles zu einem Feature ist zusammen (Components, Hooks, Utils)
- Einfacher zu finden und zu warten

✅ **Skalierbar:**
- Neue Features einfach hinzufügen
- Klare Grenzen zwischen Features

✅ **Standard Pattern:**
- Ähnlich wie Feature-Sliced Design
- Viele moderne Projekte nutzen ähnliche Struktur

## Import Examples

### Before:
```javascript
import TemplateList from '../components/TemplateEditor/TemplateList'
import GenericPlatformEditor from '../components/GenericPlatformEditor/GenericPlatformEditor'
```

### After:
```javascript
import { List as TemplateList } from '../features/templates'
import { Editor } from '../features/platform'
// oder
import TemplateList from '../features/templates/components/List'
import Editor from '../features/platform/components/Editor'
```

