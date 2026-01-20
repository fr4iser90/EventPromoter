# Platform Image Handling Documentation

## Übersicht

Diese Dokumentation beschreibt, wie Bilder bei jeder Platform gehandhabt werden - ob sie im Template-Text eingebettet werden oder separat hochgeladen werden müssen.

## Allgemeine Prinzipien

### 1. Template-Embedded Images
- **Verwendung**: Bilder werden als HTML `<img>` Tags oder URL-Placeholder im Template-Text eingebettet
- **Variable**: `{img1}`, `{image1}`, `{image}` (für erstes Bild)
- **Ersetzung**: Variable wird durch tatsächliche Bild-URL ersetzt
- **Vorteil**: Einfach, funktioniert für alle Platforms die HTML/URLs unterstützen

### 2. Separate Media Upload
- **Verwendung**: Bilder werden separat über Platform-API hochgeladen
- **Prozess**: 
  1. Bild wird zu Platform hochgeladen
  2. Platform gibt Media-ID zurück
  3. Post wird mit Media-ID erstellt
- **Vorteil**: Native Platform-Unterstützung, bessere Performance

---

## Platform-spezifische Details

### 📧 Email

**Image-Handling**: **BEIDES** (Embedded + Attachments)

**Template-Format:**
```html
<img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />
```

**API-Prozess:**
1. **Template-Variable**: `{img1}` wird durch Bild-URL ersetzt (embedded im HTML)
2. **Attachments**: Bilder werden zusätzlich als Email-Attachments angehängt (für Offline-Viewing)
3. **Nodemailer**: Verwendet `attachments` Array für separate Dateien

**Code-Referenz:**
- `backend/src/platforms/email/publishers/api.ts` (Zeile 108-111, 119)
- Bilder werden sowohl im HTML eingebettet als auch als Attachments gesendet

**Template-Variablen:**
- `img1`, `image1`, `image` (für erstes Bild)
- `img2`, `image2` (für zweites Bild)
- etc.

---

### 🔴 Reddit

**Image-Handling**: **SEPARAT** (Link-Post oder Image-Post)

**Template-Format:**
- **KEINE** `<img>` Tags im Template-Text
- Template enthält nur Text (Markdown)
- Bilder werden separat hochgeladen

**API-Prozess:**
1. **Image Detection**: Publisher prüft ob `files[0]` ein Bild ist (`.jpg`, `.jpeg`, `.png`, `.gif`)
2. **Post Type**:
   - **Image Post**: `kind: 'link'` mit Bild-URL
   - **Text Post**: `kind: 'self'` ohne Bilder
3. **Reddit Image Upload**: Komplex, aktuell als Link-Post implementiert

**Code-Referenz:**
- `backend/src/platforms/reddit/publishers/api.ts` (Zeile 86-119)
- Bilder werden als Link-Posts gepostet (URL im `url` Feld)

**Template-Variablen:**
- **KEINE** Image-Variablen im Template-Text
- Bilder werden über `files[]` Array separat hochgeladen

---

### 🐦 Twitter / X

**Image-Handling**: **SEPARAT** (Media Upload API)

**Template-Format:**
- **KEINE** `<img>` Tags im Template-Text
- Template enthält nur Text (max. 280 Zeichen)
- Bilder werden separat hochgeladen

**API-Prozess:**
1. **Media Upload**: 
   - Bild wird zu `https://upload.twitter.com/1.1/media/upload.json` hochgeladen
   - Twitter gibt `media_id_string` zurück
2. **Tweet Creation**:
   - Tweet wird mit `media.media_ids: [mediaId]` erstellt
   - Text und Media werden kombiniert

**Code-Referenz:**
- `backend/src/platforms/twitter/publishers/api.ts` (Zeile 69-88, 123-152)
- `uploadMedia()` Methode lädt Bild separat hoch

**Template-Variablen:**
- **KEINE** Image-Variablen im Template-Text
- Bilder werden über `files[]` Array separat hochgeladen

---

### 📸 Instagram

**Image-Handling**: **SEPARAT** (Media Container API)

**Template-Format:**
- **KEINE** `<img>` Tags im Template-Text
- Template enthält nur Caption-Text
- Bilder werden separat hochgeladen (ERFORDERLICH)

**API-Prozess:**
1. **Media Container Creation**:
   - POST zu `/{instagramAccountId}/media`
   - `image_url`: Bild-URL
   - `caption`: Text mit Hashtags
   - Instagram gibt `creation_id` zurück
2. **Media Publishing**:
   - POST zu `/{instagramAccountId}/media_publish`
   - `creation_id`: Von Schritt 1
   - Instagram gibt finalen Post zurück

**Code-Referenz:**
- `backend/src/platforms/instagram/publishers/api.ts` (Zeile 51-56, 67-100)
- **WICHTIG**: Instagram **benötigt** mindestens ein Bild (Zeile 51-56)

**Template-Variablen:**
- **KEINE** Image-Variablen im Template-Text
- Bilder werden über `files[]` Array separat hochgeladen
- **Erforderlich**: Mindestens 1 Bild muss vorhanden sein

---

### 📘 Facebook

**Image-Handling**: **SEPARAT** (Graph API)

**Template-Format:**
- **KEINE** `<img>` Tags im Template-Text
- Template enthält nur Text
- Bilder werden separat hochgeladen

**API-Prozess:**
1. **Photo Upload**:
   - POST zu `/{pageId}/photos`
   - `url`: Bild-URL oder `source`: Bild-Daten
   - `message`: Post-Text
   - Facebook gibt Photo-ID zurück
2. **Alternative**: Link-Post mit Bild-Preview (automatisch von Facebook generiert)

**Code-Referenz:**
- `backend/src/platforms/facebook/publishers/api.ts`
- Bilder werden über Graph API separat hochgeladen

**Template-Variablen:**
- **KEINE** Image-Variablen im Template-Text
- Bilder werden über `files[]` Array separat hochgeladen

---

### 💼 LinkedIn

**Image-Handling**: **SEPARAT** (LinkedIn API)

**Template-Format:**
- **KEINE** `<img>` Tags im Template-Text
- Template enthält nur Text
- Bilder werden separat hochgeladen

**API-Prozess:**
1. **Image Upload**:
   - POST zu `/v2/assets?action=registerUpload`
   - LinkedIn gibt Upload-URL zurück
   - Bild wird zu Upload-URL hochgeladen
   - LinkedIn gibt Asset-URN zurück
2. **Post Creation**:
   - POST zu `/v2/ugcPosts`
   - `specificContent.media[].media`: Asset-URN
   - `specificContent.shareContent.shareCommentary.text`: Post-Text

**Code-Referenz:**
- `backend/src/platforms/linkedin/publishers/api.ts`
- Bilder werden über LinkedIn Assets API separat hochgeladen

**Template-Variablen:**
- **KEINE** Image-Variablen im Template-Text
- Bilder werden über `files[]` Array separat hochgeladen

---

## Zusammenfassungstabelle

| Platform | Image-Handling | Template-Format | API-Prozess | Template-Variablen |
|----------|---------------|-----------------|-------------|-------------------|
| **Email** | Embedded + Attachments | `<img src="{img1}">` | HTML-Embedding + Nodemailer Attachments | ✅ `img1`, `image1` |
| **Reddit** | Separate Upload | Nur Text (Markdown) | Link-Post mit Bild-URL | ❌ Keine |
| **Twitter** | Separate Upload | Nur Text (280 chars) | Media Upload API → Tweet mit Media-ID | ❌ Keine |
| **Instagram** | Separate Upload (Required) | Nur Caption-Text | Media Container API → Publish | ❌ Keine |
| **Facebook** | Separate Upload | Nur Text | Graph API Photo Upload | ❌ Keine |
| **LinkedIn** | Separate Upload | Nur Text | Assets API → UGC Post | ❌ Keine |

---

## Template-Implementierung

### Email Templates
✅ **Image-Placeholder hinzufügen:**
```html
<img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />
```

✅ **Variable zu `variables` Array hinzufügen:**
```typescript
variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link', 'img1']
```

### Social Media Templates
❌ **KEINE Image-Placeholder im Template-Text**
- Templates enthalten nur Text
- Bilder werden automatisch über `files[]` Array hochgeladen
- Publisher erkennt Bilder automatisch und lädt sie separat hoch

---

## API-Prozess Dokumentation

### Publisher Interface

Alle Publisher implementieren:
```typescript
interface PlatformPublisher {
  publish(
    content: any,      // Content-Objekt (Text, HTML, etc.)
    files: any[],      // Array von hochgeladenen Dateien (Bilder, etc.)
    hashtags: string[] // Hashtags für Social Media
  ): Promise<PostResult>
}
```

### Image-Handling im Publisher

#### Email
```typescript
// 1. Bilder im HTML einbetten (Template-Variable)
const html = content.html.replace(/{img1}/g, files[0]?.url || '')

// 2. Bilder als Attachments anhängen
const attachments = files.map(file => ({
  filename: file.name,
  path: file.url
}))
```

#### Social Media (Twitter, Instagram, etc.)
```typescript
// ✅ EMPFOHLEN: Direkter File Upload (vom Filesystem)
// Statt URL-Download verwenden wir direkten File Upload
const fileBuffer = fs.readFileSync(files[0].path) // Direkt vom Filesystem
const mediaId = await this.uploadMediaFromBuffer(fileBuffer, files[0], credentials)

// 2. Post mit Media-ID erstellen
const postPayload = {
  text: content.text,
  media: { media_ids: [mediaId] }
}
```

**⚠️ WICHTIG: URL-basierter Upload erfordert öffentliche URLs**
- Aktuell verwenden einige Publisher `files[0].url` und laden Bilder von URLs herunter
- **Problem**: URLs sind nur über Backend erreichbar, nicht öffentlich
- **Lösung**: Direkter File Upload vom Filesystem (`files[0].path`)
- Siehe `/docs/development/image-upload-strategies.md` für Details

---

## Best Practices

### ✅ DO

1. **Email Templates**: Immer `{img1}` Placeholder hinzufügen
2. **Social Media Templates**: Nur Text, keine Image-Placeholder
3. **Publisher**: Automatische Erkennung von Bildern in `files[]` Array
4. **Error Handling**: Graceful Fallback wenn Bild-Upload fehlschlägt

### ❌ DON'T

1. **Social Media Templates**: Keine `<img>` Tags oder Image-URLs im Template-Text
2. **Email ohne Images**: Template funktioniert auch ohne Bilder (Placeholder wird leer)
3. **Hardcoded URLs**: Immer Variablen verwenden, nie hardcoded Bild-URLs

---

## Migration Guide

### Alte Templates aktualisieren

**Email Templates:**
- ✅ Image-Placeholder hinzufügen: `<img src="{img1}" ... />`
- ✅ `'img1'` zu `variables` Array hinzufügen

**Social Media Templates:**
- ❌ Keine Änderungen nötig (Bilder werden automatisch separat hochgeladen)
- ✅ Template-Text bleibt unverändert

---

## Code-Referenzen

- **Email Publisher**: `backend/src/platforms/email/publishers/api.ts`
- **Reddit Publisher**: `backend/src/platforms/reddit/publishers/api.ts`
- **Twitter Publisher**: `backend/src/platforms/twitter/publishers/api.ts`
- **Instagram Publisher**: `backend/src/platforms/instagram/publishers/api.ts`
- **Facebook Publisher**: `backend/src/platforms/facebook/publishers/api.ts`
- **LinkedIn Publisher**: `backend/src/platforms/linkedin/publishers/api.ts`
- **Template Variables**: `backend/src/services/parsing/templateVariables.ts`

---

## ⚠️ Wichtiger Hinweis: Image Upload Strategy

**Problem:** Social Media APIs benötigen öffentlich zugängliche URLs, aber Backend soll nicht öffentlich exponiert werden.

**Lösung:** Direkter File Upload vom Filesystem statt URL-basiertem Upload.

**Detaillierte Analyse:** Siehe `/docs/development/image-upload-strategies.md`

**Status:**
- ✅ **Email**: Funktioniert (lokale URLs im HTML, Attachments vom Filesystem)
- ⚠️ **Twitter**: Verwendet Base64 (funktioniert), könnte zu FormData wechseln
- ❌ **Instagram**: Verwendet `image_url` → **Muss zu File Upload geändert werden**
- ❌ **Facebook**: Lädt von URL → **Muss zu direktem File Upload geändert werden**
- ⚠️ **LinkedIn**: Kann direkt hochladen, muss implementiert werden
- ⚠️ **Reddit**: Kann als Link-Post, direkter Upload wäre besser

---

## Changelog

- **2026-01-20**: Initiale Dokumentation erstellt
- **2026-01-20**: Image-Placeholder zu allen Email-Templates hinzugefügt
- **2026-01-20**: Problem mit öffentlichen URLs identifiziert, Brainstorming-Dokument erstellt