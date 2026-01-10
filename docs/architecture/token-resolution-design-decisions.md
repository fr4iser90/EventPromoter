# Token Resolution - Offene Design-Entscheidungen



## Kernprinzip

> **Frontend ist 100% generisch - kennt keine Platforms, keine Themes, keine Tokens**

> **Backend ist Source of Truth - resolved alle Tokens zu konkreten Werten**


## Übersicht

Bevor wir die Token-Resolution implementieren, müssen folgende Design-Entscheidungen getroffen werden:

---

## 1. Token-Syntax & Namenskonvention

### ✅ Entscheidung: Plattform-Präfix (Option A)

**Format:**
```
<platform>.<category>.<path...>
```

**Beispiele:**
```
email.surface.primary
email.text.primary
discord.surface.primary
email.component.button.primary.hover
```

**Formale Definition:**
- **Mindestens 3 Segmente:** `<platform>.<category>.<name>`
- **Alles danach frei:** `<platform>.<category>.<name>.<sub>.<sub>...`
- **Validierung:** `/^[a-z0-9_-]+\.[a-z0-9_-]+(\.[a-z0-9_-]+)+$/`

**Warum:**
- ✅ Plattform ist explizit
- ✅ Keine impliziten Kontexte
- ✅ Kein "magisches Wissen" im Resolver
- ✅ Schema ist selbsterklärend
- ✅ Triviale Validierung

---

## 2. Token-Struktur & Hierarchie

### ✅ Entscheidung: Flexible Tiefe

**Beispiele:**
```
email.surface.primary              (3 Ebenen)
email.surface.primary.hover         (4 Ebenen)
email.component.button.primary      (4 Ebenen)
email.component.button.primary.hover.disabled  (6 Ebenen)
```

**Wichtig:**
- ❗ **Keine semantische Interpretation** - Resolver interpretiert nichts
- ❗ **Keine Sonderlogik** für `hover`, `active`, etc. - das sind reine Keys
- ✅ **Flexible Tiefe** - kein Limit
- ✅ **Standard-Kategorien:** `surface`, `text`, `accent`, `border`, `divider`
- ✅ **Plattformen können eigene Kategorien** hinzufügen

**Resolver-Contract:**
- Der Resolver **interpretiert nichts**
- Der Resolver **transformiert nichts**
- Der Resolver **mappt exakt Key → Value**

---

## 3. Fallback-Verhalten

### ✅ Entscheidung: Token unverändert zurückgeben + Logging

**Verhalten:**
```typescript
resolveToken('email.unknown.token', ...) 
// → 'email.unknown.token' (unverändert zurückgeben)
```

**Logging:**
- **Development:** `console.warn('Token not found: email.unknown.token')`
- **Production:** Still (kein Logging)

**Warum:**
- ✅ Frontend kann immer rendern (kein Crash)
- ✅ Kein versteckter visueller Fallback
- ✅ Fehler bleiben sichtbar, aber nicht tödlich
- ✅ Frontend sieht den Token-String (kann Debug-Info anzeigen)

**Wichtig:**
- Hex-Werte sind **kein Token** - sie bypass-en den Resolver
- Hex-Werte werden **nicht interpretiert**
- Nur Strings die dem Token-Pattern entsprechen werden resolved

---

## 4. Token-Vererbung & Komposition

### Frage: Können Plattformen Tokens von anderen Plattformen erben?

**Beispiel:**
```typescript
// discord/tokens.ts
export const discordTokens = {
  ...emailTokens,  // Erbt von Email
  surface: {
    ...emailTokens.surface,
    special: { light: '#ff0000', dark: '#00ff00' }  // Erweitert
  }
}
```

**Entscheidung nötig:**
- Soll Vererbung unterstützt werden?
- Oder jede Plattform komplett eigenständig?

**Empfehlung:** Keine Vererbung (erstmal)
- ✅ Einfacher
- ✅ Klarer
- ✅ Später erweiterbar

---

## 5. Custom Themes & User-Präferenzen

### Frage: Wie werden benutzerdefinierte Themes gehandhabt?

**Szenario:**
- User möchte eigene Farben für Email-Plattform
- Sollen User-Themes Token-Maps überschreiben können?

**Option A: User-Themes als Override**
```typescript
userTheme = {
  'email.surface.primary': { light: '#custom', dark: '#custom' }
}
// Überschreibt Platform-Token-Map
```

**Option B: Separate Theme-Instanz**
```typescript
// User wählt "Custom Blue Theme"
// Backend lädt custom-blue-tokens.ts
```

**Option C: Keine User-Themes (erstmal)**
```typescript
// Nur Platform-Defaults
```

**Empfehlung:** Option C (erstmal)
- ✅ MVP fokussiert
- ✅ Später erweiterbar
- ✅ Weniger Komplexität

---

## 6. Performance & Caching

### ✅ Entscheidung: In-Memory Cache mit Schema-Version

**Cache-Key Format:**
```
<platformId>:<darkMode>:<schemaVersion>
```

**Beispiele:**
```
email:true:1.0.0
email:false:1.0.0
discord:true:1.2.0
```

**Warum Schema-Version im Key:**
- ✅ Schemas werden versioniert
- ✅ Ohne Version → harte Cache-Bugs
- ✅ Schema-Update → automatisch neuer Cache-Eintrag

**Implementierung:**
```typescript
const cache = new Map<string, PreviewSchema>()

function getCacheKey(platformId: string, darkMode: boolean, schemaVersion: string): string {
  return `${platformId}:${darkMode}:${schemaVersion}`
}

function getCachedSchema(key: string): PreviewSchema | null {
  return cache.get(key) || null
}

function setCachedSchema(key: string, schema: PreviewSchema): void {
  cache.set(key, schema)
}
```

**Vorteile:**
- ✅ Schnell
- ✅ Einfach
- ✅ Später erweiterbar (Redis, etc.)
- ✅ Keine Cache-Bugs durch Schema-Updates

---

## 7. Migration bestehender Schemas

### Frage: Wie migrieren wir hardcodierte Farben zu Tokens?

**Aktueller Zustand:**
```typescript
styling: {
  backgroundColor: '#ffffff',  // Hardcodiert
  textColor: '#000000'
}
```

**Ziel-Zustand:**
```typescript
styling: {
  backgroundColor: 'email.surface.primary',  // Token
  textColor: 'email.text.primary'
}
```

**Entscheidung nötig:**
- Automatische Migration?
- Manuelle Migration pro Plattform?
- Beide parallel unterstützen (Backward Compatibility)?

**Empfehlung:** Beide parallel
```typescript
if (value.startsWith('email.')) {
  // Token → resolve
} else if (value.startsWith('#')) {
  // Hex-Farbe → direkt verwenden
} else {
  // Unbekannt → Fallback
}
```

---

## 8. Token-Typen & Werte

### Frage: Nur Farben oder auch andere Werte?

**Aktuell:**
- `backgroundColor: 'email.surface.primary'` → Farbe

**Erweiterbar:**
- `spacing: 'email.spacing.large'` → `'24px'`
- `fontSize: 'email.typography.heading'` → `'24px'`
- `borderRadius: 'email.shape.rounded'` → `'8px'`

**Entscheidung nötig:**
- Erstmal nur Farben?
- Oder gleich vollständiges Design-Token-System?

**Empfehlung:** Erstmal nur Farben
- ✅ MVP fokussiert
- ✅ Später erweiterbar
- ✅ Weniger Komplexität

---

## 9. API-Design

### ✅ Entscheidung: Query Parameter (Option A)

**Request:**
```
GET /api/platforms/email/schema?mode=dark
GET /api/platforms/email/schema?mode=light
```

**Alternative (Boolean):**
```
GET /api/platforms/email/schema?darkMode=true
```

**Empfehlung: Enum (`mode=dark`)**
- ✅ RESTful
- ✅ Einfach
- ✅ Cacheable
- ✅ GET Request bleibt GET
- ✅ Erweiterbar (später: `mode=high-contrast`, etc.)

**Response:**
```json
{
  "success": true,
  "schema": {
    "preview": {
      "styling": {
        "backgroundColor": "#1e1e1e",  // ← Resolved (kein Token mehr!)
        "textColor": "#ffffff"
      }
    }
  },
  "version": "1.0.0"  // ← Für Cache-Key
}
```

---

## 10. Frontend-Integration

### Frage: Wie sendet Frontend darkMode mit?

**Option A: Im Hook**
```javascript
// usePlatformSchema.js
const { schema } = usePlatformSchema(platform, darkMode)
// → GET /api/platforms/email/schema?darkMode=true
```

**Option B: Globaler Context**
```javascript
// App.jsx setzt global
// Alle Requests automatisch mit darkMode
```

**Option C: Interceptor**
```javascript
// axios interceptor fügt darkMode automatisch hinzu
```

**Empfehlung:** Option A
- ✅ Explizit
- ✅ Klar
- ✅ Einfach zu debuggen

---

## 11. Token-Validierung

### ✅ Entscheidung: Schema-Load + Runtime Validation

**Schema-Load-Zeit:**
- ✅ Validieren (Token-Pattern prüfen)
- ✅ Warnen (Token existiert nicht in Token-Map)
- ✅ Schema trotzdem laden (nicht crashen)

**Runtime-Resolution:**
- ✅ Warnen (Development: `console.warn`)
- ✅ Still (Production: kein Logging)
- ✅ Niemals crashen
- ✅ Token unverändert zurückgeben

**Token-Pattern Validierung:**
```typescript
const TOKEN_PATTERN = /^[a-z0-9_-]+\.[a-z0-9_-]+(\.[a-z0-9_-]+)+$/

function isValidToken(token: string): boolean {
  return TOKEN_PATTERN.test(token)
}
```

**Vorteile:**
- ✅ Frühe Fehler (beim Schema-Laden)
- ✅ Saubere Validierung
- ✅ Kein Crash
- ✅ Entwickler sieht Probleme sofort

---

## 12. Token-Map Struktur

### Frage: Wie werden Token-Maps organisiert?

**Option A: Pro Plattform eine Datei**
```
platforms/email/tokens.ts
platforms/discord/tokens.ts
```

**Option B: Zentral**
```
tokens/email.ts
tokens/discord.ts
```

**Option C: In Schema-Datei**
```
platforms/email/schema/preview.ts (mit tokens)
```

**Empfehlung:** Option A
- ✅ Nahe bei Plattform-Code
- ✅ Einfach zu finden
- ✅ Konsistent mit Schema-Struktur

---

## 13. Dark Mode Detection

### Frage: Woher weiß Backend, welcher Dark Mode aktiv ist?

**Option A: Frontend sendet explizit**
```
GET /api/platforms/email/schema?darkMode=true
```

**Option B: Backend liest User-Präferenz**
```
// Backend hat User-Session
// Liest darkMode aus User-Config
```

**Option C: Browser-Präferenz**
```
// Backend liest prefers-color-scheme Header
```

**Empfehlung:** Option A
- ✅ Explizit
- ✅ Frontend hat Kontrolle
- ✅ Einfach zu testen

---

## 14. Token-Resolution Scope

### Frage: Wo genau werden Tokens resolved?

**Option A: Nur in Preview-Schema**
```typescript
// Nur preview.styling wird resolved
```

**Option B: Überall im Schema**
```typescript
// Alle styling-Properties werden resolved
// Editor, Preview, Panel, etc.
```

**Option C: Konfigurierbar pro Schema-Teil**
```typescript
// Schema definiert, welche Teile resolved werden sollen
```

**Empfehlung:** Option B
- ✅ Konsistent
- ✅ Einfach
- ✅ Keine Überraschungen

---

## Zusammenfassung der finalen Entscheidungen

### ✅ Finale Entscheidungen:

1. **Token-Syntax:** `<platform>.<category>.<path...>` (mind. 3 Segmente)
   - Pattern: `/^[a-z0-9_-]+\.[a-z0-9_-]+(\.[a-z0-9_-]+)+$/`
2. **Token-Hierarchie:** Flexible Tiefe (kein Limit)
   - Resolver interpretiert nichts - nur Key → Value Mapping
3. **Fallback:** Token unverändert zurückgeben + Logging (Development)
4. **Vererbung:** Keine (erstmal)
5. **User-Themes:** Keine (erstmal) - Tür offen gelassen
6. **Caching:** In-Memory Cache mit Schema-Version im Key
   - Key: `<platformId>:<darkMode>:<schemaVersion>`
7. **Migration:** Beide parallel (Tokens + Hex)
   - Hex-Werte bypass-en Resolver
8. **Token-Typen:** Erstmal nur Farben (nicht ausufern lassen)
9. **API:** Query Parameter `?mode=dark` (Enum, nicht Boolean)
10. **Frontend:** Hook sendet darkMode explizit
11. **Validierung:** Schema-Load + Runtime (Pattern + Existenz)
12. **Token-Maps:** Pro Plattform eine Datei
13. **Dark Mode:** Frontend sendet explizit
14. **Scope:** Überall im Schema (keine Special Cases)

### 🔧 Wichtige Ergänzungen:

- **Cache-Key:** Muss Schema-Version enthalten
- **Token-Pattern:** Formal definiert für saubere Validierung
- **Resolver-Contract:** Explizit dokumentiert (interpretiert nichts, transformiert nichts)

### ✅ Bereit für Implementierung

Alle Design-Entscheidungen sind getroffen und dokumentiert. Die Architektur ist:
- ✅ Durchdacht
- ✅ Konsistent
- ✅ Skalierbar
- ✅ Frontend bleibt 100% generisch

---

## Nächste Schritte

1. ✅ Design-Entscheidungen dokumentiert
2. ⏳ Entscheidungen bestätigen/ändern
3. ⏳ Implementierung starten
4. ⏳ Migration bestehender Schemas
5. ⏳ Testing & Validierung

