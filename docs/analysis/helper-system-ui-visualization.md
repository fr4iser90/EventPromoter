# Helper-System: Frontend UI-Visualisierung

## Übersicht

Diese Dokumentation zeigt, wie das Helper-System im Frontend aussieht und wie Benutzer damit interagieren.

---

## 1. Helper-Icon Platzierung

### 1.1 Neben Labels/Titeln

```
┌─────────────────────────────────────┐
│ Dateien hochladen              [?]  │  ← "?" Icon neben Titel
└─────────────────────────────────────┘
```

**Beispiel: Upload-Bereich**
- Titel: "Dateien hochladen"
- "?" Icon rechts daneben
- Click öffnet Dialog (wenn `displayMode: "dialog"`)

---

### 1.2 Neben Input-Feldern

```
┌─────────────────────────────────────┐
│ SMTP Host                    [?]    │  ← Label mit "?" Icon
│ ┌─────────────────────────────────┐ │
│ │ smtp.gmail.com                 │ │  ← Input-Feld
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Beispiel: Settings-Modal**
- Label: "SMTP Host"
- "?" Icon rechts neben Label
- Hover zeigt Tooltip (wenn `displayMode: "tooltip"`)
- Click öffnet Dialog (wenn `displayMode: "dialog"`)

---

### 1.3 In Editor-Blocks

```
┌─────────────────────────────────────┐
│ Subject                        [?]  │  ← Block-Label mit "?" Icon
│ ┌─────────────────────────────────┐ │
│ │ Event Announcement              │ │  ← Text-Input
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Beispiel: Content-Editor**
- Block-Label: "Subject"
- "?" Icon rechts daneben
- Hover/Click zeigt Helper-Info

---

### 1.4 In Info-Boxen/Alerts

```
┌─────────────────────────────────────┐
│ ℹ️ Optional: Upload info.md or      │
│    info.txt files for additional    │
│    event information          [?]  │  ← "?" Icon am Ende
└─────────────────────────────────────┘
```

**Beispiel: Upload-Hinweis**
- Alert-Text mit Info
- "?" Icon am Ende
- Click öffnet weitere Details

---

## 2. Display-Modi: Tooltip vs Dialog

### 2.1 Tooltip-Modus (`displayMode: "tooltip"`)

#### Hover-Interaktion:

```
┌─────────────────────────────────────┐
│ SMTP Host                    [?]    │  ← "?" Icon
│ ┌─────────────────────────────────┐ │
│ │ smtp.gmail.com                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
         ↑
         │ Hover über "?" Icon
         │
         ▼
┌─────────────────────────────────────┐
│ Der SMTP-Hostname Ihres E-Mail-     │  ← Tooltip erscheint
│ Servers (z.B. smtp.gmail.com).     │
└─────────────────────────────────────┘
```

**Verhalten**:
- ✅ Hover über "?" Icon → Tooltip erscheint sofort
- ✅ Tooltip verschwindet beim Mouse-Out
- ✅ Optional: Click öffnet Dialog (wenn `title` vorhanden)

**Beispiel-Code**:
```jsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Typography variant="body2">SMTP Host</Typography>
  <Tooltip title="Der SMTP-Hostname Ihres E-Mail-Servers">
    <IconButton size="small">
      <HelpOutlineIcon />
    </IconButton>
  </Tooltip>
</Box>
```

---

### 2.2 Dialog-Modus (`displayMode: "dialog"`)

#### Click-Interaktion:

```
┌─────────────────────────────────────┐
│ Dateien hochladen              [?]  │  ← "?" Icon
└─────────────────────────────────────┘
         ↑
         │ Click auf "?" Icon
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ Datei-Upload Hilfe                            [×]   │  ← Dialog-Titel
├─────────────────────────────────────────────────────┤
│                                                      │
│ # Datei-Upload Hilfe                                │
│                                                      │
│ ## Unterstützte Dateiformate                        │
│                                                      │
│ ### Bilder                                          │
│ - **JPG/JPEG**: Empfohlen für Fotos                │
│ - **PNG**: Empfohlen für Grafiken mit Transparenz   │
│ - **GIF**: Unterstützt Animationen                  │
│ - **WebP**: Moderne, komprimierte Formate           │
│                                                      │
│ ### Dokumente                                       │
│ - **PDF**: Für Flyer, Plakate, Dokumente           │
│ - **TXT**: Textdateien                              │
│ - **MD**: Markdown-Dateien                          │
│                                                      │
│ ## Dateigröße                                       │
│ - Maximale Dateigröße: **10 MB pro Datei**         │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │                    Close                      │   │  ← Close-Button
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Verhalten**:
- ✅ Click auf "?" Icon → Dialog öffnet sich
- ✅ Dialog zeigt vollständigen Helper-Content (Markdown formatiert)
- ✅ Close-Button oder Click außerhalb schließt Dialog
- ✅ Tooltip auf "?" Icon zeigt kurze Vorschau

**Beispiel-Code**:
```jsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Typography variant="h6">Dateien hochladen</Typography>
  <Tooltip title="Informationen zu unterstützten Dateiformaten">
    <IconButton onClick={openDialog}>
      <HelpOutlineIcon />
    </IconButton>
  </Tooltip>
  
  <Dialog open={open} onClose={closeDialog}>
    <DialogTitle>Datei-Upload Hilfe</DialogTitle>
    <DialogContent>
      <ReactMarkdown>{helperContent}</ReactMarkdown>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeDialog}>Close</Button>
    </DialogActions>
  </Dialog>
</Box>
```

---

## 3. Konkrete UI-Beispiele

### 3.1 Upload-Bereich

```
┌─────────────────────────────────────────────────────┐
│ 📁 Dateien hochladen                            [?]  │  ← Dialog-Helper
├─────────────────────────────────────────────────────┤
│                                                      │
│     ┌─────────────────────────────────────┐         │
│     │                                     │         │
│     │    📤 Drag & Drop oder Click        │         │
│     │                                     │         │
│     │  Supported: JPG, PNG, GIF, WebP     │         │
│     │  images, PDF documents, TXT, MD     │         │
│     │  text files                    [?]  │  ← Tooltip-Helper
│     │                                     │         │
│     └─────────────────────────────────────┘         │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ℹ️ Optional: Upload info.md or info.txt     │   │
│  │    files for additional event information   │   │
│  │                                         [?]  │   │  ← Tooltip-Helper
│  └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Helper-IDs**:
- `upload` → Dialog (Haupt-Upload-Hilfe)
- `upload.formats` → Tooltip (Format-Info)
- `upload.info-files` → Tooltip (Info-Dateien-Hinweis)

---

### 3.2 Settings-Modal

```
┌─────────────────────────────────────────────────────┐
│ Email Settings                                  [×]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  SMTP Configuration                                 │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ SMTP Host                              [?]  │   │  ← Tooltip-Helper
│  │ ┌────────────────────────────────────────┐  │   │
│  │ │ smtp.gmail.com                        │  │   │
│  │ └────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ SMTP Port                              [?]  │   │  ← Tooltip-Helper
│  │ ┌────────────────────────────────────────┐  │   │
│  │ │ 587                                    │  │   │
│  │ └────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Username                                [?]  │   │  ← Tooltip-Helper
│  │ ┌────────────────────────────────────────┐  │   │
│  │ │ your-email@gmail.com                  │  │   │
│  │ └────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Password                                [?]  │   │  ← Tooltip-Helper
│  │ ┌────────────────────────────────────────┐  │   │
│  │ │ ••••••••••                             │  │   │
│  │ └────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ From Email                              [?]  │   │  ← Tooltip-Helper
│  │ ┌────────────────────────────────────────┐  │   │
│  │ │ sender@example.com                     │  │   │
│  │ └────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │   Cancel     │  │    Save     │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Helper-IDs**:
- `settings.smtp.host` → Tooltip
- `settings.smtp.port` → Tooltip
- `settings.smtp.username` → Tooltip
- `settings.smtp.password` → Tooltip
- `settings.smtp.from` → Tooltip

---

### 3.3 Content-Editor

```
┌─────────────────────────────────────────────────────┐
│ Email Content Editor                                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Subject                                  [?]  │   │  ← Tooltip-Helper
│  │ ┌────────────────────────────────────────┐  │   │
│  │ │ Event Announcement                    │  │   │
│  │ └────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Body                                      [?]  │   │  ← Dialog-Helper
│  │ ┌────────────────────────────────────────┐  │   │
│  │ │                                        │  │   │
│  │ │  Join us for an amazing event!         │  │   │
│  │ │                                        │  │   │
│  │ │  Date: 2026-01-15                      │  │   │
│  │ │  Venue: Berghain                       │  │   │
│  │ │                                        │  │   │
│  │ │                                        │  │   │
│  │ └────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Header Image                            [?]  │   │  ← Dialog-Helper
│  │ ┌────────────────────────────────────────┐  │   │
│  │ │ [Image Upload Area]                     │  │   │
│  │ │                                         │  │   │
│  │ │  Click to upload or drag & drop        │  │   │
│  │ └────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Helper-IDs**:
- `editor.subject` → Tooltip (kurze Info)
- `editor.body` → Dialog (längere Anleitung)
- `editor.image` → Dialog (Bildanforderungen)

---

### 3.4 Panel (Platform-Features)

```
┌─────────────────────────────────────────────────────┐
│ Email Features                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Recipients                                     [?] │  ← Dialog-Helper
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ Available Recipients                         │  │
│  │                                               │  │
│  │ ☑ user1@example.com                          │  │
│  │ ☑ user2@example.com                          │  │
│  │ ☐ user3@example.com                          │  │
│  │                                               │  │
│  │ [+ Add Recipient]                             │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  Groups                                         [?] │  ← Dialog-Helper
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ Email Groups                                  │  │
│  │                                               │  │
│  │ • Marketing (5 recipients)                    │  │
│  │ • Support (3 recipients)                   │  │
│  │                                               │  │
│  │ [+ Create Group]                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Helper-IDs**:
- `panel.recipients` → Dialog (Recipient-Verwaltung)
- `panel.groups` → Dialog (Gruppen-Verwaltung)

---

## 4. Interaktions-Flow

### 4.1 Tooltip-Flow

```
User hovers über "?" Icon
         ↓
Tooltip erscheint sofort
         ↓
User bewegt Maus weg
         ↓
Tooltip verschwindet
```

**Optional**: Wenn `title` vorhanden:
```
User clicks auf "?" Icon
         ↓
Dialog öffnet sich (zusätzlich zu Tooltip)
         ↓
User kann Dialog schließen
```

---

### 4.2 Dialog-Flow

```
User sieht "?" Icon
         ↓
User hovers → Tooltip zeigt kurze Vorschau
         ↓
User clicks auf "?" Icon
         ↓
Dialog öffnet sich mit vollständigem Content
         ↓
User liest Helper-Info
         ↓
User clicks "Close" oder außerhalb
         ↓
Dialog schließt sich
```

---

## 5. Visuelles Design

### 5.1 Helper-Icon

**Material-UI Icon**: `HelpOutlineIcon` oder `HelpIcon`
- ✅ **Bereits installiert**: `@mui/icons-material` ist in `package.json` vorhanden
- ✅ **Keine zusätzlichen Dependencies nötig**
- ✅ **Vorgefertigtes Icon** - kein Text, kein Custom-Icon nötig

**Icon-Optionen**:
- `HelpOutlineIcon` - Outline-Version (empfohlen, weniger aufdringlich)
- `HelpIcon` - Filled-Version (alternativ)

**Größe**: 
- `small` (16px) - für Felder
- `medium` (24px) - für Titel

**Farbe**:
- Normal: `text.secondary` (grau)
- Hover: `primary.main` (blau)
- Active: `primary.main` (blau)

**Beispiel**:
```
Normal:  [?]  (grau, outline)
Hover:   [?]  (blau, outline)
Click:   [?]  (blau, aktiv)
```

**Code-Beispiel**:
```jsx
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
// oder
import HelpIcon from '@mui/icons-material/Help'

<IconButton size="small">
  <HelpOutlineIcon fontSize="inherit" />
</IconButton>
```

**Visuell**:
- `HelpOutlineIcon` sieht aus wie: ⓘ (Kreis mit "i") oder ? (Fragezeichen)
- Material-UI verwendet standardmäßig ein Fragezeichen-Symbol in einem Kreis

---

### 5.2 Tooltip-Design

```
Hintergrund: Dark (schwarz/grau)
Text: White
Position: Über dem Icon
Max-Breite: ~300px
Padding: 8px 12px
Border-Radius: 4px
```

**Beispiel**:
```
┌─────────────────────────────┐
│ Der SMTP-Hostname Ihres     │
│ E-Mail-Servers (z.B.        │
│ smtp.gmail.com).            │
└─────────────────────────────┘
```

---

### 5.3 Dialog-Design

```
Breite: maxWidth="md" (~600px)
Vollbreite: fullWidth={true}
Hintergrund: White (Light Mode) / Dark (Dark Mode)
Padding: 24px
Scrollbar: Automatisch bei langem Content
```

**Beispiel**:
```
┌─────────────────────────────────────────────┐
│ Datei-Upload Hilfe                    [×]   │
├─────────────────────────────────────────────┤
│                                             │
│ # Datei-Upload Hilfe                        │
│                                             │
│ ## Unterstützte Dateiformate                │
│                                             │
│ ### Bilder                                  │
│ - **JPG/JPEG**: Empfohlen für Fotos        │
│ - **PNG**: Empfohlen für Grafiken          │
│                                             │
│ [Scrollbar wenn Content länger]             │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │              Close                    │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 6. Responsive Design

### 6.1 Desktop

```
┌─────────────────────────────────────┐
│ Label                          [?]  │  ← Icon rechts
└─────────────────────────────────────┘
```

---

### 6.2 Mobile

```
┌─────────────────────────────────────┐
│ Label                          [?]  │  ← Icon bleibt rechts
│ ┌─────────────────────────────────┐ │
│ │ Input Field                      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Dialog auf Mobile**:
- Dialog nimmt volle Breite
- Scrollbar für langen Content
- Close-Button gut erreichbar

---

## 7. Accessibility

### 7.1 Keyboard-Navigation

- ✅ Tab-Navigation zu "?" Icon
- ✅ Enter/Space öffnet Dialog
- ✅ Escape schließt Dialog
- ✅ Tab-Navigation innerhalb Dialog

### 7.2 Screen-Reader

- ✅ `aria-label` auf Icon-Button
- ✅ `aria-describedby` für Helper-Content
- ✅ Dialog hat `role="dialog"`
- ✅ Dialog-Titel wird vorgelesen

---

## 8. Zusammenfassung

### Icon-Platzierung
- ✅ Neben Labels/Titeln
- ✅ Neben Input-Feldern
- ✅ In Editor-Blocks
- ✅ In Info-Boxen/Alerts

### Display-Modi
- ✅ **Tooltip**: Hover zeigt Info (kurz)
- ✅ **Dialog**: Click öffnet Info (lang, formatiert)

### Interaktion
- ✅ Hover → Tooltip erscheint
- ✅ Click → Dialog öffnet (bei `displayMode: "dialog"`)
- ✅ Close → Dialog schließt

### Design
- ✅ Material-UI Icons
- ✅ Konsistentes Styling
- ✅ Responsive
- ✅ Accessibility-freundlich

---

## 9. Code-Beispiele

### 9.1 Einfaches Tooltip-Helper

```jsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Typography variant="body2">SMTP Host</Typography>
  <HelperIcon 
    helperId="settings.smtp.host"
    platformId="email"
    size="small"
  />
</Box>
```

**Ergebnis**:
```
SMTP Host [?]
```

---

### 9.2 Dialog-Helper

```jsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Typography variant="h6">Dateien hochladen</Typography>
  <HelperIcon 
    helperId="upload"
    platformId={null}  // Global
    size="small"
  />
</Box>
```

**Ergebnis**:
```
Dateien hochladen [?]
```

Click öffnet Dialog mit vollständigem Helper-Content.

---

### 9.3 In Schema-Renderer

```jsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <TextField {...fieldProps} />
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

**Ergebnis**:
```
┌─────────────────────┐
│ Input Field     [?] │
└─────────────────────┘
```

---

## 10. Live-Beispiele

### Beispiel 1: Upload-Bereich

**Vorher** (ohne Helper):
```
Dateien hochladen
[Dropzone]
```

**Nachher** (mit Helper):
```
Dateien hochladen [?]
[Dropzone]
```

Click auf "?" öffnet Dialog mit Upload-Anleitung.

---

### Beispiel 2: Settings-Feld

**Vorher** (ohne Helper):
```
SMTP Host
[Input Field]
```

**Nachher** (mit Helper):
```
SMTP Host [?]
[Input Field]
```

Hover über "?" zeigt Tooltip: "Der SMTP-Hostname Ihres E-Mail-Servers"

---

### Beispiel 3: Editor-Block

**Vorher** (ohne Helper):
```
Subject
[Text Input]
```

**Nachher** (mit Helper):
```
Subject [?]
[Text Input]
```

Hover über "?" zeigt Tooltip: "Der Betreff wird in der E-Mail-Vorschau angezeigt"

---

## Fazit

Das Helper-System fügt diskrete "?" Icons hinzu, die:
- ✅ **Nicht aufdringlich** sind (klein, grau)
- ✅ **Klar erkennbar** sind (Help-Icon)
- ✅ **Kontextbezogen** helfen (Tooltip oder Dialog)
- ✅ **Einfach zu bedienen** sind (Hover oder Click)
- ✅ **Konsistent** im Design sind (überall gleich)

Die Benutzer können jederzeit Hilfe erhalten, ohne die Hauptfunktionalität zu stören.
