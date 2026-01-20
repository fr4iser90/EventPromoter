# Image Upload Strategies - Brainstorming

## Problem

**Aktueller Zustand:**
- Bilder werden lokal auf Server gespeichert: `events/{eventId}/files/{filename}`
- URLs werden generiert: `/files/{eventId}/{filename}` (relative URLs, nur über Backend erreichbar)
- Publisher bekommen `files[]` Array mit:
  - `url`: `/files/{eventId}/{filename}` (relative URL)
  - `path`: Lokaler Filesystem-Pfad

**Problem:**
- Social Media APIs (Instagram, Facebook, etc.) benötigen **öffentlich zugängliche URLs**
- Aktuell sind URLs nur über Backend-Server erreichbar
- **User will Backend NICHT öffentlich exposen**

**Betroffene Publisher:**
- ✅ **Twitter**: Lädt Bild von URL herunter → Funktioniert nur wenn URL öffentlich
- ❌ **Instagram**: Verwendet `image_url: files[0].url` → **Benötigt öffentliche URL!**
- ❌ **Facebook**: Lädt Bild von URL herunter → Funktioniert nur wenn URL öffentlich
- ✅ **Reddit**: Kann als Link-Post funktionieren, aber auch besser mit direktem Upload
- ✅ **LinkedIn**: Kann direkt hochladen (Assets API unterstützt File Upload)

---

## Lösungsoptionen

### Option 1: Direkter File Upload (Buffer/Stream) ✅ **EMPFOHLEN**

**Konzept:**
- Publisher lesen Dateien direkt vom Filesystem (`file.path`)
- Uploaden direkt als Buffer/Stream zu Platform-API
- Keine öffentlichen URLs nötig
- Funktioniert für alle Platforms

**Vorteile:**
- ✅ Keine öffentlichen URLs nötig
- ✅ Sicherer (keine Exposition)
- ✅ Funktioniert für alle Platforms
- ✅ Schneller (kein Download nötig)
- ✅ Weniger Bandwidth

**Nachteile:**
- ⚠️ Publisher müssen angepasst werden
- ⚠️ Jede Platform-API muss File Upload unterstützen

**Implementierung:**
```typescript
// Statt:
const mediaResponse = await fetch(mediaUrl) // ❌ Benötigt öffentliche URL

// Besser:
const fileBuffer = fs.readFileSync(file.path) // ✅ Direkt vom Filesystem
const formData = new FormData()
formData.append('media', fileBuffer, file.name)
```

**Platform-Unterstützung:**
- ✅ **Email**: **Bereits implementiert!** Verwendet `file.path` für Attachments (Nodemailer)
- ✅ **Twitter**: Unterstützt Base64 (`media_data`) - bereits implementiert, aber kann auch File Upload
- ✅ **Instagram**: Unterstützt `image_url` ODER File Upload via FormData
- ✅ **Facebook**: Unterstützt File Upload via FormData (`source` field)
- ✅ **LinkedIn**: Unterstützt File Upload via Assets API
- ✅ **Reddit**: Unterstützt File Upload (komplex, aber möglich)

---

### Option 2: Öffentliche URLs ❌ **NICHT GEWÜNSCHT**

**Konzept:**
- Backend exponiert Dateien öffentlich über `/files/{eventId}/{filename}`
- Social Media APIs können auf URLs zugreifen
- CORS-Header müssen gesetzt werden

**Vorteile:**
- ✅ Einfach zu implementieren
- ✅ Keine Publisher-Änderungen nötig

**Nachteile:**
- ❌ **Security-Risiko** (Dateien öffentlich zugänglich)
- ❌ **User will das nicht**
- ❌ Backend muss öffentlich erreichbar sein
- ❌ Event-IDs könnten erraten werden
- ❌ Keine Access-Control

**Implementierung:**
```typescript
// Backend muss Dateien öffentlich servieren
router.get('/files/:eventId/:filename', FileController.getFile)
// Mit CORS-Header für externe Zugriffe
```

---

### Option 3: Cloud Storage (S3, etc.) ⚠️ **KOMPLEX**

**Konzept:**
- Bilder werden zu Cloud Storage (S3, Cloudinary, etc.) hochgeladen
- Öffentliche URLs werden generiert
- Publisher verwenden Cloud-URLs

**Vorteile:**
- ✅ Öffentliche URLs verfügbar
- ✅ Skalierbar
- ✅ CDN-Unterstützung
- ✅ Keine Backend-Exposition

**Nachteile:**
- ❌ Zusätzliche Infrastruktur nötig
- ❌ Kosten (Storage + Bandwidth)
- ❌ Komplexere Setup
- ❌ Abhängigkeit von externem Service

**Implementierung:**
```typescript
// Upload zu S3
const s3Url = await uploadToS3(file.path)
// Publisher verwenden s3Url
```

---

### Option 4: Base64 Encoding ⚠️ **INEFFIZIENT**

**Konzept:**
- Bilder werden als Base64 kodiert
- Base64-String wird direkt im API-Request mitgeschickt

**Vorteile:**
- ✅ Keine URLs nötig
- ✅ Funktioniert für alle APIs die Base64 unterstützen

**Nachteile:**
- ❌ Sehr ineffizient (33% größer als Original)
- ❌ Nicht für alle APIs geeignet
- ❌ Große Dateien werden sehr groß
- ❌ Twitter unterstützt es, aber andere Platforms nicht immer

**Implementierung:**
```typescript
const base64 = fs.readFileSync(file.path).toString('base64')
// Im Request Body
```

---

### Option 5: Hybrid (URL + Fallback) ⚠️ **KOMPLEX**

**Konzept:**
- Versuche zuerst direkten Upload (File Buffer)
- Fallback zu URL-basiertem Upload wenn nicht unterstützt
- Für Email: Embedded URLs (lokale URLs funktionieren)

**Vorteile:**
- ✅ Flexibel
- ✅ Funktioniert für alle Platforms

**Nachteile:**
- ❌ Komplexe Logik
- ❌ Immer noch Problem mit öffentlichen URLs für Fallback

---

## Empfehlung: Option 1 (Direkter File Upload)

### Warum?

1. **Sicherheit**: Keine öffentliche Exposition
2. **Performance**: Schneller (kein Download nötig)
3. **Universalität**: Funktioniert für alle Platforms
4. **Einfachheit**: Klare Implementierung

### Implementierungsplan

#### Schritt 1: Publisher anpassen

**Twitter:**
```typescript
// Statt URL-Download:
private async uploadMedia(file: any, credentials: any): Promise<string> {
  // Option A: Base64 (aktuell)
  const fileBuffer = fs.readFileSync(file.path)
  const base64Media = fileBuffer.toString('base64')
  
  // Option B: Multipart FormData (besser für große Dateien)
  const formData = new FormData()
  formData.append('media', fileBuffer, file.name)
  
  // Upload zu Twitter
}
```

**Instagram:**
```typescript
// Statt image_url:
// Option A: File Upload via FormData
const formData = new FormData()
const fileBuffer = fs.readFileSync(file.path)
formData.append('image', fileBuffer, file.name)
formData.append('caption', caption)

// Option B: Base64 (wenn API unterstützt)
const base64 = fs.readFileSync(file.path).toString('base64')
```

**Facebook:**
```typescript
// Bereits implementiert, aber mit URL-Download
// Ändern zu direktem File Upload:
const formData = new FormData()
const fileBuffer = fs.readFileSync(file.path)
formData.append('source', fileBuffer, file.name)
formData.append('message', message)
```

#### Schritt 2: File Interface erweitern

```typescript
interface UploadedFile {
  id: string
  name: string
  filename: string
  url: string        // Für Email/Preview (kann lokal bleiben)
  path: string       // ✅ WICHTIG: Für direkten Upload
  size: number
  type: string
  uploadedAt: string
  isImage: boolean
}
```

#### Schritt 3: Publisher-Logik

```typescript
async publish(content: any, files: any[], hashtags: string[]): Promise<PostResult> {
  // Prüfe ob file.path vorhanden
  if (files.length > 0 && files[0].path) {
    // Direkter Upload vom Filesystem
    const mediaId = await this.uploadMediaFromFile(files[0])
  } else if (files.length > 0 && files[0].url) {
    // Fallback: URL-Download (nur wenn path nicht verfügbar)
    const mediaId = await this.uploadMediaFromUrl(files[0].url)
  }
}
```

---

## Migration Strategy

### Phase 1: Publisher anpassen (Direkter Upload)
1. ✅ **Email**: **Bereits implementiert!** Verwendet `file.path` für Attachments
2. ✅ Twitter: Bereits Base64, kann bleiben oder zu FormData wechseln
3. ✅ Instagram: Zu FormData/Base64 wechseln
4. ✅ Facebook: Zu direktem File Upload wechseln
5. ✅ LinkedIn: Zu Assets API File Upload wechseln
6. ✅ Reddit: Zu direktem File Upload wechseln (wenn möglich)

### Phase 2: Email Editor erweitern (Attachments Block)
- ✅ Email verwendet bereits direkten Upload für Attachments
- 💡 **Vorschlag**: "Attachments" Block im Editor Schema hinzufügen
  - User kann Dateien (PDF, etc.) als Anhang auswählen
  - Separate von Header-Image (das wird im HTML eingebettet)
  - Attachments werden direkt vom Filesystem angehängt

### Phase 3: Dokumentation aktualisieren
- `platform-image-handling.md` aktualisieren
- Publisher-README aktualisieren

---

## Code-Referenzen

**Aktuelle Implementierung (URL-basiert):**
- `backend/src/platforms/twitter/publishers/api.ts` (Zeile 123-152)
- `backend/src/platforms/instagram/publishers/api.ts` (Zeile 76)
- `backend/src/platforms/facebook/publishers/api.ts` (Zeile 104-123)

**File Interface:**
- `backend/src/types/index.ts` (Zeile 212-223)
- `backend/src/controllers/fileController.ts` (Zeile 23-32)

**File Storage:**
- `backend/src/middleware/upload.ts`
- `backend/src/services/uploadService.ts`

---

## Entscheidung

**Empfehlung: Option 1 (Direkter File Upload)**

**Begründung:**
- ✅ Keine öffentliche Exposition nötig
- ✅ Sicherer
- ✅ Funktioniert für alle Platforms
- ✅ Performance-Vorteile

**Nächste Schritte:**
1. Publisher analysieren und anpassen
2. File Upload für jede Platform implementieren
3. Fallback zu URL-Download entfernen (oder optional lassen)
4. Dokumentation aktualisieren
