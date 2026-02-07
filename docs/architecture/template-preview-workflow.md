# Template Preview Workflow - Komplette Analyse

## Übersicht

Dieses Dokument beschreibt den **kompletten Workflow** des funktionierenden Template Previews aus `Selector.jsx` (Modal Preview).

## Beteiligte Files

### Frontend Files

1. **`frontend/src/features/templates/components/Selector.jsx`**
   - Hauptkomponente mit funktionierender Preview-Logik
   - Zeile 95-213: `loadPreview()` Funktion
   - Zeile 559-570: Preview Rendering mit `PreviewFrame`

2. **`frontend/src/shared/components/PreviewFrame.jsx`**
   - Generische Komponente zum sicheren Rendern von HTML aus Backend
   - Hostet HTML in iframe/srcdoc
   - Wendet Theme (Dark Mode) an

3. **`frontend/src/shared/utils/templateUtils.js`**
   - `getTemplateVariables(parsedData, uploadedFileRefs)` - Zeile 33-108
   - `replaceTemplateVariables(content, variables)` - Zeile 113-131

4. **`frontend/src/shared/utils/localeUtils.ts`**
   - `getUserLocale(i18n)` - User Language
   - `getValidLocale(locale)` - Locale Validation

5. **`frontend/src/shared/utils/targetUtils.ts`**
   - `resolveTargetsLocale()` - Locale aus Targets
   - `resolveGroupsLocale()` - Locale aus Groups

6. **`frontend/src/shared/utils/api.js`**
   - `getApiUrl(path)` - API URL Builder

### Backend Files

1. **`backend/src/controllers/platformController.ts`**
   - Zeile 628-694: `renderPreview()` Endpoint
   - Route: `POST /api/platforms/:platformId/preview?mode=desktop&locale=en`
   - Validiert Platform, Schema, Locale
   - Ruft `PreviewRenderer.render()` auf

2. **`backend/src/services/previewRenderer.ts`**
   - Generischer Preview Renderer
   - Ruft Platform-spezifischen Preview Service auf
   - Für Email: `EmailService.renderPreview()`

3. **`backend/src/platforms/email/services/previewService.ts`**
   - Zeile 59-370: `renderEmailPreview()` Funktion
   - Verarbeitet `content.bodyText` oder `content.text`
   - Rendert HTML mit CSS Variables für Theme

4. **`backend/src/platforms/email/services/emailService.ts`**
   - Email Service Klasse
   - `renderPreview()` Methode ruft `previewService.renderEmailPreview()` auf

5. **`backend/src/services/templateService.ts`**
   - `getTemplate()` - Lädt Template aus DB/File
   - Wird verwendet wenn `content._templateId` vorhanden

6. **`backend/src/platforms/email/templates/index.ts`**
   - `renderTemplate()` - Rendert Template mit Variablen
   - Unterstützt Translations

## Kompletter Workflow (Step-by-Step)

### Phase 1: Frontend - Template Auswahl & Vorbereitung

**File:** `Selector.jsx`

1. **User wählt Template** (Zeile 215-220)
   ```javascript
   const handleTemplateSelect = async (template) => {
     setSelectedTemplate(template)
     handleClose()
     await loadPreview(template)  // ← Startet Preview-Load
     setPreviewOpen(true)
   }
   ```

2. **Locale Resolution** (Zeile 95-159)
   ```javascript
   const loadPreview = useCallback(async (template) => {
     // Priority 1: templateLocale (from dropdown)
     // Priority 2: Target Locale (from targets/groups)
     // Priority 3: User Language
     let previewLocale = getUserLocale(i18n)
     
     if (targetsValue?.templateLocale) {
       previewLocale = getValidLocale(targetsValue.templateLocale)
     } else if (targetsValue) {
       // Try to resolve from targets/groups
       const targetLocale = await resolveTargetsLocale(...)
       if (targetLocale) previewLocale = targetLocale
     }
   })
   ```

3. **Template Content Selection** (Zeile 161-165)
   ```javascript
   // Select correct template content based on resolved locale
   let templateContent = template.template || {}
   if (previewLocale !== 'en' && template.translations?.[previewLocale]) {
     templateContent = template.translations[previewLocale]  // ← Übersetzung
   }
   ```

4. **Variable Extraction** (Zeile 167-172)
   ```javascript
   // Generate preview content using parsedData and uploadedFileRefs
   const templateVariables = getTemplateVariables(parsedData, uploadedFileRefs)
   
   const previewText = templateContent.html || templateContent.text || ''
   const filledContent = replaceTemplateVariables(previewText, templateVariables)
   ```
   
   **Was passiert:**
   - `getTemplateVariables()` extrahiert Variablen aus Event-Daten
   - `replaceTemplateVariables()` ersetzt `{variable}` Platzhalter

5. **Content Object Creation** (Zeile 178-181)
   ```javascript
   const previewContentObj = templateContent.html 
     ? { bodyText: filledContent }  // ← Email: bodyText
     : { text: filledContent }       // ← Andere: text
   ```

### Phase 2: Frontend - API Call

**File:** `Selector.jsx` Zeile 184-190

```javascript
const previewUrl = getApiUrl(`platforms/${platform}/preview?mode=desktop&locale=${previewLocale}`)

const response = await fetch(previewUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: previewContentObj })
})
```

**Request:**
```
POST /api/platforms/email/preview?mode=desktop&locale=en
Content-Type: application/json

{
  "content": {
    "bodyText": "<h1>Summer Music Festival 2025</h1><p>An amazing outdoor music experience...</p>"
  }
}
```

### Phase 3: Backend - Controller

**File:** `platformController.ts` Zeile 628-694

1. **Request Validation** (Zeile 630-640)
   ```typescript
   const { platformId } = req.params
   const { mode, client, locale } = req.query
   const { content } = req.body
   
   if (!platformId || !content) {
     return res.status(400).json({ error: '...' })
   }
   ```

2. **Platform Schema Loading** (Zeile 642-658)
   ```typescript
   const registry = await PlatformController.ensureRegistry()
   const platformModule = registry.getPlatform(platformId.toLowerCase())
   const schema = platformModule.schema
   
   if (!schema?.preview) {
     return res.status(404).json({ error: 'Preview schema not available' })
   }
   ```

3. **Locale Validation** (Zeile 660-669)
   ```typescript
   const validLocales = ['en', 'de', 'es']
   const normalizedLocale = locale?.split('-')[0].toLowerCase()
   const validLocale = validLocales.includes(normalizedLocale) 
     ? normalizedLocale 
     : undefined
   ```

4. **Preview Rendering** (Zeile 672-679)
   ```typescript
   const result = await PreviewRenderer.render({
     platform: platformId,
     mode: mode as string,
     client: client as string,
     content,              // ← { bodyText: "..." }
     schema: schema.preview,
     locale: validLocale
   })
   ```

5. **Response** (Zeile 681-686)
   ```typescript
   res.json({
     success: true,
     html: result.html,        // ← Gerendertes HTML
     css: result.css,          // ← CSS mit CSS Variables
     dimensions: result.dimensions
   })
   ```

### Phase 4: Backend - Preview Renderer

**File:** `previewRenderer.ts`

1. **Platform Service Lookup**
   ```typescript
   const service = platformModule.service  // EmailService
   ```

2. **Service.renderPreview() Call**
   ```typescript
   const result = await service.renderPreview(content, {
     schema: schema.preview,
     mode,
     client,
     locale
   })
   ```

### Phase 5: Backend - Email Preview Service

**File:** `previewService.ts` Zeile 59-370

1. **Content Processing** (Zeile 71-72)
   ```typescript
   let processedContent = { ...content }  // { bodyText: "..." }
   ```

2. **Template Re-rendering (wenn _templateId vorhanden)** (Zeile 75-141)
   ```typescript
   if (locale && processedContent._templateId) {
     // Load template
     const template = await TemplateService.getTemplate('email', processedContent._templateId)
     
     // Extract variables from content._var_* fields
     const variables = {}
     for (const [key, value] of Object.entries(processedContent)) {
       if (key.startsWith('_var_')) {
         const varName = key.replace('_var_', '')
         variables[varName] = value
       }
     }
     
     // Render template with locale
     const rendered = renderTemplate(emailTemplate, variables, locale)
     
     // Extract content HTML
     const contentHtml = extractContentFromTemplateHtml(rendered.html)
     
     // Update processedContent
     processedContent = {
       ...processedContent,
       subject: rendered.subject,
       bodyText: contentHtml  // ← Bereits bereinigt
     }
   }
   ```

3. **HTML Generation** (Zeile 153-288)
   ```typescript
   let contentHtml = `<div class="email-container">`
   
   // Header (subject)
   if (processedContent.subject) {
     contentHtml += `<div class="email-header">
       <div class="email-subject">${escapeHtml(processedContent.subject)}</div>
     </div>`
   }
   
   // Body
   contentHtml += `<div class="email-body">`
   
   // Body Content (Zeile 239-264)
   if (processedContent.bodyText) {
     const bodyText = processedContent.bodyText
     
     if (bodyText.includes('<') && bodyText.includes('>')) {
       // HTML - extract content
       const cleanedBodyText = extractContentFromTemplateHtml(bodyText)
       contentHtml += cleanedBodyText
     } else if (isMarkdown(bodyText)) {
       // Markdown - convert to HTML
       const markdownHtml = markdownToHtml(bodyText)
       contentHtml += markdownHtml
     } else {
       // Plain text - convert to HTML
       const bodyHtml = escapeHtml(bodyText)
         .replace(/\n\n/g, '</p><p>')
         .replace(/\n/g, '<br>')
       contentHtml += `<p>${bodyHtml}</p>`
     }
   }
   
   contentHtml += `</div></div>`
   ```

4. **CSS Generation** (Zeile 291-360)
   ```typescript
   const structuralCss = `
     * { margin: 0; padding: 0; box-sizing: border-box; }
     .email-container {
       max-width: ${width}px;
       background: var(--preview-container-bg);  // ← CSS Variable
     }
     .email-subject {
       color: var(--preview-text);  // ← CSS Variable
     }
     // ... mehr CSS
   `
   ```

5. **Return** (Zeile 362-369)
   ```typescript
   return {
     html: contentHtml,      // ← Nur Content-HTML, kein vollständiges Dokument
     css: structuralCss,     // ← CSS mit CSS Variables
     dimensions: { width, height }
   }
   ```

### Phase 6: Frontend - Response Handling

**File:** `Selector.jsx` Zeile 196-204

```javascript
const data = await response.json()
if (!data.success || !data.html) {
  throw new Error(data.error || 'Failed to render preview')
}

// ✅ Backend liefert Content-HTML + CSS
// PreviewFrame hostet es und themed es
setPreviewContent(data.html)
setPreviewCss(data.css || null)
```

### Phase 7: Frontend - Rendering

**File:** `Selector.jsx` Zeile 559-570

```javascript
{previewContent ? (
  <PreviewFrame
    document={{
      html: previewContent,  // ← Von Backend
      css: previewCss,        // ← Von Backend
      meta: {
        title: t('template.preview')
      }
    }}
    dimensions={{ width: 600, height: 800 }}
  />
) : null}
```

**File:** `PreviewFrame.jsx`

1. **HTML Hosting**
   - Rendert HTML in `srcdoc` iframe
   - Injiziert CSS in `<style>` Tag
   - Wendet CSS Variables basierend auf Theme an

2. **Theme Support**
   - CSS Variables werden vom Frontend Theme gesetzt
   - `--preview-container-bg` = Theme Background
   - `--preview-text` = Theme Text Color

## Datenpakete

### Request (Frontend → Backend)

```json
{
  "content": {
    "bodyText": "<h1>{title}</h1><p>{description}</p>"
  }
}
```

**Für Email:**
- `bodyText`: HTML Content (mit Variablen ersetzt)

**Für andere Plattformen:**
- `text`: Markdown/Text Content (mit Variablen ersetzt)

### Response (Backend → Frontend)

```json
{
  "success": true,
  "html": "<div class=\"email-container\">...</div>",
  "css": "* { margin: 0; ... } .email-container { background: var(--preview-container-bg); }",
  "dimensions": {
    "width": 600,
    "height": 800
  }
}
```

## Wichtige Unterschiede

### Email vs. Andere Plattformen

| Aspekt | Email | Andere (Reddit, Twitter, etc.) |
|--------|-------|-------------------------------|
| Template Feld | `template.template.html` | `template.template.text` |
| Request Feld | `content.bodyText` | `content.text` |
| Backend Processing | HTML Fragment | Markdown → HTML oder Plain Text → HTML |

### Template-Seite vs. Modal Preview

| Aspekt | Template-Seite (Preview.jsx) | Modal (Selector.jsx) |
|--------|------------------------------|----------------------|
| Datenquelle | `SAMPLE_DATA` (statisch) | `getTemplateVariables(parsedData, uploadedFileRefs)` (echte Event-Daten) |
| Locale Resolution | Nur User Language | Template Locale → Target Locale → User Language |
| Context | Kein Event geladen | Event geladen, Targets konfiguriert |

## Warum funktioniert Selector.jsx?

1. ✅ **Echte Event-Daten:** `getTemplateVariables()` liefert echte Variablen
2. ✅ **Locale Resolution:** Komplexe Locale-Resolution aus Targets/Groups
3. ✅ **Template Translations:** Nutzt `template.translations[locale]` wenn vorhanden
4. ✅ **Error Handling:** Setzt HTML direkt bei Fehler
5. ✅ **Theme Support:** `useCallback` mit `theme.palette.mode` Dependency

## Warum funktioniert Preview.jsx NICHT?

1. ❌ **Sample-Daten:** `SAMPLE_DATA` ist statisch, aber sollte funktionieren
2. ❌ **Template Content:** `templateContent.html` ist wahrscheinlich leer
3. ❌ **Fehlende Debug-Info:** Keine Logs um zu sehen was leer ist

## Lösung für Preview.jsx

Die Preview.jsx sollte **EXAKT** die gleiche Logik wie Selector.jsx verwenden, aber:
- Statt `getTemplateVariables(parsedData, uploadedFileRefs)` → `SAMPLE_DATA`
- Statt komplexe Locale-Resolution → Nur `getUserLocale(i18n)`

**Das Problem:** `templateContent.html` ist wahrscheinlich leer, weil:
- Template-Struktur anders als erwartet
- Oder Template hat kein `html` Feld

**Debug:** Füge Logging hinzu um zu sehen was `template.template` enthält.
