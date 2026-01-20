# Plan: Config/Settings Erweiterung

## Ziel
Erweiterung des Settings-Systems für bessere Konfiguration und Verwaltung von Platform-Einstellungen.

## Übersicht
- **Was:** Settings-Schema erweitern, bessere Validierung, Gruppierung, Environment-Variable-Integration
- **Wo:** Settings-Schema + Config-Service + Frontend SettingsModal
- **Warum:** Konsistente Konfiguration, bessere UX, Environment-Variable-Support

---

## Phase 1: Backend - Settings Schema Erweiterung

### 1.1 Settings Schema Interface Erweiterung
**Datei:** `backend/src/types/platformSchema.ts`

**Aktuelle Struktur:**
```typescript
interface SettingsSchema {
  version: string
  title: string
  fields: FieldDefinition[]
  groups?: FieldGroup[]
}
```

**Erweiterungen:**
```typescript
interface SettingsSchema {
  version: string
  title: string
  description?: string
  fields: FieldDefinition[]
  groups?: FieldGroup[]
  
  // ✅ NEW: Environment Variable Mapping
  envMapping?: {
    /** Map field names to environment variable names */
    [fieldName: string]: string | {
      envVar: string
      required?: boolean
      default?: string
      transform?: (value: string) => any
    }
  }
  
  // ✅ NEW: Settings Categories
  categories?: Array<{
    id: string
    label: string
    description?: string
    fields: string[] // Field names in this category
    icon?: string
    order?: number
  }>
  
  // ✅ NEW: Settings Validation
  validate?: (settings: Record<string, any>) => {
    isValid: boolean
    errors: Record<string, string[]>
  }
  
  // ✅ NEW: Settings Transformation
  transform?: {
    /** Transform settings before saving */
    beforeSave?: (settings: Record<string, any>) => Record<string, any>
    /** Transform settings after loading */
    afterLoad?: (settings: Record<string, any>) => Record<string, any>
  }
  
  // ✅ NEW: Settings Dependencies
  dependencies?: Array<{
    field: string
    dependsOn: string
    condition: 'equals' | 'notEquals' | 'exists' | 'notExists'
    value?: any
  }>
}
```

**Tasks:**
- [ ] `envMapping` Interface hinzufügen
- [ ] `categories` Interface hinzufügen
- [ ] `validate` Function-Type hinzufügen
- [ ] `transform` Interface hinzufügen
- [ ] `dependencies` Interface hinzufügen

---

### 1.2 Field Definition Erweiterung
**Datei:** `backend/src/types/platformSchema.ts`

**Aktuelle Struktur:**
```typescript
interface FieldDefinition {
  name: string
  type: FieldType
  label: string
  required?: boolean
  validation?: ValidationRule[]
  ui?: FieldUI
}
```

**Erweiterungen:**
```typescript
interface FieldDefinition {
  name: string
  type: FieldType
  label: string
  description?: string
  required?: boolean
  default?: any
  placeholder?: string
  validation?: ValidationRule[]
  ui?: FieldUI
  
  // ✅ NEW: Environment Variable Support
  envVar?: string | {
    name: string
    required?: boolean
    default?: string
    transform?: (value: string) => any
  }
  
  // ✅ NEW: Conditional Visibility
  visibleWhen?: {
    field: string
    operator: 'equals' | 'notEquals' | 'exists' | 'notExists'
    value?: any
  }
  
  // ✅ NEW: Field Dependencies
  dependsOn?: string[]
  
  // ✅ NEW: Field Help/Examples
  help?: string
  examples?: string[]
  
  // ✅ NEW: Field Encryption
  encrypted?: boolean // For passwords, API keys, etc.
  
  // ✅ NEW: Field Masking
  mask?: boolean // Mask value in UI (for sensitive data)
  
  // ✅ NEW: Field Autocomplete
  autocomplete?: {
    source: 'api' | 'static'
    endpoint?: string
    options?: Array<{ label: string; value: any }>
  }
}
```

**Tasks:**
- [ ] `envVar` Property hinzufügen
- [ ] `visibleWhen` Property hinzufügen
- [ ] `dependsOn` Property hinzufügen
- [ ] `help` und `examples` Properties hinzufügen
- [ ] `encrypted` und `mask` Properties hinzufügen
- [ ] `autocomplete` Property hinzufügen

---

### 1.3 Config Service Erweiterung
**Datei:** `backend/src/services/configService.ts`

**Neue Methoden:**
```typescript
export class ConfigService {
  // ✅ NEW: Load settings with environment variable resolution
  static async loadPlatformSettings(platform: string): Promise<Record<string, any>>
  
  // ✅ NEW: Save settings with validation
  static async savePlatformSettings(platform: string, settings: Record<string, any>): Promise<{ success: boolean; error?: string }>
  
  // ✅ NEW: Validate settings against schema
  static validateSettings(platform: string, settings: Record<string, any>): ValidationResult
  
  // ✅ NEW: Get environment variable mapping for platform
  static getEnvVarMapping(platform: string): Record<string, string>
  
  // ✅ NEW: Resolve settings from environment variables
  static resolveSettingsFromEnv(platform: string, settings: Record<string, any>): Record<string, any>
  
  // ✅ NEW: Encrypt sensitive fields
  static encryptSettings(platform: string, settings: Record<string, any>): Record<string, any>
  
  // ✅ NEW: Decrypt sensitive fields
  static decryptSettings(platform: string, settings: Record<string, any>): Record<string, any>
}
```

**Tasks:**
- [ ] `loadPlatformSettings` implementieren (mit Env-Var-Resolution)
- [ ] `savePlatformSettings` implementieren (mit Validierung)
- [ ] `validateSettings` implementieren
- [ ] `getEnvVarMapping` implementieren
- [ ] `resolveSettingsFromEnv` implementieren
- [ ] `encryptSettings` implementieren (für Passwords, API Keys)
- [ ] `decryptSettings` implementieren

---

### 1.4 Settings Schema Updates (Platform-spezifisch)

#### Email Settings Schema
**Datei:** `backend/src/platforms/email/schema/settings.ts`

**Erweiterungen:**
```typescript
export const emailSettingsSchema: SettingsSchema = {
  version: '1.0.0',
  title: 'Email Platform Settings',
  description: 'Configure SMTP settings for email platform',
  
  // ✅ NEW: Environment Variable Mapping
  envMapping: {
    host: 'EMAIL_SMTP_HOST',
    port: { envVar: 'EMAIL_SMTP_PORT', default: '587', transform: Number },
    username: 'EMAIL_SMTP_USERNAME',
    password: { envVar: 'EMAIL_SMTP_PASSWORD', required: true },
    fromEmail: 'EMAIL_FROM_EMAIL',
    fromName: 'EMAIL_FROM_NAME'
  },
  
  // ✅ NEW: Categories
  categories: [
    {
      id: 'smtp',
      label: 'SMTP Configuration',
      description: 'Configure your SMTP server settings',
      fields: ['host', 'port', 'username', 'password'],
      icon: 'server',
      order: 1
    },
    {
      id: 'sender',
      label: 'Sender Information',
      description: 'Configure sender email and name',
      fields: ['fromEmail', 'fromName'],
      icon: 'user',
      order: 2
    }
  ],
  
  fields: [
    {
      name: 'host',
      type: 'text',
      label: 'SMTP Host',
      envVar: 'EMAIL_SMTP_HOST',
      required: true,
      placeholder: 'smtp.gmail.com',
      help: 'The SMTP server hostname',
      examples: ['smtp.gmail.com', 'smtp.outlook.com'],
      validation: [...],
      ui: { width: 12, order: 1 }
    },
    {
      name: 'port',
      type: 'number',
      label: 'Port',
      envVar: { name: 'EMAIL_SMTP_PORT', default: '587', transform: Number },
      default: 587,
      required: true,
      help: 'SMTP server port (usually 587 for TLS, 465 for SSL)',
      validation: [...],
      ui: { width: 6, order: 2 }
    },
    {
      name: 'username',
      type: 'text',
      label: 'Username',
      envVar: 'EMAIL_SMTP_USERNAME',
      required: true,
      help: 'Your SMTP username (usually your email address)',
      validation: [...],
      ui: { width: 12, order: 3 }
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      envVar: { name: 'EMAIL_SMTP_PASSWORD', required: true },
      required: true,
      encrypted: true,
      mask: true,
      help: 'Your SMTP password or app-specific password',
      validation: [...],
      ui: { width: 12, order: 4 }
    },
    {
      name: 'useTLS',
      type: 'switch',
      label: 'Use TLS',
      default: true,
      help: 'Enable TLS encryption for SMTP connection',
      visibleWhen: {
        field: 'port',
        operator: 'equals',
        value: 587
      },
      ui: { width: 6, order: 5 }
    },
    {
      name: 'useSSL',
      type: 'switch',
      label: 'Use SSL',
      default: false,
      help: 'Enable SSL encryption for SMTP connection',
      visibleWhen: {
        field: 'port',
        operator: 'equals',
        value: 465
      },
      ui: { width: 6, order: 6 }
    },
    {
      name: 'fromEmail',
      type: 'text',
      label: 'From Email',
      envVar: 'EMAIL_FROM_EMAIL',
      required: true,
      help: 'Default sender email address',
      validation: [...],
      ui: { width: 12, order: 7 }
    },
    {
      name: 'fromName',
      type: 'text',
      label: 'From Name',
      envVar: 'EMAIL_FROM_NAME',
      required: false,
      placeholder: 'Your Name',
      help: 'Default sender name',
      ui: { width: 12, order: 8 }
    }
  ],
  
  groups: [
    {
      id: 'smtp',
      title: 'SMTP Configuration',
      fields: ['host', 'port', 'username', 'password', 'useTLS', 'useSSL'],
      collapsible: false
    },
    {
      id: 'sender',
      title: 'Sender Information',
      fields: ['fromEmail', 'fromName'],
      collapsible: false
    }
  ],
  
  // ✅ NEW: Validation
  validate: (settings) => {
    const errors: Record<string, string[]> = {}
    
    // Port must match encryption method
    if (settings.port === 587 && settings.useSSL) {
      errors.port = ['Port 587 requires TLS, not SSL']
    }
    if (settings.port === 465 && settings.useTLS) {
      errors.port = ['Port 465 requires SSL, not TLS']
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },
  
  // ✅ NEW: Transformation
  transform: {
    beforeSave: (settings) => {
      // Encrypt password before saving
      if (settings.password) {
        settings.password = encrypt(settings.password)
      }
      return settings
    },
    afterLoad: (settings) => {
      // Don't decrypt password (only for display)
      // Password will be masked in UI
      return settings
    }
  }
}
```

**Tasks:**
- [ ] `envMapping` hinzufügen
- [ ] `categories` hinzufügen
- [ ] Fields um `envVar`, `help`, `examples` erweitern
- [ ] Conditional Fields (`visibleWhen`) hinzufügen
- [ ] `validate` Funktion implementieren
- [ ] `transform` Funktionen implementieren

#### Reddit Settings Schema
**Datei:** `backend/src/platforms/reddit/schema/settings.ts`

**Tasks:**
- [ ] Analog zu Email erweitern
- [ ] Reddit-spezifische Env-Vars (`REDDIT_CLIENT_ID`, etc.)
- [ ] Reddit-spezifische Validierung

---

### 1.5 Settings Controller Erweiterung
**Datei:** `backend/src/controllers/platformController.ts`

**Neue Methoden:**
```typescript
export class PlatformController {
  // ✅ ENHANCED: Get settings with environment variable resolution
  static async getPlatformSettings(req: Request, res: Response)
  
  // ✅ ENHANCED: Update settings with validation and transformation
  static async updatePlatformSettings(req: Request, res: Response)
  
  // ✅ NEW: Validate settings without saving
  static async validateSettings(req: Request, res: Response)
  
  // ✅ NEW: Get environment variable mapping
  static async getEnvVarMapping(req: Request, res: Response)
  
  // ✅ NEW: Test settings (e.g., test SMTP connection)
  static async testSettings(req: Request, res: Response)
}
```

**Tasks:**
- [ ] `getPlatformSettings` erweitern (Env-Var-Resolution)
- [ ] `updatePlatformSettings` erweitern (Validierung, Transformation)
- [ ] `validateSettings` implementieren
- [ ] `getEnvVarMapping` implementieren
- [ ] `testSettings` implementieren (z.B. SMTP-Test)

---

## Phase 2: Frontend - Settings Modal Erweiterung

### 2.1 Settings Modal Erweiterung
**Datei:** `frontend/src/features/platform/components/SettingsModal.jsx`

**Neue Features:**
- Categories/Tabs für bessere Organisation
- Environment Variable Anzeige
- Field Help/Examples
- Conditional Field Visibility
- Settings Test-Button
- Better Validation Display

**Tasks:**
- [ ] Categories/Tabs rendern
- [ ] Environment Variable Info anzeigen
- [ ] Help-Tooltips für Fields
- [ ] Examples anzeigen
- [ ] Conditional Visibility implementieren
- [ ] Test-Button hinzufügen
- [ ] Better Error Display

---

### 2.2 Schema Renderer Erweiterung
**Datei:** `frontend/src/features/schema/components/Renderer.jsx`

**Neue Features:**
- Environment Variable Badge
- Help Tooltip
- Examples Display
- Conditional Field Rendering
- Encrypted Field Masking
- Autocomplete Support

**Tasks:**
- [ ] Env-Var-Badge anzeigen
- [ ] Help-Tooltip Component
- [ ] Examples anzeigen
- [ ] `visibleWhen` Logik implementieren
- [ ] Encrypted Fields maskieren
- [ ] Autocomplete implementieren

---

### 2.3 Settings Validation Component
**Datei:** `frontend/src/features/platform/components/SettingsValidation.jsx` (NEU)

**⚠️ WICHTIG: Validation-Logic bleibt im Backend!**

**Aktueller Stand:**
- **Backend**: Jede Platform definiert Validation-Regeln im Schema (`validation: [...]` Array in jedem Field)
- **Backend**: Optionale `validate` Funktion im `SettingsSchema` Interface für Form-level Validation
- **Backend**: `schemaValidator.ts` validiert nur die Schema-Struktur (nicht die Settings-Werte)
- **Backend**: `updatePlatformSettings` Endpoint validiert aktuell NICHT (TODO: "Here you would typically validate and save settings")
- **Frontend**: Validation-Logic ist aktuell im Frontend dupliziert (`validateField`, `validateSchema` in `Renderer.jsx`)

**Architektur-Entscheidung:**
1. **Validation-Regeln**: Werden von jeder Platform im Schema definiert (z.B. `email/schema/settings.ts`)
   - Jedes Field hat ein `validation: [...]` Array mit Regeln (required, min, max, pattern, etc.)
   - Optional: `validate` Funktion im `SettingsSchema` für Form-level Validation
2. **Validation-Logic**: Bleibt im Backend (neue Funktion in `backend/src/utils/settingsValidator.ts`)
   - Generische Funktion, die die Validation-Regeln aus dem Schema ausführt
   - Unterstützt alle Validation-Types: required, min, max, minLength, maxLength, pattern, url, custom
   - Ruft optional die `validate` Funktion aus dem Schema auf (Form-level)
3. **Backend-Endpoint**: `POST /api/platforms/:platformId/settings/validate` für Pre-Validation
   - Frontend kann vor dem Speichern validieren lassen
   - Gibt Validation-Errors zurück: `{ isValid: boolean, errors: { [fieldName]: string[] } }`
4. **Backend-Endpoint**: `PUT /api/platforms/:platformId/settings` validiert vor dem Speichern
   - Validiert automatisch vor dem Speichern
   - Gibt 400 Bad Request mit Errors zurück, wenn Validation fehlschlägt
5. **Frontend**: Kann optional client-side validieren (für UX), aber Backend ist finale Authority
   - Frontend kann die gleiche Validation-Logic haben (für schnelles Feedback)
   - Aber: Backend-Validation ist immer final und muss immer ausgeführt werden

**Features:**
- Real-time Validation (optional client-side für UX)
- Field-level Errors (vom Backend)
- Schema-level Errors (vom Backend)
- Validation Summary

**Beispiel: Wie jede Platform ihre Validation preisgibt**

```typescript
// backend/src/platforms/email/schema/settings.ts
export const emailSettingsSchema: SettingsSchema = {
  version: '1.0.0',
  title: 'Email Platform Settings',
  fields: [
    {
      name: 'host',
      type: 'text',
      label: 'SMTP Host',
      required: true,
      validation: [
        { type: 'required', message: 'SMTP host is required' },
        { type: 'pattern', value: '^[a-zA-Z0-9.-]+$', message: 'Invalid hostname format' }
      ]
    },
    {
      name: 'port',
      type: 'number',
      label: 'Port',
      required: true,
      validation: [
        { type: 'required', message: 'Port is required' },
        { type: 'min', value: 1, message: 'Port must be at least 1' },
        { type: 'max', value: 65535, message: 'Port must be at most 65535' }
      ]
    }
  ],
  // Optional: Form-level Validation
  validate: (data) => {
    const errors: Record<string, string[]> = {}
    // Custom cross-field validation
    if (data.port === 465 && !data.secure) {
      errors.secure = ['Port 465 requires secure connection']
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}
```

**Backend Validation-Logic (Beispiel-Implementierung):**

```typescript
// backend/src/utils/settingsValidator.ts (NEU)
export function validateSettingsValues(
  schema: SettingsSchema,
  values: Record<string, any>
): { isValid: boolean; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {}

  // Field-level Validation
  for (const field of schema.fields) {
    const value = values[field.name]
    const fieldErrors: string[] = []

    if (field.validation) {
      for (const rule of field.validation) {
        const error = validateFieldRule(field, value, rule)
        if (error) {
          fieldErrors.push(error)
        }
      }
    }

    if (fieldErrors.length > 0) {
      errors[field.name] = fieldErrors
    }
  }

  // Form-level Validation (optional)
  if (schema.validate) {
    const formValidation = schema.validate(values)
    if (!formValidation.isValid) {
      // Merge form-level errors
      for (const [field, fieldErrors] of Object.entries(formValidation.errors)) {
        if (errors[field]) {
          errors[field].push(...fieldErrors)
        } else {
          errors[field] = fieldErrors
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
```

**Tasks:**
- [ ] Backend: `validateSettingsValues()` Funktion erstellen (`backend/src/utils/settingsValidator.ts`)
- [ ] Backend: `validateFieldRule()` Helper-Funktion für einzelne Rules
- [ ] Backend: Validation-Endpoint `POST /api/platforms/:platformId/settings/validate`
- [ ] Backend: Validation in `updatePlatformSettings` integrieren
- [ ] Frontend: Validation Component erstellen (zeigt nur Backend-Errors)
- [ ] Frontend: Optional: Client-side Pre-Validation für UX (aber Backend ist final)
- [ ] Frontend: Error Display
- [ ] Frontend: Validation Summary

---

## Phase 3: Environment Variable Integration

### 3.1 Environment Variable Resolution
**Datei:** `backend/src/services/configService.ts`

**Tasks:**
- [ ] Env-Var-Resolution implementieren
- [ ] Default Values unterstützen
- [ ] Transform Functions (z.B. String → Number)
- [ ] Required Env-Vars validieren

---

### 3.2 Environment Variable Documentation
**Datei:** `backend/src/platforms/{platform}/schema/settings.ts`

**Tasks:**
- [ ] Env-Var-Mapping dokumentieren
- [ ] Required vs Optional markieren
- [ ] Default Values dokumentieren

---

## Phase 4: Settings Testing & Validation

### 4.1 Settings Test Endpoints
**Datei:** `backend/src/controllers/platformController.ts`

**Tasks:**
- [ ] SMTP Connection Test (Email)
- [ ] API Credentials Test (Reddit, Twitter, etc.)
- [ ] Generic Test Framework

---

### 4.2 Settings Validation
**Tasks:**
- [ ] Schema-basierte Validierung
- [ ] Custom Validation Functions
- [ ] Cross-field Validation
- [ ] Dependency Validation

---

## Implementierungsreihenfolge

1. **Backend Types** (Phase 1.1, 1.2)
2. **Config Service Erweiterung** (Phase 1.3)
3. **Settings Schema Updates** (Phase 1.4)
4. **Settings Controller** (Phase 1.5)
5. **Frontend Settings Modal** (Phase 2.1)
6. **Schema Renderer** (Phase 2.2)
7. **Environment Variable Integration** (Phase 3)
8. **Settings Testing** (Phase 4)

---

## Offene Fragen / Entscheidungen

- [ ] Wie werden Passwords verschlüsselt? (AES, bcrypt, etc.)
- [ ] Sollen Env-Vars Settings überschreiben oder nur als Default?
- [ ] Wie werden Settings getestet? (Test-Button im Modal?)
- [ ] Sollen Settings in Datenbank oder JSON-Dateien gespeichert werden?
- [ ] Wie werden Settings-Versionen gehandhabt? (Migration bei Schema-Update?)

---

## Erfolgskriterien

- ✅ Settings haben Environment Variable Support
- ✅ Settings können kategorisiert werden
- ✅ Conditional Fields funktionieren
- ✅ Settings werden validiert
- ✅ Sensitive Fields werden verschlüsselt
- ✅ Settings können getestet werden
- ✅ Help/Examples werden angezeigt
- ✅ Better UX im Settings Modal
