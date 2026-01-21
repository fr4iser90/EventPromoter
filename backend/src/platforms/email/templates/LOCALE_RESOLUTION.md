# Email Template Locale Resolution

## Übersicht

Das Email-Template-System unterstützt mehrsprachige Templates mit automatischer Locale-Auflösung. Die Locale wird in folgender Priorität aufgelöst:

1. **Email-Level** (höchste Priorität) - Explizit im Email-Content gesetzt
2. **Target-Level** - Locale pro Empfänger (Target)
3. **Group-Level** - Locale pro Gruppe
4. **Template-Level** - Default-Locale des Templates
5. **User Language** - Sprache aus User Preferences
6. **Default** - Englisch ('en')

## Verwendung

### Template mit defaultLocale

```typescript
export const personalInvitationTemplate: EmailTemplate = {
  id: 'personal-invitation',
  name: 'Personal Invitation',
  defaultLocale: 'de', // Template verwendet standardmäßig Deutsch
  template: {
    subject: '🎉 You\'re invited: {name}',
    html: '...'
  },
  translations: {
    de: { subject: '...', html: '...' },
    es: { subject: '...', html: '...' }
  }
}
```

### Locale-Resolution verwenden

```typescript
import { resolveTemplateLocale, renderTemplate } from './templates'
import { ConfigService } from '../../../services/configService'

// Beispiel: Locale für einen Empfänger auflösen
const template = getTemplateById('personal-invitation')
const userPreferences = await ConfigService.getUserPreferences()
const target = { email: 'user@example.com', locale: 'de' } // Target mit Locale

const resolvedLocale = resolveTemplateLocale({
  emailLocale: content.locale, // Optional: explizit im Email-Content
  targetLocale: target.locale, // Optional: aus Target
  template: template,
  userLanguage: userPreferences?.language // Optional: aus User Preferences
})

// Template mit aufgelöster Locale rendern
const rendered = renderTemplate(template, variables, resolvedLocale)
```

### Target mit Locale

Targets können ein `locale` Feld haben:

```json
{
  "id": "target-123",
  "email": "user@example.com",
  "name": "Max Mustermann",
  "locale": "de"
}
```

### Group mit Locale

Groups können Locale in `metadata` haben:

```json
{
  "id": "group-123",
  "name": "Deutsche Kunden",
  "targetIds": ["target-1", "target-2"],
  "metadata": {
    "locale": "de"
  }
}
```

## API

### `resolveTemplateLocale(options)`

Löst die Locale für Template-Rendering auf.

**Parameter:**
- `emailLocale?: 'en' | 'de' | 'es'` - Explizite Email-Locale (höchste Priorität)
- `targetLocale?: 'en' | 'de' | 'es'` - Locale aus Target
- `groupLocale?: 'en' | 'de' | 'es'` - Locale aus Group
- `template?: EmailTemplate` - Template (für defaultLocale)
- `userLanguage?: string` - User Language aus Preferences

**Returns:** `'en' | 'de' | 'es'`

### `extractLocaleFromTargetOrGroup(targetOrGroup)`

Extrahiert Locale aus Target oder Group.

**Parameter:**
- `targetOrGroup: any` - Target oder Group Objekt

**Returns:** `'en' | 'de' | 'es' | undefined`

### `renderTemplate(template, variables, locale?)`

Rendert Template mit Variablen und optionaler Locale.

**Parameter:**
- `template: EmailTemplate` - Template
- `variables: Record<string, string>` - Template-Variablen
- `locale?: 'en' | 'de' | 'es'` - Optional: Locale (wird automatisch aufgelöst wenn nicht angegeben)

**Returns:** `{ subject: string, html: string }`

## Beispiele

### Beispiel 1: Standard (User Language)

```typescript
// User Language: 'de'
// Template: kein defaultLocale
// Target: kein locale

const locale = resolveTemplateLocale({
  userLanguage: 'de'
})
// Result: 'de'
```

### Beispiel 2: Template Default

```typescript
// User Language: 'en'
// Template: defaultLocale: 'de'
// Target: kein locale

const locale = resolveTemplateLocale({
  template: templateWithDefaultDe,
  userLanguage: 'en'
})
// Result: 'de' (Template Default überschreibt User Language)
```

### Beispiel 3: Target Locale

```typescript
// User Language: 'en'
// Template: defaultLocale: 'de'
// Target: locale: 'es'

const locale = resolveTemplateLocale({
  targetLocale: 'es',
  template: templateWithDefaultDe,
  userLanguage: 'en'
})
// Result: 'es' (Target überschreibt Template Default)
```

### Beispiel 4: Email Locale (höchste Priorität)

```typescript
// Email Content: locale: 'de'
// Target: locale: 'es'
// Template: defaultLocale: 'en'

const locale = resolveTemplateLocale({
  emailLocale: 'de',
  targetLocale: 'es',
  template: templateWithDefaultEn
})
// Result: 'de' (Email-Level hat höchste Priorität)
```
