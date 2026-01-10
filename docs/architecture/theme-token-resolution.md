# Theme Token Resolution - Architektur

## Kernprinzip

> **Frontend ist 100% generisch - kennt keine Platforms, keine Themes, keine Tokens**

> **Backend ist Source of Truth - resolved alle Tokens zu konkreten Werten**

---

## Architektur-Übersicht

```
Backend Schema (mit Tokens)
  ↓
Backend Token Resolver (kennt Dark Mode)
  ↓
Resolved Schema (konkrete Hex-Farben)
  ↓
Frontend (rendert Schema - dumm & generisch)
```

---

## 1. Backend Schema (mit semantischen Tokens)

### Plattform-spezifische Tokens (nicht Theme-Tokens!)

**Beispiel: Email Platform**

```typescript
// backend/src/platforms/email/schema/preview.ts
export const emailPreviewSchema: PreviewSchema = {
  // ...
  styling: {
    backgroundColor: 'email.surface.primary',  // ← Semantischer Token
    textColor: 'email.text.primary',           // ← Semantischer Token
    fontFamily: 'Arial, sans-serif'            // ← Konkreter Wert
  }
}
```

**Wichtig:** Tokens sind **plattform-spezifisch**, nicht generisch!

- `email.surface.primary` (nicht `theme.background.paper`)
- `discord.surface.primary` (andere Bedeutung!)
- `web.surface.primary` (wieder andere!)

---

## 2. Backend Token Map (pro Plattform)

### Token-Definition mit Light/Dark Varianten

```typescript
// backend/src/platforms/email/tokens.ts
export const emailTokens = {
  surface: {
    primary: {
      light: '#ffffff',
      dark: '#1e1e1e'
    },
    secondary: {
      light: '#f5f5f5',
      dark: '#2d2d2d'
    }
  },
  text: {
    primary: {
      light: '#000000',
      dark: '#ffffff'
    },
    secondary: {
      light: '#666666',
      dark: '#b0b0b0'
    }
  },
  accent: {
    brand: {
      light: '#1976d2',
      dark: '#1976d2'  // Kann gleich bleiben
    }
  }
}
```

**Jede Plattform hat ihre eigene Token-Map!**

---

## 3. Backend Token Resolver

### Auflösung basierend auf Dark Mode

```typescript
// backend/src/utils/tokenResolver.ts

interface TokenMap {
  [key: string]: {
    light: string
    dark: string
  }
}

function resolveToken(
  token: string,           // z.B. "email.surface.primary"
  tokenMap: TokenMap,     // emailTokens
  darkMode: boolean       // Vom Frontend-Request
): string {
  // Parse token: "email.surface.primary" → ["surface", "primary"]
  const parts = token.split('.')
  const category = parts[1]  // "surface"
  const name = parts[2]      // "primary"
  
  // Hole Token-Wert
  const tokenValue = tokenMap[category]?.[name]
  if (!tokenValue) {
    return token  // Fallback: Token selbst zurückgeben
  }
  
  // Wähle Light/Dark basierend auf darkMode
  return darkMode ? tokenValue.dark : tokenValue.light
}

function resolveSchema(
  schema: PreviewSchema,
  platformId: string,
  darkMode: boolean
): PreviewSchema {
  const tokenMap = getPlatformTokenMap(platformId)  // Lädt emailTokens, discordTokens, etc.
  
  if (schema.styling?.backgroundColor?.startsWith(`${platformId}.`)) {
    schema.styling.backgroundColor = resolveToken(
      schema.styling.backgroundColor,
      tokenMap,
      darkMode
    )
  }
  
  if (schema.styling?.textColor?.startsWith(`${platformId}.`)) {
    schema.styling.textColor = resolveToken(
      schema.styling.textColor,
      tokenMap,
      darkMode
    )
  }
  
  return schema
}
```

---

## 4. API Endpoint (mit Dark Mode Parameter)

### Frontend sendet Dark Mode mit

```typescript
// backend/src/routes/platforms.ts

router.get('/:platformId/schema', async (req, res) => {
  const { platformId } = req.params
  const darkMode = req.query.darkMode === 'true'  // ← Vom Frontend
  
  const rawSchema = await getPlatformSchema(platformId)
  const resolvedSchema = resolveSchema(rawSchema, platformId, darkMode)
  
  res.json({
    success: true,
    schema: resolvedSchema  // ← Nur konkrete Hex-Farben, keine Tokens mehr!
  })
})
```

---

## 5. Frontend (bleibt dumm & generisch)

### Frontend kennt keine Tokens

```javascript
// frontend/src/components/PlatformPreview/PlatformPreview.jsx

const { schema } = usePlatformSchema(platform, darkMode)  // ← Sendet darkMode mit

// Schema hat jetzt konkrete Farben:
// schema.preview.styling.backgroundColor = '#1e1e1e' (wenn darkMode)
// schema.preview.styling.backgroundColor = '#ffffff' (wenn lightMode)

<Box sx={{ 
  bgcolor: schema.preview.styling.backgroundColor,  // ← Direkt verwenden!
  color: schema.preview.styling.textColor
}}>
```

**Frontend macht nichts Besonderes** - es rendert einfach die Werte aus dem Schema!

---

## Vorteile dieser Architektur

### ✅ Frontend bleibt 100% generisch
- Kein Platform-Wissen
- Kein Theme-Wissen
- Kein Token-Wissen
- Nur Schema-Rendering

### ✅ Backend hat volle Kontrolle
- Jede Plattform definiert ihre Tokens
- Backend resolved basierend auf Dark Mode
- Frontend bekommt nur finale Werte

### ✅ Skaliert perfekt
- Neue Plattform → nur Backend Token-Map
- Neues Theme → nur Backend Token-Map
- Frontend bleibt unverändert

### ✅ Keine Redundanz
- Keine doppelten Schemas (Light/Dark)
- Tokens werden zentral aufgelöst
- Ein Schema, viele Varianten

---

## Implementierungs-Schritte

### Schritt 1: Token-Maps pro Plattform erstellen

```typescript
// backend/src/platforms/email/tokens.ts
export const emailTokens = { ... }

// backend/src/platforms/discord/tokens.ts
export const discordTokens = { ... }
```

### Schritt 2: Token Resolver implementieren

```typescript
// backend/src/utils/tokenResolver.ts
export function resolveSchema(schema, platformId, darkMode) { ... }
```

### Schritt 3: API Endpoint erweitern

```typescript
// backend/src/routes/platforms.ts
// Dark Mode Parameter hinzufügen
```

### Schritt 4: Frontend sendet Dark Mode mit

```javascript
// frontend/src/hooks/usePlatformSchema.js
// darkMode als Query-Parameter senden
```

### Schritt 5: Frontend nutzt resolved Werte direkt

```javascript
// frontend/src/components/PlatformPreview/PlatformPreview.jsx
// Direkt schema.styling.backgroundColor verwenden
```

---

## Beispiel-Flow

### 1. Frontend Request

```javascript
GET /api/platforms/email/schema?darkMode=true
```

### 2. Backend lädt Schema

```typescript
rawSchema = {
  styling: {
    backgroundColor: 'email.surface.primary',
    textColor: 'email.text.primary'
  }
}
```

### 3. Backend resolved Tokens

```typescript
resolvedSchema = {
  styling: {
    backgroundColor: '#1e1e1e',  // ← Aus emailTokens.surface.primary.dark
    textColor: '#ffffff'           // ← Aus emailTokens.text.primary.dark
  }
}
```

### 4. Frontend rendert

```javascript
<Box sx={{ 
  bgcolor: '#1e1e1e',  // ← Direkt aus Schema
  color: '#ffffff'
}}>
```

**Frontend weiß nicht, dass das mal ein Token war!**

---

## Warum das besser ist als Option 2

### Option 2 (Separate Light/Dark Schemas)

❌ **Redundanz:**
```typescript
preview: {
  styling: {
    light: { backgroundColor: '#ffffff' },
    dark: { backgroundColor: '#1e1e1e' }
  }
}
```

❌ **Skaliert schlecht:**
- Jede Plattform muss beide Varianten definieren
- Bei 10 Plattformen = 20 Konfigurationen
- Bei neuen Themes = noch mehr Duplikation

### Option 1 (Token Resolution im Backend)

✅ **DRY:**
```typescript
tokens: {
  surface: { primary: { light: '#ffffff', dark: '#1e1e1e' } }
}
schema: {
  styling: { backgroundColor: 'email.surface.primary' }
}
```

✅ **Skaliert perfekt:**
- Ein Token-System pro Plattform
- Resolution-Logik zentral
- Neue Themes = nur Token-Map erweitern

---

## Zusammenfassung

**Architektur-Prinzip:**
- Frontend = Schema-Interpreter (dumm & generisch)
- Backend = Token-Resolver (intelligent & platform-aware)

**Token-System:**
- Plattform-spezifische semantische Tokens
- Backend resolved zu konkreten Werten
- Frontend bekommt nur finale Hex-Farben

**Dark Mode:**
- Frontend sendet `darkMode` Parameter
- Backend resolved Tokens basierend darauf
- Frontend rendert einfach die Werte

**Ergebnis:**
- ✅ Frontend bleibt 100% generisch
- ✅ Backend hat volle Kontrolle
- ✅ Perfekt skalierbar
- ✅ Keine Redundanz

