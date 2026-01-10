Analysiere die aktuelle Struktur und skizziere Optionen:


[5 tools called]


## Brainstorm: Bulk-Template-Apply auf alle Plattformen

### Aktuelle Situation
- Templates haben Kategorien: `announcement`, `reminder`, `event`, `discussion`, `music`, `review`, etc.
- Jede Platform hat eigene Templates mit Kategorien
- ContentEditor zeigt Plattformen als Tabs
- TemplateSelector ist pro Platform

### Option 1: Kategorie-Button über den Tabs (empfohlen)

```
┌─────────────────────────────────────────────────────────┐
│  📧 Email  🔴 Reddit  💼 LinkedIn  📘 Facebook  ...     │ ← Tabs
├─────────────────────────────────────────────────────────┤
│  🎯 Apply Template Category to All Platforms           │ ← Neuer Button
│  [Announcement ▼] [Apply to All]                       │
└─────────────────────────────────────────────────────────┘
```

Vorteile:
- Sichtbar und schnell erreichbar
- Kategorien als Dropdown
- "Apply to All" Button

UI-Komponenten:
- Button/Dropdown über den Tabs
- Kategorien-Dropdown (announcement, reminder, event, etc.)
- "Apply to All" Button
- Optional: Bestätigungs-Dialog

### Option 2: Modal/Dialog für Bulk-Apply

```
┌─────────────────────────────────────────────────────────┐
│  📧 Email  🔴 Reddit  💼 LinkedIn  ...                  │
├─────────────────────────────────────────────────────────┤
│  [🎯 Apply Template to All Platforms]                   │ ← Button öffnet Modal
└─────────────────────────────────────────────────────────┘

Modal:
┌─────────────────────────────────────────────────────────┐
│  Apply Template Category to All Platforms        [×]    │
├─────────────────────────────────────────────────────────┤
│  Select Category:                                       │
│  [Announcement ▼]                                       │
│                                                         │
│  Available Templates:                                  │
│  ☐ Email: Event Announcement                            │
│  ☐ Reddit: Event Announcement                           │
│  ☐ LinkedIn: Event Announcement                        │
│  ☐ Facebook: Event Announcement                        │
│  ☐ Instagram: Event Announcement                       │
│  ☐ Twitter: Event Announcement                          │
│                                                         │
│  [Cancel]  [Apply to Selected Platforms]                │
└─────────────────────────────────────────────────────────┘
```

Vorteile:
- Übersicht über alle Plattformen
- Möglichkeit, einzelne Plattformen abzuwählen
- Preview vor Apply

### Option 3: Smart Category Matcher

```
┌─────────────────────────────────────────────────────────┐
│  📧 Email  🔴 Reddit  💼 LinkedIn  ...                  │
├─────────────────────────────────────────────────────────┤
│  🎯 Quick Apply:                                        │
│  [Announcement] [Reminder] [Follow-up] [Custom...]     │ ← Chip-Buttons
└─────────────────────────────────────────────────────────┘
```

Vorteile:
- Sehr schnell
- Kategorien als Chips
- Ein Klick = Apply auf alle

### Option 4: TemplateSelector erweitern

Im GenericPlatformEditor:
```
┌─────────────────────────────────────────────────────────┐
│  📝 Email Editor                                        │
│  [📄 Templates ▼]  [🎯 Apply to All Platforms]          │ ← Zusätzlicher Button
└─────────────────────────────────────────────────────────┘
```

Vorteile:
- Nahe am TemplateSelector
- Kontextuell

### Empfehlung: Hybrid (Option 1 + Option 2)

Haupt-UI (Option 1):
- Button über den Tabs: "🎯 Apply Template Category"
- Dropdown: Kategorien
- "Apply to All" Button

Erweiterte UI (Option 2):
- Button öffnet Modal mit:
  - Kategorien-Auswahl
  - Liste aller Plattformen mit Checkboxen
  - Preview pro Platform
  - "Apply" Button

### Technische Umsetzung

Backend:
```typescript
// Neue API: GET /api/templates/categories
// Gibt alle verfügbaren Kategorien über alle Plattformen zurück

// Neue API: GET /api/templates/category/:category
// Gibt alle Templates einer Kategorie für alle Plattformen zurück
```

Frontend:
```javascript
// Neue Komponente: BulkTemplateApplier
// - Lädt Kategorien
// - Lädt Templates pro Kategorie
// - Apply-Logik für alle Plattformen
```

### UI/UX Flow

1. User klickt "🎯 Apply Template Category"
2. Dropdown zeigt Kategorien: `announcement`, `reminder`, `event`, etc.
3. User wählt Kategorie → Modal öffnet sich
4. Modal zeigt:
   - Liste aller ausgewählten Plattformen
   - Verfügbares Template pro Platform
   - Preview pro Platform
5. User bestätigt → Templates werden auf alle Plattformen angewendet
6. Optional: Success-Notification mit Liste der aktualisierten Plattformen

### Offene Fragen

1. Was passiert, wenn eine Platform kein Template für die Kategorie hat?
   - Überspringen?
   - Warnung?
   - Fallback-Template?

2. Sollen bestehende Inhalte überschrieben werden?
   - Ja/Nein-Option?
   - Merge-Option?

3. Soll es eine "Quick Apply" ohne Modal geben?
   - Direktes Apply ohne Bestätigung?

Soll ich eine dieser Optionen implementieren oder eine Kombination?