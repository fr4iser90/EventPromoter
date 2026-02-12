# Packages Overview

Dieser Ordner enthält gemeinsame Workspace-Packages für das Monorepo.

## Warum `packages/`?

`frontend` und `backend` teilen sich Contracts.  
Statt Typen doppelt zu pflegen, werden sie zentral als Package bereitgestellt.

Aktuell:
- `@eventpromoter/types` (shared TypeScript-Contracts)

## Was gehört in `@eventpromoter/types`?

Nur **plattformneutrale, geteilte Contracts**:

- API-DTOs (Request/Response-Typen)
- gemeinsame Primitive (z. B. `LocaleCode`, IDs, Result-Typen)
- schema-/form-nahe Typen, wenn sie generisch sind
- gemeinsame Domain-Modelle für Frontend + Backend

## Was gehört NICHT hinein?

Keine plattformspezifische Runtime- oder Business-Logik:

- kein `email`/`reddit`/`twitter`-spezifischer Code
- keine Publisher-Schritte / Service-Implementierungen
- keine UI-spezifischen Sonderregeln
- keine Backend-seitige Runtime-Validierungslogik

## Aktueller Stand

Bereits enthalten:
- `common`-Typen
- `template`-Contracts
- `schema`-Typen aus `backend/src/types/schema/*` (inkl. `primitives`, `forms`, `credentials`, `settings`, `editor`, `preview`, `template`, `targets`, `platform`, `version`, `eventData`)

## Zielbild

Frontend und Backend importieren gemeinsame Contracts nur noch aus:

```ts
import type { ... } from '@eventpromoter/types'
```


Damit werden Contract-Drift und stille Breaking Changes zwischen API und UI vermieden.

## Type-Placement-Regel (verbindlich)

Wenn du einen neuen Typ anlegst oder verschiebst, entscheide so:

1. **Wird der Typ in Frontend + Backend benutzt?**  
   -> `packages/types`
2. **Ist der Typ Teil eines API-Contracts (Request/Response/DTO)?**  
   -> `packages/types`
3. **Ist der Typ nur UI/Feature-intern (Props/State/ViewModel)?**  
   -> `frontend/src/features/<feature>/types.ts`
4. **Ist der Typ nur in einer einzigen Komponente sinnvoll nutzbar?**  
   -> lokal in dieser Komponente lassen

Kurzregel:
- **Cross-layer / API / Domain** -> `packages/types`
- **Frontend-UI-only** -> `frontend/src/features/*/types.ts`

## Import-Konvention

- Domain/API-Typen immer aus `@eventpromoter/types` (oder `@eventpromoter/types/schema/*`).
- Feature-UI-Typen immer aus `features/templates/types` bzw. `features/platform/types`.
- Keine Typ-Imports aus anderen Komponenten-Dateien, wenn es ein Feature-Typ ist.

## Offene Konsolidierung: von -> nach

### Templates-Feature

Nach `frontend/src/features/templates/types.ts` verschieben/konsolidieren:

- `frontend/src/features/templates/components/TemplateSelector.tsx`
  - `TemplateRecord`, `FileRef`, `TargetsSelection`
- `frontend/src/features/templates/components/TemplateEditor.tsx`
  - `TemplateRecord`, `TemplateSchemaField`, `TemplateSchema`, `PlatformSchema`
- `frontend/src/features/templates/components/TemplatePreview.tsx`
  - `PlatformSchema`, `TemplatePreviewProps`
- `frontend/src/features/templates/components/BulkApplier.tsx`
  - `TemplateChoice`, `PlatformTemplateInfo`, `ApplyResultEntry`, `ApplyResults`
- `frontend/src/features/templates/components/List.tsx`
  - `TemplateListProps`
- `frontend/src/features/templates/components/VisualBuilder/TemplateBuilder.tsx`
  - `TemplateBlock`, `TemplateField`, `BuilderSchema`, `BuilderTemplate`
- `frontend/src/features/templates/components/VisualBuilder/LivePreview.tsx`
  - `LivePreviewBlock`, `LivePreviewSchema`
- `frontend/src/features/templates/components/VisualBuilder/VariableToolbar.tsx`
  - `TemplateVariable`
- `frontend/src/features/templates/components/VisualBuilder/blocks/BlockRenderer.tsx`
  - `BlockData`, `TemplateBlock`, `FieldSchema`
- `frontend/src/features/templates/components/VisualBuilder/blocks/TextBlock.tsx`
  - `TemplateBlock`, `FieldSchema`
- `frontend/src/features/templates/components/VisualBuilder/SortableBlockItem.tsx`
  - `SortableBlockItemProps`
- `frontend/src/features/templates/components/VisualBuilder/blocks/RichTextBlock.tsx`
  - `RichTextBlockProps`

Nur wenn backend-relevant/cross-layer, danach in `packages/types` heben:
- aktuell **keine** der oben genannten UI-Typen automatisch heben
- nur heben, wenn sie API/Domain-Contract werden

### Platform-Feature

Nach `frontend/src/features/platform/types.ts` verschieben/konsolidieren:

- `frontend/src/features/platform/components/PlatformEditor.tsx`
  - `GenericRecord`, `UploadedFileRef`, `TargetsConfig`, `AppliedTemplateEntry`,
    `TemplateDefinition`, `TemplateRecord`, `EditorBlock`, `EditorSchema`,
    `PlatformConfig`, `ContentState`, `TemplateDisplayVar`
- `frontend/src/features/platform/components/PlatformPreview.tsx`
  - `PlatformData`, `PreviewItem`, `TargetsValue`
- `frontend/src/features/platform/components/Panel.tsx`
  - `PanelField`, `PanelSection`, `PanelConfig`
- `frontend/src/features/platform/components/SettingsModal.tsx`
  - `GenericValues`, `BackendErrors`, `FieldConfig`, `SectionConfig`, `EditAction`, `PlatformSchema`
- `frontend/src/features/platform/components/PlatformSelector.tsx`
  - `PlatformStatus`, `PlatformMetadata`, `PlatformItem`, `SettingsDialogState`
- `frontend/src/features/platform/components/Container.tsx`
  - `PlatformMeta`
- `frontend/src/features/platform/components/HashtagSelector.tsx`
  - `HashtagSelectorProps`
- `frontend/src/features/platform/components/blocks/FileSelectionBlock.tsx`
  - `FileRef`, `FileSelectionBlockProps`

Nur wenn backend-relevant/cross-layer, danach in `packages/types` heben:
- `TargetsConfig`, `AppliedTemplateEntry`, `TemplateDefinition` **nur dann**, wenn sie
  als API-Contract stabilisiert und backendseitig wiederverwendet werden

## Nächster Schritt (empfohlen)

1. `frontend/src/features/templates/types.ts` anlegen und alle oben gelisteten Template-UI-Typen zentralisieren.
2. `frontend/src/features/platform/types.ts` anlegen und alle oben gelisteten Platform-UI-Typen zentralisieren.
3. Imports in den Komponenten auf die neuen zentralen Type-Dateien umstellen.
4. Danach optional einzelne Typen nach `packages/types` heben, **nur** falls sie backend-relevant werden.