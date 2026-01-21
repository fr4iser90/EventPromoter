# Email Editor & Preview: Identifizierte Probleme

## Übersicht

Analyse der Probleme im Email-Editor und Preview-Bereich basierend auf User-Feedback.

---

## Problem 1: Doppelte Labels im CompositeRenderer

### Symptom
- "Empfänger für diesen Versand" wird doppelt angezeigt
- "Auswahl-Modus" erscheint zusätzlich
- "Einzelne Empfänger" erscheint zusätzlich

### Ursache
**Datei**: `frontend/src/features/schema/components/CompositeRenderer.jsx`

Der CompositeRenderer zeigt sowohl:
1. `block.label` (Zeile 218-219) - "Empfänger für diesen Versand"
2. `field.label` für jedes Feld (Zeile 274-276) - "Auswahl-Modus", "Einzelne Empfänger", etc.

### Lösung
- Block-Label nur anzeigen, wenn es nicht bereits von Feldern gezeigt wird
- Oder: Block-Label entfernen, wenn Felder ihre eigenen Labels haben

**Code-Änderung**:
```jsx
// Zeile 216-226: Block-Label nur zeigen wenn nicht bereits von Feldern gezeigt
{block.label && !schema.mode && (
  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
    {block.label}
  </Typography>
)}

// Zeile 274-276: Field-Label nur zeigen wenn nicht gleich Block-Label
{field.label !== block.label && (
  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
    {field.label}
  </Typography>
)}
```

**Status**: ✅ Bereits implementiert (siehe CompositeRenderer.jsx)

---

## Problem 2: "0 Empfänger" in Preview-Tabs

### Symptom
- Preview-Tabs zeigen "0 Empfänger" obwohl Empfänger ausgewählt sind
- "Ausgewählt (4):" wird angezeigt, aber Preview zeigt "0 Empfänger"

### Ursache
**Datei**: `frontend/src/features/platform/components/Preview.jsx` (Zeile 189)

Das Frontend verwendet:
```jsx
{preview.recipients?.length || 0} Empfänger
```

Aber das Backend gibt `recipients` in `metadata.recipients` zurück:
**Datei**: `backend/src/platforms/email/services/emailService.ts` (Zeile 368)
```typescript
metadata: {
  recipients: preview.recipients
}
```

### Lösung
Frontend muss `metadata.recipients` verwenden:

**Code-Änderung**:
```jsx
// Zeile 189: Beide Pfade prüfen
{preview.metadata?.recipients?.length || preview.recipients?.length || 0} Empfänger
```

**Status**: ✅ Bereits implementiert (siehe Preview.jsx)

---

## Problem 3: Bilder werden nicht in Preview angezeigt

### Symptom
- Live Preview zeigt keine Bilder
- Modal zeigt Bilder korrekt an
- Preview zeigt "was anderes an"

### Ursache
**Datei**: `backend/src/platforms/email/services/previewService.ts` (Zeile 144-149)

Das Backend verwendet hardcodierte URL:
```typescript
const imageUrl = processedContent.headerImage.startsWith('http') 
  ? processedContent.headerImage 
  : processedContent.headerImage.startsWith('/')
    ? `http://localhost:4000${processedContent.headerImage}`  // ← Hardcodiert!
    : processedContent.headerImage
```

**Probleme**:
1. `http://localhost:4000` ist hardcodiert
2. Funktioniert nicht in Production
3. Funktioniert nicht wenn Backend auf anderem Port läuft
4. Relative URLs (`/files/...`) funktionieren nicht in iframe

### Lösung

**Option 1: Base64-Embedding** (empfohlen für Preview)
- Bilder als Base64 in HTML einbetten
- Funktioniert immer, auch offline
- Größere HTML-Dateien

**Option 2: Dynamische Base-URL**
- Base-URL aus Environment-Variable
- Oder aus Request-Header
- Funktioniert in Production

**Option 3: Data-URLs für Preview**
- Bilder als `data:image/jpeg;base64,...` einbetten
- Nur für Preview, nicht für tatsächliche E-Mails

**Empfehlung**: Option 1 (Base64) für Preview, da:
- Preview ist nur zur Anzeige
- Keine externen Requests nötig
- Funktioniert immer

**Code-Änderung** (previewService.ts):
```typescript
// Hero slot (headerImage)
if (processedContent.headerImage) {
  let imageUrl = processedContent.headerImage
  
  // If relative URL, convert to base64 for preview
  if (imageUrl.startsWith('/files/')) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const filePath = path.join(process.cwd(), imageUrl.replace('/files/', 'events/').replace('/', '/files/'))
      
      if (fs.existsSync(filePath)) {
        const imageBuffer = fs.readFileSync(filePath)
        const base64 = imageBuffer.toString('base64')
        const mimeType = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8 ? 'image/jpeg' :
                        imageBuffer[0] === 0x89 ? 'image/png' : 'image/jpeg'
        imageUrl = `data:${mimeType};base64,${base64}`
      }
    } catch (error) {
      console.warn('Failed to load image for preview:', error)
    }
  } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    // Try to use BASE_URL from environment
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
  }
  
  html += `      <img src="${imageUrl}" alt="Event Image" style="max-width: 100%; height: auto;" />
`
}
```

**Status**: ⏳ Muss implementiert werden

---

## Problem 4: Tabs zeigen falsche Empfänger-Anzahl

### Symptom
- Tabs zeigen "empfänger bla dann 0 Empfänger"
- Inkonsistente Anzeige

### Ursache
**Datei**: `frontend/src/features/platform/components/Preview.jsx` (Zeile 175-194)

Die Tab-Labels werden aus `multiPreviews` generiert, aber:
- `preview.group` kann undefined sein
- `preview.recipients` kann fehlen
- `preview.metadata?.recipients` wird nicht geprüft

### Lösung
**Code-Änderung**:
```jsx
// Zeile 175-194: Korrekte Empfänger-Anzahl anzeigen
{multiPreviews.map((preview, index) => {
  const recipientCount = preview.metadata?.recipients?.length || preview.recipients?.length || 0
  const groupName = preview.group || preview.target || 'Alle'
  
  return (
    <Tab
      key={index}
      label={
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {groupName}
          </Typography>
          {preview.templateId && (
            <Typography variant="caption" color="text.secondary">
              {preview.templateId}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" display="block">
            {recipientCount} Empfänger
          </Typography>
        </Box>
      }
    />
  )
})}
```

**Status**: ⏳ Muss implementiert werden

---

## Problem 5: Preview zeigt nicht dasselbe wie Modal

### Symptom
- Modal zeigt Bilder korrekt
- Preview zeigt "was anderes an"
- Bilder fehlen in Preview

### Ursache
1. **Bilder**: Preview verwendet hardcodierte URLs (siehe Problem 3)
2. **Content**: Preview verwendet möglicherweise nicht die gleichen Daten wie Modal
3. **Rendering**: Preview verwendet iframe, Modal verwendet direkte Bildanzeige

### Lösung
1. Bilder als Base64 in Preview einbetten (siehe Problem 3)
2. Sicherstellen, dass Preview die gleichen Content-Daten verwendet
3. Preview-Rendering mit Modal-Rendering synchronisieren

**Status**: ⏳ Muss implementiert werden

---

## Zusammenfassung der Probleme

| Problem | Status | Priorität |
|---------|--------|-----------|
| Doppelte Labels | ✅ Behoben | Hoch |
| "0 Empfänger" in Tabs | ✅ Behoben | Hoch |
| Bilder nicht angezeigt | ⏳ Offen | Hoch |
| Tabs zeigen falsche Anzahl | ⏳ Offen | Mittel |
| Preview ≠ Modal | ⏳ Offen | Mittel |

---

## Nächste Schritte

1. ✅ **Doppelte Labels** - Bereits behoben
2. ✅ **"0 Empfänger"** - Bereits behoben
3. ⏳ **Bilder in Preview** - Base64-Embedding implementieren
4. ⏳ **Tab-Empfänger-Anzahl** - Code anpassen
5. ⏳ **Preview = Modal** - Synchronisierung prüfen

---

## Code-Änderungen Zusammenfassung

### Bereits implementiert:
- ✅ CompositeRenderer: Block-Label nur wenn nicht von Feldern gezeigt
- ✅ Preview: `metadata.recipients` wird jetzt geprüft

### Noch zu implementieren:
- ⏳ previewService.ts: Base64-Embedding für Bilder
- ⏳ Preview.jsx: Korrekte Tab-Label-Generierung
- ⏳ Preview.jsx: Synchronisierung mit Modal-Rendering
