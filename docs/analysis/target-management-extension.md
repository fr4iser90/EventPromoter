# Target Management Erweiterung - Analyse & Vorschlag

## Aktuelle Situation

### Email Targets (aktuell)
```json
{
  "available": [
    "dj-events@club.com",
    "pa.boe90@gmail.com"
  ],
  "groups": {
    "DJs & Promoter": ["dj-events@club.com", "pa.boe90@gmail.com"]
  }
}
```
**Problem:** Nur Email-Strings, keine zusätzlichen Infos (Name, Geburtstag, etc.)

### Reddit Targets (aktuell)
```json
{
  "available": ["electronicmusic", "techno", "house"],
  "groups": {
    "Music Events": ["electronicmusic", "techno"]
  }
}
```
**Problem:** Nur Subreddit-Strings, keine zusätzlichen Infos

---

## Vorschlag: Generisches Target-Management

### 1. Target Schema Definition (in Platform Schema)

Jede Platform definiert ihre Target-Struktur im Schema:

```typescript
// In schema/panel.ts oder schema/targets.ts
interface TargetSchema {
  /** Base field name (e.g., 'email', 'subreddit', 'username') */
  baseField: string
  /** Base field label */
  baseFieldLabel: string
  /** Base field validation */
  baseFieldValidation?: ValidationRule[]
  /** Additional custom fields for personalization */
  customFields?: FieldDefinition[]
  /** Whether targets can be grouped */
  supportsGroups?: boolean
}
```

### 2. Erweiterte Target-Struktur

**Email Beispiel:**
```json
{
  "available": [
    {
      "id": "email-1",
      "email": "dj-events@club.com",
      "name": "DJ Events",
      "birthday": "1990-05-15",
      "tags": ["vip", "promoter"],
      "metadata": {
        "company": "Club Events GmbH",
        "phone": "+49 123 456789"
      }
    },
    {
      "id": "email-2",
      "email": "pa.boe90@gmail.com",
      "name": "Paul Böhm",
      "birthday": "1990-08-20",
      "tags": ["dj", "producer"]
    }
  ],
  "groups": {
    "DJs & Promoter": ["email-1", "email-2"]
  }
}
```

**Reddit Beispiel:**
```json
{
  "available": [
    {
      "id": "subreddit-1",
      "subreddit": "electronicmusic",
      "description": "Electronic music community",
      "tags": ["music", "electronic"],
      "metadata": {
        "members": 500000,
        "active": true
      }
    }
  ],
  "groups": {
    "Music Events": ["subreddit-1"]
  }
}
```

**LinkedIn Beispiel:**
```json
{
  "available": [
    {
      "id": "user-1",
      "username": "john-doe",
      "name": "John Doe",
      "company": "Event Agency",
      "tags": ["promoter", "manager"],
      "metadata": {
        "linkedinUrl": "https://linkedin.com/in/john-doe",
        "connectionLevel": 2
      }
    }
  ],
  "groups": {
    "Event Managers": ["user-1"]
  }
}
```

---

## Panel Schema Erweiterung

### Email Panel (mit Custom Fields)

```typescript
export const emailPanelSchema: PanelSchema = {
  version: '1.0.0',
  title: 'Email Recipients',
  description: 'Manage email recipients with personalization data',
  
  // ✅ NEW: Target Schema Definition
  targetSchema: {
    baseField: 'email',
    baseFieldLabel: 'Email-Adresse',
    baseFieldValidation: [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Invalid email' }
    ],
    customFields: [
      {
        name: 'name',
        type: 'text',
        label: 'Name',
        required: false,
        description: 'Name für Personalisierung',
        ui: { width: 12, order: 2 }
      },
      {
        name: 'birthday',
        type: 'date',
        label: 'Geburtstag',
        required: false,
        description: 'Für personalisierte Geburtstags-Emails',
        ui: { width: 6, order: 3 }
      },
      {
        name: 'tags',
        type: 'multiselect',
        label: 'Tags',
        required: false,
        description: 'Tags für Segmentierung',
        options: [
          { label: 'VIP', value: 'vip' },
          { label: 'Promoter', value: 'promoter' },
          { label: 'DJ', value: 'dj' },
          { label: 'Venue Manager', value: 'venue-manager' }
        ],
        ui: { width: 12, order: 4 }
      },
      {
        name: 'company',
        type: 'text',
        label: 'Firma',
        required: false,
        ui: { width: 6, order: 5 }
      },
      {
        name: 'phone',
        type: 'text',
        label: 'Telefon',
        required: false,
        ui: { width: 6, order: 6 }
      }
    ],
    supportsGroups: true
  },
  
  tabs: [
    {
      id: 'targets',
      label: 'Empfänger',
      sections: ['target-list', 'add-target', 'edit-target']
    },
    {
      id: 'groups',
      label: 'Gruppen',
      sections: ['group-management']
    }
  ],
  
  sections: [
    {
      id: 'target-list',
      title: 'Email-Empfänger',
      description: 'Verwaltung der Email-Empfänger mit Personalisierungsdaten',
      fields: [
        {
          name: 'targets',
          type: 'target-list', // ✅ NEW: Special field type for target management
          label: 'Empfänger',
          description: 'Liste aller Empfänger mit Bearbeitungsmöglichkeit',
          // ✅ NEW: Target list configuration
          targetConfig: {
            displayFields: ['email', 'name', 'tags'], // Which fields to show in list
            editable: true, // Can edit targets
            deletable: true, // Can delete targets
            sortable: true, // Can sort targets
            filterable: true, // Can filter targets
            // Custom actions per target
            actions: [
              {
                label: 'Bearbeiten',
                endpoint: 'platforms/:platformId/targets/:targetId',
                method: 'PUT'
              },
              {
                label: 'Löschen',
                endpoint: 'platforms/:platformId/targets/:targetId',
                method: 'DELETE',
                confirm: true
              }
            ]
          },
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'targets' // Backend returns { success: true, targets: [...] }
          },
          ui: {
            width: 12,
            order: 1
          }
        }
      ]
    },
    {
      id: 'add-target',
      title: 'Neuen Empfänger hinzufügen',
      description: 'Füge einen neuen Email-Empfänger mit optionalen Personalisierungsdaten hinzu',
      fields: [
        // Base field (email) - required
        {
          name: 'email',
          type: 'text',
          label: 'Email-Adresse',
          required: true,
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Invalid email' }
          ],
          ui: { width: 12, order: 1 }
        },
        // Custom fields from targetSchema
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: false,
          ui: { width: 6, order: 2 }
        },
        {
          name: 'birthday',
          type: 'date',
          label: 'Geburtstag',
          required: false,
          ui: { width: 6, order: 3 }
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags',
          required: false,
          options: [
            { label: 'VIP', value: 'vip' },
            { label: 'Promoter', value: 'promoter' },
            { label: 'DJ', value: 'dj' }
          ],
          ui: { width: 12, order: 4 }
        },
        {
          name: 'company',
          type: 'text',
          label: 'Firma',
          required: false,
          ui: { width: 6, order: 5 }
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Telefon',
          required: false,
          ui: { width: 6, order: 6 }
        },
        // Submit action
        {
          name: 'addTarget',
          type: 'button',
          label: 'Empfänger hinzufügen',
          action: {
            endpoint: 'platforms/:platformId/targets',
            method: 'POST',
            trigger: 'submit',
            bodyMapping: {
              email: 'email',
              name: 'name',
              birthday: 'birthday',
              tags: 'tags',
              company: 'company',
              phone: 'phone'
            },
            onSuccess: 'reload',
            reloadOptions: true
          },
          ui: { width: 12, order: 7 }
        }
      ]
    },
    {
      id: 'edit-target',
      title: 'Empfänger bearbeiten',
      description: 'Bearbeite einen bestehenden Empfänger',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Empfänger auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'targets',
            transform: 'custom', // Transform to { label: email, value: id }
            transformFn: (target) => ({ label: `${target.name || target.email} (${target.email})`, value: target.id })
          },
          action: {
            endpoint: 'platforms/:platformId/targets/:targetId',
            method: 'GET',
            trigger: 'change',
            onSuccess: 'load', // Load target data into form
            loadFields: ['name', 'birthday', 'tags', 'company', 'phone']
          },
          ui: { width: 12, order: 1 }
        },
        // Same fields as add-target, but populated from selected target
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: false,
          ui: { width: 6, order: 2 }
        },
        // ... other fields ...
        {
          name: 'updateTarget',
          type: 'button',
          label: 'Aktualisieren',
          action: {
            endpoint: 'platforms/:platformId/targets/:targetId',
            method: 'PUT',
            trigger: 'submit',
            bodyMapping: {
              email: 'email',
              name: 'name',
              // ... all fields
            },
            onSuccess: 'reload'
          },
          ui: { width: 12, order: 7 }
        }
      ]
    },
    {
      id: 'group-management',
      title: 'Email-Gruppen',
      description: 'Verwaltung von Email-Gruppen',
      fields: [
        // Same as before, but groups now reference target IDs
        {
          name: 'groupName',
          type: 'text',
          label: 'Gruppenname',
          ui: { width: 6, order: 1 }
        },
        {
          name: 'groupTargets',
          type: 'multiselect',
          label: 'Empfänger auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'targets',
            transform: 'custom',
            transformFn: (target) => ({ label: `${target.name || target.email} (${target.email})`, value: target.id })
          },
          ui: { width: 12, order: 2 }
        },
        {
          name: 'createGroup',
          type: 'button',
          label: 'Gruppe erstellen',
          action: {
            endpoint: 'platforms/:platformId/target-groups',
            method: 'POST',
            trigger: 'submit',
            bodyMapping: {
              groupName: 'groupName',
              targetIds: 'groupTargets'
            },
            onSuccess: 'reload'
          },
          ui: { width: 12, order: 3 }
        }
      ]
    }
  ]
}
```

---

## Reddit Panel (mit Custom Fields)

```typescript
export const redditPanelSchema: PanelSchema = {
  version: '1.0.0',
  title: 'Reddit Subreddits',
  
  targetSchema: {
    baseField: 'subreddit',
    baseFieldLabel: 'Subreddit Name',
    baseFieldValidation: [
      { type: 'pattern', value: '^[a-z0-9_]{3,21}$', message: 'Invalid subreddit name' }
    ],
    customFields: [
      {
        name: 'description',
        type: 'textarea',
        label: 'Beschreibung',
        required: false,
        ui: { width: 12, order: 2 }
      },
      {
        name: 'tags',
        type: 'multiselect',
        label: 'Tags',
        options: [
          { label: 'Music', value: 'music' },
          { label: 'Events', value: 'events' },
          { label: 'Local', value: 'local' }
        ],
        ui: { width: 12, order: 3 }
      },
      {
        name: 'active',
        type: 'switch',
        label: 'Aktiv',
        default: true,
        ui: { width: 12, order: 4 }
      }
    ],
    supportsGroups: true
  },
  
  // Sections ähnlich wie Email, aber mit subreddit-spezifischen Feldern
  sections: [
    {
      id: 'target-list',
      title: 'Subreddits',
      fields: [
        {
          name: 'targets',
          type: 'target-list',
          targetConfig: {
            displayFields: ['subreddit', 'description', 'tags'],
            editable: true,
            deletable: true
          },
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            responsePath: 'targets'
          }
        }
      ]
    },
    {
      id: 'add-target',
      title: 'Neues Subreddit hinzufügen',
      fields: [
        {
          name: 'subreddit',
          type: 'text',
          label: 'Subreddit Name',
          required: true,
          validation: [
            { type: 'pattern', value: '^[a-z0-9_]{3,21}$', message: 'Invalid subreddit' }
          ]
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung'
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags',
          options: [...]
        },
        {
          name: 'addTarget',
          type: 'button',
          label: 'Hinzufügen',
          action: {
            endpoint: 'platforms/:platformId/targets',
            method: 'POST',
            bodyMapping: {
              subreddit: 'subreddit',
              description: 'description',
              tags: 'tags'
            }
          }
        }
      ]
    }
  ]
}
```

---

## LinkedIn Panel (Beispiel)

```typescript
export const linkedinPanelSchema: PanelSchema = {
  version: '1.0.0',
  title: 'LinkedIn Connections',
  
  targetSchema: {
    baseField: 'username',
    baseFieldLabel: 'LinkedIn Username',
    customFields: [
      {
        name: 'name',
        type: 'text',
        label: 'Name'
      },
      {
        name: 'company',
        type: 'text',
        label: 'Firma'
      },
      {
        name: 'position',
        type: 'text',
        label: 'Position'
      },
      {
        name: 'connectionLevel',
        type: 'select',
        label: 'Connection Level',
        options: [
          { label: '1st', value: 1 },
          { label: '2nd', value: 2 },
          { label: '3rd', value: 3 }
        ]
      },
      {
        name: 'tags',
        type: 'multiselect',
        label: 'Tags',
        options: [
          { label: 'Event Manager', value: 'event-manager' },
          { label: 'Promoter', value: 'promoter' }
        ]
      }
    ],
    supportsGroups: true
  },
  
  sections: [
    // Similar structure to Email/Reddit
  ]
}
```

---

## Generische API Endpoints

### Standard Target Endpoints (für alle Platforms)

```
GET    /api/platforms/{platform}/targets              - Liste aller Targets
POST   /api/platforms/{platform}/targets              - Neues Target erstellen
GET    /api/platforms/{platform}/targets/{targetId}   - Einzelnes Target laden
PUT    /api/platforms/{platform}/targets/{targetId}   - Target aktualisieren
DELETE /api/platforms/{platform}/targets/{targetId}  - Target löschen

GET    /api/platforms/{platform}/target-groups       - Alle Gruppen
POST   /api/platforms/{platform}/target-groups       - Gruppe erstellen
PUT    /api/platforms/{platform}/target-groups/{groupId} - Gruppe aktualisieren
DELETE /api/platforms/{platform}/target-groups/{groupId} - Gruppe löschen
```

### Response Format

```typescript
// GET /api/platforms/{platform}/targets
{
  success: true,
  targets: [
    {
      id: "email-1",
      email: "dj-events@club.com",
      name: "DJ Events",
      birthday: "1990-05-15",
      tags: ["vip", "promoter"],
      metadata: {
        company: "Club Events GmbH",
        phone: "+49 123 456789"
      },
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z"
    }
  ],
  // For multiselect options
  options: [
    {
      label: "DJ Events (dj-events@club.com)",
      value: "email-1"
    }
  ]
}
```

---

## Backend Service Struktur

### Generischer Target Service (Base Class)

```typescript
abstract class BaseTargetService {
  protected platformId: string
  protected targetSchema: TargetSchema
  
  // Abstract methods (must be implemented by platform)
  abstract getBaseField(): string
  abstract validateBaseField(value: string): boolean
  
  // Generic methods (work for all platforms)
  async getTargets(): Promise<Target[]> {
    const data = await readPlatformData(this.platformId)
    return data?.targets || []
  }
  
  async addTarget(targetData: Record<string, any>): Promise<{ success: boolean; target?: Target }> {
    // Validate base field
    const baseValue = targetData[this.getBaseField()]
    if (!this.validateBaseField(baseValue)) {
      return { success: false, error: `Invalid ${this.getBaseField()}` }
    }
    
    // Validate custom fields against targetSchema
    const validation = this.validateCustomFields(targetData)
    if (!validation.isValid) {
      return { success: false, error: validation.errors }
    }
    
    // Create target object
    const target: Target = {
      id: `${this.platformId}-${Date.now()}`,
      [this.getBaseField()]: baseValue,
      ...this.extractCustomFields(targetData),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Save to platform data
    const data = await readPlatformData(this.platformId)
    const targets = data?.targets || []
    targets.push(target)
    
    await writePlatformData(this.platformId, {
      ...data,
      targets
    })
    
    return { success: true, target }
  }
  
  async updateTarget(targetId: string, targetData: Record<string, any>): Promise<{ success: boolean }> {
    // Similar logic
  }
  
  async deleteTarget(targetId: string): Promise<{ success: boolean }> {
    // Similar logic
  }
  
  // Helper methods
  protected validateCustomFields(data: Record<string, any>): ValidationResult {
    // Validate against targetSchema.customFields
  }
  
  protected extractCustomFields(data: Record<string, any>): Record<string, any> {
    // Extract only fields defined in targetSchema.customFields
  }
}
```

### Platform-spezifische Services

```typescript
// EmailTargetService extends BaseTargetService
class EmailTargetService extends BaseTargetService {
  getBaseField() { return 'email' }
  validateBaseField(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}

// RedditTargetService extends BaseTargetService
class RedditTargetService extends BaseTargetService {
  getBaseField() { return 'subreddit' }
  validateBaseField(subreddit: string) {
    return /^[a-z0-9_]{3,21}$/.test(subreddit)
  }
}
```

---

## Frontend: Target List Component

### Neuer Field Type: `target-list`

```typescript
// In SchemaRenderer
case 'target-list':
  return <TargetListRenderer
    field={field}
    value={values[field.name]}
    onChange={onChange}
    targetConfig={field.targetConfig}
    targetSchema={panelSchema.targetSchema}
  />
```

**TargetListRenderer Features:**
- ✅ Zeigt Targets als Tabelle/Liste
- ✅ Anzeige konfigurierbarer Felder (`displayFields`)
- ✅ Edit-Button öffnet Edit-Form
- ✅ Delete-Button mit Bestätigung
- ✅ Sortierbar
- ✅ Filterbar (nach Tags, etc.)
- ✅ Bulk-Actions (mehrere löschen, etc.)

---

## Datenstruktur Migration

### Alte Struktur (Strings)
```json
{
  "available": ["email1@example.com", "email2@example.com"],
  "groups": { "Group1": ["email1@example.com"] }
}
```

### Neue Struktur (Objects)
```json
{
  "targets": [
    {
      "id": "email-1",
      "email": "email1@example.com",
      "name": "John Doe",
      "birthday": "1990-05-15",
      "tags": ["vip"]
    }
  ],
  "groups": {
    "Group1": ["email-1"]
  }
}
```

**Migration:** Backend kann beide Formate unterstützen (Backward Compatibility)

---

## Zusammenfassung

### ✅ Was Panels sind:
- **Verwaltung/Management** von Platform-spezifischen Targets
- **Interaktive Features** (Hinzufügen, Bearbeiten, Löschen)
- **Gruppen-Management**
- **Custom Fields** für Personalisierung

### ✅ Einheitliche Struktur:
1. **Target Schema** definiert Base Field + Custom Fields
2. **Panel Sections** für List, Add, Edit, Groups
3. **Generische API Endpoints** (`/targets`, `/target-groups`)
4. **Base Service Class** für gemeinsame Logik
5. **Platform-spezifische Services** für Validierung

### ✅ Vorteile:
- **Generisch:** Gleiche Struktur für alle Platforms
- **Erweiterbar:** Jede Platform kann eigene Custom Fields definieren
- **Flexibel:** Personalisierung möglich (Name, Geburtstag, etc.)
- **Konsistent:** Gleiche UI/UX für alle Platforms

### 📋 Nächste Schritte:
1. `TargetSchema` Interface definieren
2. `PanelSchema` um `targetSchema` erweitern
3. Base `TargetService` implementieren
4. Platform-spezifische Services erstellen
5. Frontend `TargetListRenderer` Component
6. Migration von alten Datenstrukturen
