# Helper-System Analyse & Design

## Übersicht

Ein zentrales, platform-bezogenes Helper-System, das in verschiedenen UI-Elementen ein "?" Symbol anzeigt und kontextbezogene Hilfe-Informationen bereitstellt. Das System nutzt das bestehende Language-System und wird zentral im Backend verwaltet.

---

## 1. Anforderungen

### Funktionale Anforderungen

1. **"?" Symbol in UI-Elementen**
   - Anzeige eines Help-Icons (?) neben relevanten UI-Elementen
   - Hover/Tooltip oder Click/Dialog für Hilfe-Informationen
   - Platform-spezifische Helper-Infos
   - Kontextbezogene Hilfe (z.B. Upload-Bereich, Editor-Felder, Settings)

2. **Platform-bezogen**
   - Jede Platform kann eigene Helper-Infos definieren
   - Helper-Infos können platform-spezifische Besonderheiten erklären
   - Fallback zu globalen Helper-Infos wenn platform-spezifische fehlen

3. **Language-System Integration**
   - Nutzung des bestehenden i18n-Systems
   - Mehrsprachige Helper-Infos (de, en, es)
   - Platform-Translations werden automatisch geladen

4. **Backend zentrale Verwaltung**
   - Helper-Infos werden im Backend definiert
   - Platform-spezifische Helper-Dateien
   - Globale Helper-Dateien für gemeinsame Elemente
   - Dateiformate: JSON (für strukturierte Daten) oder Markdown/Text (für längere Inhalte)

5. **Frontend Integration**
   - Wiederverwendbare Helper-Komponente
   - Automatisches Laden von Helper-Infos
   - **Schema-driven Display-Modus** (vom Backend gesteuert, nicht im Frontend entschieden!)

---

## 2. Architektur-Design

### 2.1 Backend-Struktur

#### Platform-spezifische Helper-Dateien

```
backend/src/platforms/{platformId}/
├── helpers/
│   ├── index.json          # Helper-Metadaten & Mapping
│   ├── upload.md           # Upload-Hilfe (Markdown)
│   ├── editor.md           # Editor-Hilfe
│   ├── settings.md         # Settings-Hilfe
│   ├── panel.md            # Panel-Hilfe
│   └── locales/            # Übersetzungen für Helper-Content
│       ├── de.json
│       ├── en.json
│       └── es.json
```

#### Globale Helper-Dateien

```
backend/src/
├── helpers/
│   ├── index.json          # Globale Helper-Metadaten
│   ├── upload.md           # Globale Upload-Hilfe
│   ├── editor.md           # Globale Editor-Hilfe
│   └── locales/            # Globale Helper-Übersetzungen
│       ├── de.json
│       ├── en.json
│       └── es.json
```

#### Helper-Index Struktur (index.json)

**Wichtig**: Der `displayMode` wird **schema-driven** vom Backend definiert, nicht im Frontend entschieden!

```json
{
  "version": "1.0.0",
  "helpers": {
    "upload": {
      "type": "markdown",
      "file": "upload.md",
      "displayMode": "dialog",
      "title": {
        "de": "Datei-Upload Hilfe",
        "en": "File Upload Help",
        "es": "Ayuda de carga de archivos"
      },
      "short": {
        "de": "Informationen zum Hochladen von Dateien",
        "en": "Information about uploading files",
        "es": "Información sobre la carga de archivos"
      },
      "contexts": ["upload", "file-upload", "dropzone"]
    },
    "editor.subject": {
      "type": "text",
      "displayMode": "tooltip",
      "content": {
        "de": "Der Betreff wird in der E-Mail-Vorschau angezeigt.",
        "en": "The subject will be displayed in the email preview.",
        "es": "El asunto se mostrará en la vista previa del correo."
      },
      "contexts": ["editor", "field", "subject"]
    },
    "settings.smtp.host": {
      "type": "text",
      "displayMode": "tooltip",
      "content": {
        "de": "Der SMTP-Hostname Ihres E-Mail-Servers (z.B. smtp.gmail.com).",
        "en": "The SMTP hostname of your email server (e.g., smtp.gmail.com).",
        "es": "El nombre de host SMTP de su servidor de correo (ej., smtp.gmail.com)."
      },
      "contexts": ["settings", "smtp", "host"]
    },
    "upload.formats": {
      "type": "text",
      "displayMode": "tooltip",
      "content": {
        "de": "Unterstützte Formate: JPG, PNG, GIF, WebP (Bilder), PDF, TXT, MD (Dokumente)",
        "en": "Supported formats: JPG, PNG, GIF, WebP (images), PDF, TXT, MD (documents)",
        "es": "Formatos compatibles: JPG, PNG, GIF, WebP (imágenes), PDF, TXT, MD (documentos)"
      },
      "contexts": ["upload", "formats"]
    }
  }
}
```

**Display-Modi**:
- **`tooltip`**: Kurze Infos, werden beim Hover angezeigt (max ~200 Zeichen)
- **`dialog`**: Längere Infos, werden in einem Dialog/Modal angezeigt (Click auf "?" Icon)
- **`inline`** (optional): Direkt im UI sichtbar, für wichtige, immer sichtbare Hinweise

### 2.2 Helper-Typen & Display-Modi

**Wichtig**: `type` und `displayMode` sind **unabhängig** voneinander!

#### Helper-Typen (Content-Format)

1. **Text Helper**
   - Direkt in JSON definiert
   - Einfacher Text-Content
   - Schnell zu laden
   - Beispiel: Feld-Beschreibungen, kurze Hinweise

2. **Markdown Helper**
   - In separaten .md Dateien
   - Unterstützt Formatierung (Überschriften, Listen, Links)
   - Beispiel: Upload-Anleitung, komplexe Features

3. **Structured Helper**
   - JSON-basiert mit strukturierten Daten
   - Für Listen, Tabellen, Beispiele
   - Beispiel: Unterstützte Dateiformate, Limits

#### Display-Modi (UI-Anzeige) - **Schema-driven vom Backend**

1. **`tooltip`**
   - Wird beim Hover über "?" Icon angezeigt
   - Für kurze Infos (empfohlen < 200 Zeichen)
   - Nicht-intrusiv, schneller Zugriff
   - Beispiel: Feld-Beschreibungen, kurze Hinweise

2. **`dialog`**
   - Wird in einem Dialog/Modal angezeigt (Click auf "?" Icon)
   - Für längere Infos oder formatierte Inhalte
   - Unterstützt Markdown-Rendering
   - Beispiel: Upload-Anleitung, komplexe Features

3. **`inline`** (optional)
   - Direkt im UI sichtbar
   - Für wichtige, immer sichtbare Hinweise
   - Beispiel: Warnungen, wichtige Informationen

**Kombinationen**:
- `type: "text"` + `displayMode: "tooltip"` → Kurzer Text im Tooltip
- `type: "text"` + `displayMode: "dialog"` → Längerer Text im Dialog
- `type: "markdown"` + `displayMode: "dialog"` → Formatierter Markdown im Dialog
- `type: "structured"` + `displayMode: "dialog"` → Strukturierte Daten im Dialog

### 2.3 Helper-Kontexte

Helper können verschiedenen Kontexten zugeordnet werden:

- **`upload`**: Upload-Bereich, Dropzone
- **`editor`**: Content-Editor, Felder
- **`settings`**: Settings-Modal, Konfiguration
- **`panel`**: Platform-Panel, Features
- **`preview`**: Preview-Bereich
- **`field.{fieldName}`**: Spezifisches Feld (z.B. `field.subject`)
- **`block.{blockId}`**: Editor-Block (z.B. `block.image`)

---

## 3. Backend-Implementierung

### 3.1 Helper-Loader Service

```typescript
// backend/src/services/helperService.ts

interface HelperContent {
  id: string
  type: 'text' | 'markdown' | 'structured'
  displayMode: 'tooltip' | 'dialog' | 'inline'  // ← Schema-driven vom Backend!
  content: string | Record<string, any>
  title?: Record<string, string>
  short?: Record<string, string>  // Für tooltip-Modus (optional)
  contexts: string[]
}

interface HelperIndex {
  version: string
  helpers: Record<string, HelperContent>
}

export class HelperService {
  /**
   * Lädt Helper-Index für eine Platform
   */
  static async getPlatformHelpers(
    platformId: string,
    lang: string = 'en'
  ): Promise<Record<string, HelperContent>> {
    // 1. Lade Platform-spezifische Helper
    const platformHelpers = await this.loadPlatformHelpers(platformId, lang)
    
    // 2. Lade globale Helper als Fallback
    const globalHelpers = await this.loadGlobalHelpers(lang)
    
    // 3. Merge: Platform-spezifische überschreiben globale
    return { ...globalHelpers, ...platformHelpers }
  }

  /**
   * Lädt spezifischen Helper-Content
   */
  static async getHelperContent(
    helperId: string,
    platformId?: string,
    lang: string = 'en'
  ): Promise<HelperContent | null> {
    // 1. Versuche Platform-spezifischen Helper
    if (platformId) {
      const platformHelper = await this.loadHelper(platformId, helperId, lang)
      if (platformHelper) return platformHelper
    }
    
    // 2. Fallback zu globalem Helper
    return await this.loadHelper('global', helperId, lang)
  }

  /**
   * Lädt Helper-Index aus Datei
   */
  private static async loadHelperIndex(
    platformId: string
  ): Promise<HelperIndex | null> {
    const helperPath = platformId === 'global'
      ? join(__dirname, '../helpers/index.json')
      : join(__dirname, `../platforms/${platformId}/helpers/index.json`)
    
    try {
      const content = await readFile(helperPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  /**
   * Lädt Markdown-Content
   */
  private static async loadMarkdownContent(
    platformId: string,
    filename: string
  ): Promise<string | null> {
    const mdPath = platformId === 'global'
      ? join(__dirname, `../helpers/${filename}`)
      : join(__dirname, `../platforms/${platformId}/helpers/${filename}`)
    
    try {
      return await readFile(mdPath, 'utf-8')
    } catch {
      return null
    }
  }
}
```

### 3.2 Helper-Controller

```typescript
// backend/src/controllers/helperController.ts

export class HelperController {
  /**
   * GET /api/helpers/{helperId}?platform={platformId}&lang={lang}
   * Lädt spezifischen Helper-Content
   */
  static async getHelper(req: Request, res: Response) {
    const { helperId } = req.params
    const { platform, lang = 'en' } = req.query
    
    try {
      const helper = await HelperService.getHelperContent(
        helperId,
        platform as string,
        lang as string
      )
      
      if (!helper) {
        return res.status(404).json({
          success: false,
          error: 'Helper not found'
        })
      }
      
      return res.json({
        success: true,
        helper
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  /**
   * GET /api/helpers?platform={platformId}&lang={lang}
   * Lädt alle Helper für eine Platform
   */
  static async getHelpers(req: Request, res: Response) {
    const { platform, lang = 'en' } = req.query
    
    try {
      const helpers = await HelperService.getPlatformHelpers(
        platform as string || 'global',
        lang as string
      )
      
      return res.json({
        success: true,
        helpers
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
}
```

### 3.3 Helper-Route

```typescript
// backend/src/routes/helpers.ts

import { Router } from 'express'
import { HelperController } from '../controllers/helperController.js'

const router = Router()

router.get('/', HelperController.getHelpers)
router.get('/:helperId', HelperController.getHelper)

export default router
```

---

## 4. Frontend-Implementierung

### 4.1 Helper-Komponente

```jsx
// frontend/src/shared/components/ui/HelperIcon.jsx

import React, { useState } from 'react'
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'  // ✅ Material-UI Icon (bereits installiert)
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { getApiUrl } from '../../utils/api'
import ReactMarkdown from 'react-markdown'  // ⚠️ Muss installiert werden: npm install react-markdown

function HelperIcon({ helperId, platformId, context, size = 'small' }) {
  const { i18n } = useTranslation()
  const [helper, setHelper] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const loadHelper = async () => {
    if (helper) {
      setOpen(true)
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(
        getApiUrl(`helpers/${helperId}`),
        {
          params: {
            platform: platformId,
            lang: i18n.language.split('-')[0]
          }
        }
      )

      if (response.data.success) {
        setHelper(response.data.helper)
        setOpen(true)
      }
    } catch (error) {
      console.error('Failed to load helper:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  // Schema-driven: Display-Modus wird vom Backend bestimmt!
  const displayMode = helper?.displayMode || 'tooltip'  // Fallback
  const lang = i18n.language.split('-')[0]

  // Tooltip-Modus: Hover zeigt Info, Click öffnet optional Dialog
  if (displayMode === 'tooltip') {
    const tooltipText = helper?.short?.[lang] || helper?.content?.[lang] || helper?.content?.en || ''
    
    return (
      <>
        <Tooltip title={tooltipText}>
          <IconButton
            size={size}
            onClick={helper ? () => setOpen(true) : loadHelper}
            disabled={loading}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <HelpOutlineIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        
        {/* Optional: Dialog auch für tooltip-Modus (wenn title vorhanden) */}
        {open && helper && helper.title && (
          <Dialog open={open} onClose={handleClose} maxWidth="sm">
            <DialogTitle>
              {helper.title[lang] || helper.title.en || 'Help'}
              <IconButton
                onClick={handleClose}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                {typeof helper.content === 'string'
                  ? (helper.content[lang] || helper.content.en || helper.content)
                  : (helper.content?.[lang] || helper.content?.en || '')}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    )
  }

  // Dialog-Modus: Click öffnet Dialog mit vollständigem Content
  if (displayMode === 'dialog') {
    return (
      <>
        <Tooltip title={helper?.short?.[lang] || helper?.short?.en || 'Click for help'}>
          <IconButton
            size={size}
            onClick={loadHelper}
            disabled={loading}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <HelpOutlineIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>

        {open && helper && (
          <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
              {helper.title?.[lang] || helper.title?.en || 'Help'}
              <IconButton
                onClick={handleClose}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {helper.type === 'markdown' ? (
                <Box sx={{ '& p': { mb: 2 }, '& ul': { pl: 2 }, '& h2': { mt: 3, mb: 1 } }}>
                  <ReactMarkdown>
                    {typeof helper.content === 'string' 
                      ? helper.content 
                      : (helper.content?.[lang] || helper.content?.en || '')}
                  </ReactMarkdown>
                </Box>
              ) : helper.type === 'structured' ? (
                <Box>
                  {/* Strukturierte Daten rendern */}
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {JSON.stringify(helper.content, null, 2)}
                  </pre>
                </Box>
              ) : (
                <Typography variant="body1" component="div">
                  {typeof helper.content === 'string' 
                    ? helper.content 
                    : (helper.content?.[lang] || helper.content?.en || '')}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    )
  }

  // Inline-Modus: Direkt im UI sichtbar
  if (displayMode === 'inline') {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {typeof helper?.content === 'string'
            ? helper.content
            : (helper?.content?.[lang] || helper?.content?.en || '')}
        </Typography>
        <IconButton
          size={size}
          onClick={loadHelper}
          disabled={loading}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <HelpOutlineIcon fontSize="inherit" />
        </IconButton>
      </Box>
    )
  }

  // Fallback
  return null
}

export default HelperIcon
```

### 4.2 Schema-Integration

Helper können direkt in Platform-Schemas definiert werden:

```typescript
// backend/src/platforms/email/schema/editor.ts

export const emailEditorSchema = {
  blocks: [
    {
      id: 'subject',
      type: 'text',
      label: 'Subject',
      required: true,
      helper: 'editor.subject',  // ← Helper-ID
      // ...
    }
  ]
}
```

### 4.3 Frontend Schema-Renderer Integration

```jsx
// frontend/src/features/schema/components/Renderer.jsx

// In FieldRenderer:
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <TextField {...fieldProps} />
  {field.helper && (
    <HelperIcon 
      helperId={field.helper}
      platformId={platformId}
      context={`field.${field.name}`}
    />
  )}
</Box>
```

---

## 5. Beispiel: Upload-Bereich

### 5.1 Helper-Dateien

#### Globale Upload-Hilfe (upload.md)

```markdown
# Datei-Upload Hilfe

## Unterstützte Dateiformate

### Bilder
- **JPG/JPEG**: Empfohlen für Fotos
- **PNG**: Empfohlen für Grafiken mit Transparenz
- **GIF**: Unterstützt Animationen
- **WebP**: Moderne, komprimierte Formate

### Dokumente
- **PDF**: Für Flyer, Plakate, Dokumente
- **TXT**: Textdateien
- **MD**: Markdown-Dateien

## Dateigröße
- Maximale Dateigröße: **10 MB pro Datei**
- Empfohlene Bildgröße: 1200x1200px für Social Media

## Upload-Methoden
1. **Drag & Drop**: Ziehen Sie Dateien in den Upload-Bereich
2. **Klick**: Klicken Sie auf den Bereich, um Dateien auszuwählen
3. **Ordner**: Verwenden Sie "Select Folder" für mehrere Dateien

## Info-Dateien
Sie können optionale Info-Dateien hochladen:
- `info.md` oder `info.txt`: Zusätzliche Informationen zum Event
- Diese werden beim Parsen berücksichtigt
```

#### Platform-spezifische Upload-Hilfe (z.B. Instagram)

```markdown
# Instagram Upload-Hilfe

## Bildanforderungen
- **Format**: JPG oder PNG
- **Seitenverhältnis**: 1:1 (Quadrat) empfohlen
- **Mindestgröße**: 600x600px
- **Maximale Größe**: 1080x1080px (wird automatisch skaliert)

## Besonderheiten
- Instagram unterstützt keine GIF-Animationen in Posts
- PDF-Dateien werden nicht direkt unterstützt (nur als Bild)
- WebP wird zu JPG konvertiert
```

### 5.2 Helper-Index (index.json)

**Wichtig**: Jeder Helper definiert seinen `displayMode` im Schema!

```json
{
  "version": "1.0.0",
  "helpers": {
    "upload": {
      "type": "markdown",
      "displayMode": "dialog",
      "file": "upload.md",
      "title": {
        "de": "Datei-Upload Hilfe",
        "en": "File Upload Help",
        "es": "Ayuda de carga de archivos"
      },
      "short": {
        "de": "Informationen zu unterstützten Dateiformaten und Upload-Methoden",
        "en": "Information about supported file formats and upload methods",
        "es": "Información sobre formatos de archivo compatibles y métodos de carga"
      },
      "contexts": ["upload", "file-upload", "dropzone"]
    },
    "upload.formats": {
      "type": "text",
      "displayMode": "tooltip",
      "content": {
        "de": "Unterstützte Formate: JPG, PNG, GIF, WebP (Bilder), PDF, TXT, MD (Dokumente)",
        "en": "Supported formats: JPG, PNG, GIF, WebP (images), PDF, TXT, MD (documents)",
        "es": "Formatos compatibles: JPG, PNG, GIF, WebP (imágenes), PDF, TXT, MD (documentos)"
      },
      "contexts": ["upload", "formats"]
    },
    "upload.info-files": {
      "type": "text",
      "displayMode": "tooltip",
      "content": {
        "de": "Sie können optionale info.md oder info.txt Dateien hochladen, die beim Parsen berücksichtigt werden.",
        "en": "You can upload optional info.md or info.txt files that will be considered during parsing.",
        "es": "Puede cargar archivos opcionales info.md o info.txt que se considerarán durante el análisis."
      },
      "contexts": ["upload", "info-files"]
    }
  }
}
```

### 5.3 Frontend-Integration im Upload-Bereich

```jsx
// frontend/src/flows/upload/FileUpload.jsx

import HelperIcon from '../../../shared/components/ui/HelperIcon'

function FileUpload() {
  return (
    <Paper>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">
          {t('fileUpload.title')}
        </Typography>
        <HelperIcon 
          helperId="upload"
          context="upload"
          size="small"
        />
      </Box>
      
      {/* Dropzone */}
      <Box {...getRootProps()}>
        {/* ... */}
        <Typography variant="caption">
          Supported: JPG, PNG, GIF, WebP images, PDF documents, TXT, MD text files
          <HelperIcon 
            helperId="upload.formats"
            context="upload.formats"
            size="small"
          />
        </Typography>
      </Box>
      
      {/* Info-Files Hinweis */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            Optional: Upload info.md or info.txt files for additional event information
          </Typography>
          <HelperIcon 
            helperId="upload.info-files"
            context="upload.info-files"
            size="small"
          />
        </Box>
      </Alert>
    </Paper>
  )
}
```

---

## 6. Dateiformate für Helper-Content

### 6.1 info.md / info.txt für Upload

**Zweck**: Optionale Dateien, die beim Upload mitgeliefert werden können, um zusätzliche Event-Informationen zu liefern.

**Struktur**:

```
# Event Information

## Basic Info
- Title: Depeche Mode Party
- Date: 2026-01-15
- Venue: Berghain
- City: Berlin

## Additional Details
- Doors: 22:00
- Lineup: DJ Set, Live Performance
- Genre: Electronic, Synth Pop
```

**Parsing**: Diese Dateien können vom Parser-Service gelesen werden, um zusätzliche Event-Daten zu extrahieren.

**Speicherort**: `events/{eventId}/files/info.md` oder `events/{eventId}/files/info.txt`

### 6.2 Helper-Dateien vs. Info-Dateien

| Typ | Zweck | Speicherort | Format |
|-----|-------|-------------|--------|
| **Helper-Dateien** | Hilfe-Informationen für UI | `platforms/{id}/helpers/` | `.md`, `.json` |
| **Info-Dateien** | Event-Daten vom User | `events/{id}/files/` | `.md`, `.txt` |

---

## 7. Integration in bestehende Systeme

### 7.1 Platform-Schema-Erweiterung

```typescript
// backend/src/types/platformSchema.ts

interface FieldDefinition {
  // ... existing fields
  helper?: string  // Helper-ID (optional)
}

interface BlockDefinition {
  // ... existing fields
  helper?: string  // Helper-ID (optional)
}
```

### 7.2 Translation-System Integration

Helper-Infos können auch über das Translation-System geladen werden:

```typescript
// backend/src/platforms/email/locales/de.json

{
  "helpers": {
    "upload": {
      "title": "Datei-Upload Hilfe",
      "short": "Informationen zu unterstützten Dateiformaten",
      "content": "..."
    }
  }
}
```

**Vorteil**: Nutzt bestehende Translation-Infrastruktur
**Nachteil**: Größere Translation-Dateien

**Empfehlung**: Separate Helper-Dateien für bessere Organisation

---

## 8. Frontend-Design-Vorschläge

### 8.1 Helper-Icon Platzierung

1. **Neben Labels/Titeln**
   ```
   [Titel] [?]
   ```

2. **Neben Input-Feldern**
   ```
   [Label] [?]
   [Input-Feld]
   ```

3. **In Toolbars**
   ```
   [Button] [Button] [?]
   ```

4. **In Alerts/Info-Boxen**
   ```
   [Info-Text] [?]
   ```

### 8.2 Helper-Display-Modi

**Wichtig**: Display-Modus wird **schema-driven vom Backend** definiert, nicht im Frontend entschieden!

1. **Tooltip** (`displayMode: "tooltip"`)
   - Hover über "?" Icon zeigt Info
   - Empfohlen für kurze Infos (< 200 Zeichen)
   - Schnell, nicht-intrusiv
   - Optional: Click öffnet Dialog (wenn `title` vorhanden)

2. **Dialog/Modal** (`displayMode: "dialog"`)
   - Click auf "?" Icon öffnet Dialog
   - Für längere Infos oder formatierte Inhalte
   - Unterstützt Markdown-Formatierung
   - Scrollbar für sehr lange Inhalte

3. **Inline** (`displayMode: "inline"`) - optional
   - Direkt im UI sichtbar
   - Für wichtige, immer sichtbare Hinweise
   - Helper-Icon bleibt klickbar für zusätzliche Infos

### 8.3 Material-UI Integration

- **IconButton** mit `HelpOutlineIcon`
- **Tooltip** für kurze Infos
- **Dialog** für längere Infos
- **Typography** für Markdown-Rendering
- **ReactMarkdown** für Markdown-Support

---

## 9. Implementierungs-Plan

### Phase 1: Backend-Infrastruktur
1. ✅ Helper-Service erstellen
2. ✅ Helper-Controller erstellen
3. ✅ Helper-Route erstellen
4. ✅ Helper-Loader für Platform-spezifische Helper
5. ✅ Helper-Loader für globale Helper

### Phase 2: Beispiel-Implementierung
1. ✅ Globale Upload-Hilfe erstellen
2. ✅ Platform-spezifische Upload-Hilfe (z.B. Instagram)
3. ✅ Helper-Index-Dateien erstellen

### Phase 3: Frontend-Komponente
1. ✅ HelperIcon-Komponente erstellen
2. ✅ Tooltip-Integration
3. ✅ Dialog-Integration
4. ✅ Markdown-Rendering

### Phase 4: Integration
1. ✅ Upload-Bereich Integration
2. ✅ Editor-Integration (Schema-basiert)
3. ✅ Settings-Integration
4. ✅ Panel-Integration

### Phase 5: Erweiterung
1. ✅ Weitere Helper für andere Bereiche
2. ✅ Platform-spezifische Helper für alle Platforms
3. ✅ Dokumentation

---

## 10. Vorteile des Designs

### ✅ Platform-bezogen
- Jede Platform kann eigene Helper-Infos definieren
- Platform-spezifische Besonderheiten können erklärt werden

### ✅ Language-System Integration
- Nutzt bestehendes i18n-System
- Automatisches Laden von Platform-Translations
- Mehrsprachige Helper-Infos

### ✅ Backend zentrale Verwaltung
- Alle Helper-Infos im Backend
- Keine hardcodierten Helper-Infos im Frontend
- Einfach zu erweitern und zu pflegen

### ✅ Schema-driven Display-Modus
- **Display-Modus wird vom Backend definiert**, nicht im Frontend entschieden
- `displayMode: "tooltip"` oder `displayMode: "dialog"` im Helper-Schema
- Frontend respektiert den vom Backend definierten Modus
- Konsistent mit der schema-driven Architektur der Anwendung

### ✅ Flexibel
- Unterstützt kurze (Text) und lange (Markdown) Inhalte
- Verschiedene Display-Modi (Tooltip, Dialog, Inline)
- Kontext-basierte Helper-Zuordnung

### ✅ Wiederverwendbar
- HelperIcon-Komponente kann überall verwendet werden
- Schema-basierte Integration
- Automatisches Laden von Helper-Infos

---

## 11. Offene Fragen / Entscheidungen

1. **Helper-Content Format**
   - ✅ **Empfehlung**: Separate `.md` Dateien für längere Inhalte, JSON für kurze
   - Alternative: Alles in JSON (größere Dateien)

2. **Helper-Caching**
   - Soll Helper-Content gecacht werden?
   - ✅ **Empfehlung**: Ja, im Backend (ähnlich wie Translations)

3. **Helper-Versionierung**
   - Soll Helper-Content versioniert werden?
   - ✅ **Empfehlung**: Version im Helper-Index für zukünftige Erweiterungen

4. **Helper-Suche**
   - Soll es eine Helper-Suche geben?
   - ⚠️ **Optional**: Für später, wenn viele Helper vorhanden sind

5. **Helper-Analytics**
   - Sollen Helper-Klicks getrackt werden?
   - ⚠️ **Optional**: Für später, um zu sehen welche Helper genutzt werden

---

## 12. Nächste Schritte

1. **Brainstorm abgeschlossen** ✅
2. **Detailliertes Design erstellt** ✅
3. **Implementierung starten**:
   - Backend: Helper-Service, Controller, Routes
   - Frontend: HelperIcon-Komponente
   - Beispiel: Upload-Bereich Integration
4. **Testing**: Helper-Infos für verschiedene Bereiche testen
5. **Dokumentation**: Helper-System für Entwickler dokumentieren

---

## Zusammenfassung

Das Helper-System bietet:
- ✅ **Schema-driven Display-Modus**: Backend definiert `displayMode` (tooltip/dialog/inline), Frontend respektiert dies
- ✅ Platform-bezogene Hilfe-Informationen
- ✅ Integration in bestehendes Language-System
- ✅ Zentrale Backend-Verwaltung
- ✅ Flexible Frontend-Integration
- ✅ Unterstützung für kurze (Tooltip) und lange (Dialog) Inhalte
- ✅ Markdown-Support für formatierte Inhalte
- ✅ Beispiel: Upload-Bereich mit info.md/info.txt Unterstützung

**Kernprinzip**: Der Display-Modus wird **vollständig schema-driven vom Backend** gesteuert, genau wie alle anderen UI-Konfigurationen in der Anwendung. Das Frontend entscheidet nicht selbst, ob ein Helper als Tooltip oder Dialog angezeigt wird - das wird im Helper-Schema (`index.json`) definiert.

Das System ist erweiterbar, wartbar und folgt den bestehenden Architektur-Prinzipien der Anwendung.
