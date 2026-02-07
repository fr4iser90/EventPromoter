# 📧 Email Workflow - Vollständige Dokumentation

## 📋 Inhaltsverzeichnis
1. [Input-Struktur](#input-struktur)
2. [Workflow-Flow](#workflow-flow)
3. [Node-Dokumentation](#node-dokumentation)
4. [Daten-Transformationen](#daten-transformationen)
5. [Output-Struktur](#output-struktur)

---

## 📥 Input-Struktur

### Webhook Trigger Output
**Quelle:** `📥 Webhook Trigger (API) - PRE-FORMATTED CONTENT`

**Struktur:**
```json
{
  "headers": { ... },
  "params": {},
  "query": {},
  "body": {},
  "email": {
    "subject": "🎉 Depeche Mode Party Sounds of the Universe - 05/16/2026",
    "html": "<div class=\"container\">...</div>",
    "recipients": "test.test@holio.com, pa.boe90@gmail.com, test.test@ji5.de, test.test@ji6.com",
    "templateId": "basic-event-announcement",
    "templateName": "Basic Event Announcement",
    "attachments": [
      {
        "filename": "DM-Flyer-Sounds_2026_05_16pdf-1770387389877-408910798.pdf",
        "url": "http://192.168.178.20:4000/api/files/...",
        "contentType": "application/pdf",
        "size": 184780
      },
      {
        "filename": "DM-Flyer-Sounds-A1-Plakat_2026_05_16-1770387389879-941721302.pdf",
        "url": "http://192.168.178.20:4000/api/files/...",
        "contentType": "application/pdf",
        "size": 1274951
      },
      {
        "filename": "DM-Sounds-INSTA_2026_05_16-1770387389884-905718266.jpg",
        "url": "http://192.168.178.20:4000/api/files/...",
        "contentType": "image/jpeg",
        "size": 936238
      }
    ]
  }
}
```

**WICHTIG:**
- `email` steht **direkt im Root-Level**, NICHT in `body.email`
- `body` ist ein leeres Objekt `{}`
- `attachments` ist ein Array von Objekten mit `filename`, `url`, `contentType`, `size`

---

## 🔄 Workflow-Flow

```
📥 Webhook Trigger
  ↓
📧 Has Email Content? (If-Node)
  ├─ TRUE → 📧 Prepare Email Data
  └─ FALSE → (Workflow stoppt)
  ↓
📎 Has Attachments? (If-Node)
  ├─ TRUE → 💾 Save Email Data
  └─ FALSE → 📧 Send Email (No Attachments)
  ↓
🔍 Filter Attachments per Group
  ↓
📎 Split Attachments (Split Out)
  ↓
📋 Preserve Email Metadata
  ↓
⬇️ Download Attachment (HTTP Request)
  ↓
🔗 Merge Attachments (Merge - combine mode)
  ↓
📧 Send Email (Email Send Node)
  ↓
🔧 Structure Response
```

---

## 📦 Node-Dokumentation

### 1. 📧 Has Email Content?
**Typ:** `if` (typeVersion: 2)  
**Script:** Kein Script  
**Input:** Webhook Trigger Output

**Bedingung:**
```javascript
$json.email && typeof $json.email === 'object'
```

**Logik:**
- Prüft, ob `email` direkt im Root-Level existiert
- Prüft, ob `email` ein Objekt ist (nicht null, nicht undefined, nicht primitiver Typ)
- **KEINE** Prüfung auf `body.email` - nur Root-Level
- **KEINE** Workarounds - strikte einheitliche Struktur

**Output:**
- **TRUE Branch:** Weiter zu `📧 Prepare Email Data`
- **FALSE Branch:** Workflow stoppt (keine Verbindung)

---

### 2. 📧 Prepare Email Data
**Typ:** `code` (typeVersion: 2)  
**Script:** `email-prepare.js`  
**Mode:** `runOnceForEachItem`  
**Input:** Webhook Trigger Output

**Transformation:**
```javascript
Input:  { email: {...}, headers: {...}, ... }
Output: { email: {...} }
```

**Code:**
```javascript
const input = $input.item.json;
const emailData = input.email;  // Direkt aus Root-Level

if (!emailData) {
  throw new Error('Invalid input: email is missing');
}

return [{
  json: {
    email: emailData
  }
}];
```

**Output-Struktur:**
```json
{
  "email": {
    "subject": "...",
    "html": "...",
    "recipients": "...",
    "templateId": "...",
    "templateName": "...",
    "attachments": [...]
  }
}
```

---

### 3. 📎 Has Attachments?
**Typ:** `if` (typeVersion: 2)  
**Script:** Kein Script  
**Input:** `📧 Prepare Email Data` Output

**Bedingung:**
```javascript
$json.email.attachments !== undefined && 
Array.isArray($json.email.attachments) && 
$json.email.attachments.length > 0
```

**Logik:**
- Prüft, ob `email.attachments` existiert
- Prüft, ob es ein Array ist
- Prüft, ob das Array nicht leer ist

**Output:**
- **TRUE Branch:** Weiter zu `💾 Save Email Data`
- **FALSE Branch:** Weiter zu `📧 Send Email (No Attachments)`

---

### 4. 💾 Save Email Data
**Typ:** `code` (typeVersion: 2)  
**Script:** `email-save-data.js`  
**Mode:** `runOnceForEachItem`  
**Input:** `📧 Prepare Email Data` Output

**Transformation:**
```javascript
Input:  { email: { attachments: [...] } }
Output: { email: { attachments: [...] }, emailData: {...} }
```

**Code:**
```javascript
const input = $input.item.json;
const email = input.email;

if (!email) {
  console.warn('No email data found in input:', Object.keys(input));
  return [{ json: input }];
}

const emailWithAttachments = {
  ...email,
  attachments: email.attachments || []
};

return [{
  json: {
    email: emailWithAttachments,
    emailData: emailWithAttachments
  }
}];
```

**Output-Struktur:**
```json
{
  "email": {
    "subject": "...",
    "html": "...",
    "recipients": "...",
    "attachments": [...]
  },
  "emailData": {
    "subject": "...",
    "html": "...",
    "recipients": "...",
    "attachments": [...]
  }
}
```

---

### 5. 🔍 Filter Attachments per Group
**Typ:** `code` (typeVersion: 2)  
**Script:** `email-filter-attachments.js`  
**Mode:** `runOnceForEachItem`  
**Input:** `💾 Save Email Data` Output

**Transformation:**
```javascript
Input:  { email: { attachments: [1,2,3,4,5,6], group: "vip" } }
Output: { email: { attachments: [1,4,6], group: "vip" } }
```

**Logik:**
- Liest `email.group` oder `email.recipients[0]` als Gruppe
- Filtert Attachments basierend auf Gruppen-Regeln:
  - `vip`: [1, 4, 6]
  - `test`: 'all'
  - `pa.boe`: [1]
- Embeddet Email-Metadaten in jedes Attachment (`_emailMetadata`)

**Code (Auszug):**
```javascript
const email = item.json.email || {};
const group = email.group || email.recipients?.[0] || 'default';
const allAttachments = email.attachments || [];

const attachmentRules = {
  'vip': [1, 4, 6],
  'test': 'all',
  'pa.boe': [1]
};

// Filter attachments...
const emailMetadata = {
  subject: email.subject,
  html: email.html,
  recipients: email.recipients,
  group: group,
  templateId: email.templateId,
  templateName: email.templateName
};

const attachmentsWithMetadata = filteredAttachments.map(att => ({
  ...att,
  _emailMetadata: emailMetadata
}));
```

**Output-Struktur:**
```json
{
  "email": {
    "subject": "...",
    "html": "...",
    "recipients": "...",
    "group": "vip",
    "attachments": [
      {
        "filename": "...",
        "url": "...",
        "contentType": "...",
        "size": ...,
        "_emailMetadata": {
          "subject": "...",
          "html": "...",
          "recipients": "...",
          "group": "vip",
          "templateId": "...",
          "templateName": "..."
        }
      }
    ]
  }
}
```

---

### 6. 📎 Split Attachments
**Typ:** `splitOut` (typeVersion: 1)  
**Script:** Kein Script  
**Input:** `🔍 Filter Attachments per Group` Output

**Konfiguration:**
- `fieldToSplitOut`: `email.attachments`
- `alwaysOutputData`: `true`

**Transformation:**
```javascript
Input:  { email: { attachments: [att1, att2, att3] } }
Output: [
  { email: { attachments: [att1] } },
  { email: { attachments: [att2] } },
  { email: { attachments: [att3] } }
]
```

**WICHTIG:**
- Split Out behält nur das aufgeteilte Feld
- Email-Metadaten gehen verloren (werden in `📋 Preserve Email Metadata` wiederhergestellt)
- Jedes Attachment enthält `_emailMetadata` (wurde in Filter-Node eingebettet)

**Output-Struktur (pro Item):**
```json
{
  "email": {
    "attachments": [
      {
        "filename": "...",
        "url": "...",
        "contentType": "...",
        "size": ...,
        "_emailMetadata": {...}
      }
    ]
  }
}
```

---

### 7. 📋 Preserve Email Metadata
**Typ:** `code` (typeVersion: 2)  
**Script:** `email-preserve-metadata.js`  
**Mode:** `runOnceForEachItem`  
**Input:** `📎 Split Attachments` Output

**Transformation:**
```javascript
Input:  { email: { attachments: [{ url: "...", _emailMetadata: {...} }] } }
Output: { email: {...}, url: "...", filename: "...", contentType: "..." }
```

**Code:**
```javascript
const item = $input.item;
const attachment = item.json;
const emailMetadata = attachment._emailMetadata || {};

return [{
  json: {
    email: {
      subject: emailMetadata.subject,
      html: emailMetadata.html,
      recipients: emailMetadata.recipients,
      group: emailMetadata.group,
      templateId: emailMetadata.templateId,
      templateName: emailMetadata.templateName
    },
    url: attachment.url,
    filename: attachment.filename,
    contentType: attachment.contentType
  },
  binary: item.binary || {}
}];
```

**Output-Struktur:**
```json
{
  "email": {
    "subject": "...",
    "html": "...",
    "recipients": "...",
    "group": "vip",
    "templateId": "...",
    "templateName": "..."
  },
  "url": "http://192.168.178.20:4000/api/files/...",
  "filename": "DM-Flyer-Sounds_2026_05_16pdf-1770387389877-408910798.pdf",
  "contentType": "application/pdf"
}
```

---

### 8. ⬇️ Download Attachment
**Typ:** `httpRequest` (typeVersion: 4.2)  
**Script:** Kein Script  
**Input:** `📋 Preserve Email Metadata` Output

**Konfiguration:**
- `method`: `GET`
- `url`: `={{ $json.url }}`
- `responseFormat`: `file`
- `authentication`: `none`

**Transformation:**
```javascript
Input:  { email: {...}, url: "http://..." }
Output: { email: {...}, url: "...", binary: { data: <BinaryData> } }
```

**WICHTIG:**
- `responseFormat: "file"` erstellt Binary-Daten in `item.binary.data`
- Binary-Daten sind **NICHT** Base64, sondern direkt als Binary
- Email-Metadaten bleiben erhalten

**Output-Struktur:**
```json
{
  "email": {
    "subject": "...",
    "html": "...",
    "recipients": "...",
    "group": "vip"
  },
  "url": "http://...",
  "filename": "...",
  "contentType": "..."
}
// Plus: binary.data (Binary-Daten)
```

---

### 9. 🔗 Merge Attachments
**Typ:** `merge` (typeVersion: 2.1)  
**Script:** Kein Script  
**Input:** `⬇️ Download Attachment` Output (mehrere Items)

**Konfiguration:**
- `mode`: `combine`
- `options`: `{}`

**Transformation:**
```javascript
Input:  [
  { email: {...}, binary: { data: <Binary1> } },
  { email: {...}, binary: { data: <Binary2> } },
  { email: {...}, binary: { data: <Binary3> } }
]
Output: [
  {
    email: {...},
    binary: {
      data: <Binary1>,
      data_1: <Binary2>,
      data_2: <Binary3>
    }
  }
]
```

**WICHTIG:**
- `combine` Mode kombiniert alle Items zu einem Item
- Alle Binary-Daten werden in einem Item gesammelt
- Email-Metadaten bleiben erhalten (sind in allen Items identisch)

**Output-Struktur:**
```json
{
  "email": {
    "subject": "...",
    "html": "...",
    "recipients": "...",
    "group": "vip"
  }
}
// Plus: binary.data, binary.data_1, binary.data_2 (alle Attachments als Binary)
```

---

### 10. 📧 Send Email
**Typ:** `emailSend` (typeVersion: 2.1)  
**Script:** Kein Script  
**Input:** `🔗 Merge Attachments` Output

**Konfiguration:**
- `fromEmail`: `noreply@eventpromoter.com`
- `toEmail`: `={{ $json.email.recipients || $json.email.group || 'user@example.com' }}`
- `subject`: `={{ $json.email.subject }}`
- `html`: `={{ $json.email.html }}`
- `attachments`: `""` (leer)
- `options.attachments.binaryProperty`: `"data"`

**WICHTIG:**
- `attachments` Feld ist **leer** (`""`)
- `binaryProperty: "data"` sagt n8n, dass alle Binary-Daten mit Property `data` als Attachments verwendet werden sollen
- n8n verwendet automatisch `binary.data`, `binary.data_1`, `binary.data_2`, etc. als Attachments

**Output-Struktur:**
```json
{
  "email": {
    "subject": "...",
    "html": "...",
    "recipients": "..."
  }
}
// Email wurde versendet
```

---

### 11. 📧 Send Email (No Attachments)
**Typ:** `emailSend` (typeVersion: 2.1)  
**Script:** Kein Script  
**Input:** `📧 Prepare Email Data` Output (wenn keine Attachments)

**Konfiguration:**
- `fromEmail`: `noreply@eventpromoter.com`
- `toEmail`: `={{ $json.email.recipients || 'user@example.com' }}`
- `subject`: `={{ $json.email.subject }}`
- `html`: `={{ $json.email.html }}`
- Keine Attachments-Konfiguration

---

## 🔄 Daten-Transformationen

### Transformation Chain:

1. **Webhook → Prepare:**
   ```
   { email: {...} } → { email: {...} }
   ```
   (Normalisierung, entfernt andere Felder)

2. **Prepare → Save:**
   ```
   { email: {...} } → { email: {...}, emailData: {...} }
   ```
   (Sichert Email-Daten, stellt sicher dass attachments Array existiert)

3. **Save → Filter:**
   ```
   { email: { attachments: [1,2,3,4,5,6] } } 
   → 
   { email: { attachments: [1,4,6], group: "vip" } }
   ```
   (Filtert Attachments, embeddet Metadaten)

4. **Filter → Split:**
   ```
   { email: { attachments: [att1, att2, att3] } }
   →
   [
     { email: { attachments: [att1] } },
     { email: { attachments: [att2] } },
     { email: { attachments: [att3] } }
   ]
   ```
   (Splittet in einzelne Items)

5. **Split → Preserve:**
   ```
   { email: { attachments: [{ url: "...", _emailMetadata: {...} }] } }
   →
   { email: {...}, url: "...", filename: "..." }
   ```
   (Stellt Email-Metadaten wieder her, extrahiert Attachment-Daten)

6. **Preserve → Download:**
   ```
   { email: {...}, url: "..." }
   →
   { email: {...}, url: "...", binary: { data: <Binary> } }
   ```
   (Lädt Attachment als Binary-Daten)

7. **Download → Merge:**
   ```
   [
     { email: {...}, binary: { data: <B1> } },
     { email: {...}, binary: { data: <B2> } },
     { email: {...}, binary: { data: <B3> } }
   ]
   →
   [
     { email: {...}, binary: { data: <B1>, data_1: <B2>, data_2: <B3> } }
   ]
   ```
   (Kombiniert alle Attachments in einem Item)

8. **Merge → Send:**
   ```
   { email: {...}, binary: { data: <B1>, data_1: <B2>, data_2: <B3> } }
   →
   Email wird versendet mit allen Attachments
   ```

---

## 📤 Output-Struktur

### Erfolgreiche Email-Versendung:
```json
{
  "email": {
    "subject": "🎉 Depeche Mode Party Sounds of the Universe - 05/16/2026",
    "html": "<div class=\"container\">...</div>",
    "recipients": "test.test@holio.com, pa.boe90@gmail.com, ...",
    "group": "vip"
  }
}
```

### Final Response (nach Structure Response):
```json
{
  "success": true,
  "data": {
    "email": {
      "success": true,
      "postId": "...",
      "messageId": "..."
    }
  }
}
```

---

## ⚠️ WICHTIGE HINWEISE

### 1. Datenstruktur
- **NIEMALS** `body.email` prüfen - nur `email` im Root-Level
- **NIEMALS** mehrere Orte prüfen (`$json.email || $json.body?.email`)
- **IMMER** nur einen Ort: `$json.email`

### 2. Binary-Daten
- HTTP Request Node mit `responseFormat: "file"` erstellt Binary-Daten
- Binary-Daten sind **NICHT** Base64, sondern direkt als Binary
- Email Send Node verwendet `binaryProperty: "data"` für Attachments
- **KEIN** Transform zu Base64 nötig

### 3. Split Out
- Split Out behält nur das aufgeteilte Feld
- Email-Metadaten müssen vorher in Attachments eingebettet werden (`_emailMetadata`)
- Nach Split Out müssen Metadaten wiederhergestellt werden

### 4. Merge Node
- `combine` Mode kombiniert alle Items zu einem Item
- Alle Binary-Daten werden in einem Item gesammelt
- Email-Metadaten bleiben erhalten (sind in allen Items identisch)

### 5. Email Send Node
- `attachments` Feld ist **leer** (`""`)
- `binaryProperty: "data"` sagt n8n, welche Binary-Properties als Attachments verwendet werden sollen
- n8n verwendet automatisch alle Binary-Properties (`data`, `data_1`, `data_2`, etc.)

---

## 🔧 Anpassungen

### Letzte Änderungen:
1. **If-Node Bedingung:** `!!$json.email` → `$json.email && typeof $json.email === 'object'`
   - Grund: Explizite Prüfung auf Objekt-Existenz, keine Workarounds
   - Datum: 2026-02-07

2. **Prepare Script:** Entfernt `input.body?.email` Fallback
   - Grund: Email ist immer im Root-Level, strikte einheitliche Struktur
   - Datum: 2026-02-07

---

## ✅ Test-Checkliste

- [ ] Webhook Trigger gibt `email` im Root-Level aus
- [ ] If-Node erkennt `email` korrekt
- [ ] Prepare Node extrahiert `email` korrekt
- [ ] Filter Node filtert Attachments basierend auf Gruppe
- [ ] Split Out splittet Attachments korrekt
- [ ] Preserve Node stellt Email-Metadaten wieder her
- [ ] Download Node lädt Attachments als Binary
- [ ] Merge Node kombiniert alle Attachments
- [ ] Email Send Node versendet Email mit allen Attachments

---

**Dokument erstellt:** 2026-02-07  
**Letzte Aktualisierung:** 2026-02-07  
**Version:** 1.0.0
