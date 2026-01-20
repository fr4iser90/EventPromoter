# Plan: Panel Target Management Erweiterung

## Ziel
Erweiterung des Panel-Systems für generisches Target-Management mit Custom Fields für Personalisierung.

## Übersicht
- **Was:** Targets (Email-Empfänger, Reddit-Subreddits, LinkedIn-User, etc.) mit zusätzlichen Feldern verwalten
- **Wo:** Panel-Schema + Backend Services + Frontend Components
- **Warum:** Personalisierung ermöglichen (Name, Geburtstag, Tags, etc.)

---

## Phase 1: Backend - Type Definitions

### 1.1 Target Schema Interface
**Datei:** `backend/src/types/platformSchema.ts`

```typescript
/**
 * Target Schema Definition
 * Defines the structure for platform targets (recipients, subreddits, users, etc.)
 */
export interface TargetSchema {
  /** Base field name (e.g., 'email', 'subreddit', 'username') */
  baseField: string
  /** Base field label */
  baseFieldLabel: string
  /** Base field validation rules */
  baseFieldValidation?: ValidationRule[]
  /** Additional custom fields for personalization */
  customFields?: FieldDefinition[]
  /** Whether targets can be grouped */
  supportsGroups?: boolean
}

/**
 * Target Object Structure
 */
export interface Target {
  /** Unique target identifier */
  id: string
  /** Base field value (email, subreddit, etc.) */
  [baseField: string]: any
  /** Custom fields (name, birthday, tags, etc.) */
  [key: string]: any
  /** Metadata (optional additional data) */
  metadata?: Record<string, any>
  /** Timestamps */
  createdAt?: string
  updatedAt?: string
}
```

**Tasks:**
- [ ] `TargetSchema` Interface hinzufügen
- [ ] `Target` Interface hinzufügen
- [ ] `PanelSchema` um `targetSchema?: TargetSchema` erweitern

---

### 1.2 Base Target Service
**Datei:** `backend/src/services/targetService.ts` (NEU)

**Struktur:**
```typescript
export abstract class BaseTargetService {
  protected platformId: string
  protected targetSchema: TargetSchema
  
  // Abstract methods (platform-specific)
  abstract getBaseField(): string
  abstract validateBaseField(value: string): boolean
  
  // Generic methods (work for all platforms)
  async getTargets(): Promise<Target[]>
  async getTarget(targetId: string): Promise<Target | null>
  async addTarget(targetData: Record<string, any>): Promise<{ success: boolean; target?: Target; error?: string }>
  async updateTarget(targetId: string, targetData: Record<string, any>): Promise<{ success: boolean; error?: string }>
  async deleteTarget(targetId: string): Promise<{ success: boolean; error?: string }>
  
  // Group management
  async getGroups(): Promise<Record<string, string[]>>
  async createGroup(groupName: string, targetIds: string[]): Promise<{ success: boolean; error?: string }>
  async updateGroup(groupName: string, targetIds: string[]): Promise<{ success: boolean; error?: string }>
  async deleteGroup(groupName: string): Promise<{ success: boolean; error?: string }>
  
  // Helper methods
  protected validateCustomFields(data: Record<string, any>): ValidationResult
  protected extractCustomFields(data: Record<string, any>): Record<string, any>
  protected generateTargetId(): string
}
```

**Tasks:**
- [ ] `BaseTargetService` abstract class erstellen
- [ ] Generic CRUD-Methoden implementieren
- [ ] Group-Management-Methoden implementieren
- [ ] Validierung gegen `targetSchema` implementieren
- [ ] Migration von alten Datenstrukturen (Strings → Objects)

---

### 1.3 Platform-spezifische Target Services

#### Email Target Service
**Datei:** `backend/src/platforms/email/services/targetService.ts` (NEU)

```typescript
import { BaseTargetService } from '../../../../services/targetService.js'
import { TargetSchema } from '../../../../types/platformSchema.js'

export class EmailTargetService extends BaseTargetService {
  constructor() {
    super()
    this.platformId = 'email'
    // Load targetSchema from email panel schema
    this.targetSchema = {
      baseField: 'email',
      baseFieldLabel: 'Email-Adresse',
      baseFieldValidation: [
        { type: 'required', message: 'Email is required' },
        { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Invalid email' }
      ],
      customFields: [
        { name: 'name', type: 'text', label: 'Name' },
        { name: 'birthday', type: 'date', label: 'Geburtstag' },
        { name: 'tags', type: 'multiselect', label: 'Tags' },
        { name: 'company', type: 'text', label: 'Firma' },
        { name: 'phone', type: 'text', label: 'Telefon' }
      ],
      supportsGroups: true
    }
  }
  
  getBaseField(): string {
    return 'email'
  }
  
  validateBaseField(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}
```

**Tasks:**
- [ ] `EmailTargetService` erstellen
- [ ] `targetSchema` aus Panel-Schema laden
- [ ] Email-spezifische Validierung implementieren
- [ ] Migration von `recipients.json` (Strings → Objects)

#### Reddit Target Service
**Datei:** `backend/src/platforms/reddit/services/targetService.ts` (NEU)

```typescript
export class RedditTargetService extends BaseTargetService {
  constructor() {
    super()
    this.platformId = 'reddit'
    this.targetSchema = {
      baseField: 'subreddit',
      baseFieldLabel: 'Subreddit Name',
      baseFieldValidation: [
        { type: 'pattern', value: '^[a-z0-9_]{3,21}$', message: 'Invalid subreddit name' }
      ],
      customFields: [
        { name: 'description', type: 'textarea', label: 'Beschreibung' },
        { name: 'tags', type: 'multiselect', label: 'Tags' },
        { name: 'active', type: 'switch', label: 'Aktiv' }
      ],
      supportsGroups: true
    }
  }
  
  getBaseField(): string {
    return 'subreddit'
  }
  
  validateBaseField(subreddit: string): boolean {
    return /^[a-z0-9_]{3,21}$/.test(subreddit.toLowerCase())
  }
}
```

**Tasks:**
- [ ] `RedditTargetService` erstellen
- [ ] `targetSchema` aus Panel-Schema laden
- [ ] Subreddit-spezifische Validierung implementieren
- [ ] Migration von `subreddits.json` (Strings → Objects)

---

### 1.4 Panel Schema Erweiterung

#### Email Panel Schema
**Datei:** `backend/src/platforms/email/schema/panel.ts`

**Änderungen:**
- [ ] `targetSchema` hinzufügen
- [ ] Section `target-list` mit `target-list` field type
- [ ] Section `add-target` mit allen Custom Fields
- [ ] Section `edit-target` für Bearbeitung
- [ ] Section `group-management` aktualisieren (IDs statt Strings)

**Tasks:**
- [ ] `targetSchema` definieren
- [ ] `target-list` field type in `target-list` section
- [ ] `add-target` section mit Base Field + Custom Fields
- [ ] `edit-target` section mit Target-Auswahl + Edit-Form
- [ ] `group-management` auf Target-IDs umstellen

#### Reddit Panel Schema
**Datei:** `backend/src/platforms/reddit/schema/panel.ts`

**Tasks:**
- [ ] `targetSchema` definieren
- [ ] Sections analog zu Email anpassen
- [ ] Subreddit-spezifische Custom Fields

---

### 1.5 API Routes & Controllers

#### Generische Target Routes
**Datei:** `backend/src/routes/targets.ts` (NEU)

```typescript
// Generic target routes that work for all platforms
router.get('/platforms/:platformId/targets', TargetController.getTargets)
router.post('/platforms/:platformId/targets', TargetController.addTarget)
router.get('/platforms/:platformId/targets/:targetId', TargetController.getTarget)
router.put('/platforms/:platformId/targets/:targetId', TargetController.updateTarget)
router.delete('/platforms/:platformId/targets/:targetId', TargetController.deleteTarget)

// Group routes
router.get('/platforms/:platformId/target-groups', TargetController.getGroups)
router.post('/platforms/:platformId/target-groups', TargetController.createGroup)
router.put('/platforms/:platformId/target-groups/:groupId', TargetController.updateGroup)
router.delete('/platforms/:platformId/target-groups/:groupId', TargetController.deleteGroup)
```

**Tasks:**
- [ ] `TargetController` erstellen
- [ ] Generic Routes definieren
- [ ] Platform-spezifische Services dynamisch laden
- [ ] Response-Format standardisieren

#### Target Controller
**Datei:** `backend/src/controllers/targetController.ts` (NEU)

```typescript
export class TargetController {
  static async getTargets(req: Request, res: Response)
  static async getTarget(req: Request, res: Response)
  static async addTarget(req: Request, res: Response)
  static async updateTarget(req: Request, res: Response)
  static async deleteTarget(req: Request, res: Response)
  
  static async getGroups(req: Request, res: Response)
  static async createGroup(req: Request, res: Response)
  static async updateGroup(req: Request, res: Response)
  static async deleteGroup(req: Request, res: Response)
  
  // Helper: Get platform-specific target service
  private static async getTargetService(platformId: string): Promise<BaseTargetService>
}
```

**Tasks:**
- [ ] Controller-Methoden implementieren
- [ ] Platform-Service-Discovery
- [ ] Error Handling
- [ ] Response-Formatierung (targets + options für multiselect)

---

### 1.6 Datenstruktur Migration

**Datei:** `backend/src/services/targetMigration.ts` (NEU)

**Tasks:**
- [ ] Migration-Script für Email (Strings → Objects)
- [ ] Migration-Script für Reddit (Strings → Objects)
- [ ] Backward Compatibility (beide Formate lesen)
- [ ] Migration beim ersten Zugriff

---

## Phase 2: Frontend - Components

### 2.1 Target List Renderer
**Datei:** `frontend/src/features/schema/components/TargetListRenderer.jsx` (NEU)

**Features:**
- Tabelle/Liste mit konfigurierbaren Spalten
- Edit-Button öffnet Edit-Form
- Delete-Button mit Bestätigung
- Sortierbar
- Filterbar (nach Tags, etc.)
- Bulk-Actions (mehrere löschen)

**Tasks:**
- [ ] `TargetListRenderer` Component erstellen
- [ ] Tabelle mit `displayFields` rendern
- [ ] Edit-Funktionalität
- [ ] Delete-Funktionalität
- [ ] Sortierung implementieren
- [ ] Filterung implementieren
- [ ] Bulk-Actions

---

### 2.2 Schema Renderer Erweiterung
**Datei:** `frontend/src/features/schema/components/Renderer.jsx`

**Tasks:**
- [ ] `target-list` field type in SchemaRenderer hinzufügen
- [ ] `TargetListRenderer` importieren und verwenden
- [ ] Edit-Modal für Targets
- [ ] Delete-Confirmation Dialog

---

### 2.3 Panel Component Updates
**Datei:** `frontend/src/features/platform/components/Panel.jsx`

**Tasks:**
- [ ] `targetSchema` aus Panel-Schema lesen
- [ ] Custom Fields in Add/Edit-Forms rendern
- [ ] Target-List anzeigen
- [ ] Group-Management mit Target-IDs

---

## Phase 3: Testing & Migration

### 3.1 Unit Tests
**Tasks:**
- [ ] `BaseTargetService` Tests
- [ ] `EmailTargetService` Tests
- [ ] `RedditTargetService` Tests
- [ ] `TargetController` Tests
- [ ] Migration-Script Tests

---

### 3.2 Integration Tests
**Tasks:**
- [ ] API Endpoints testen
- [ ] Frontend Components testen
- [ ] End-to-End Flows testen

---

### 3.3 Migration
**Tasks:**
- [ ] Bestehende Daten migrieren
- [ ] Backward Compatibility testen
- [ ] Performance testen

---

## Implementierungsreihenfolge

1. **Backend Types** (Phase 1.1)
2. **Base Target Service** (Phase 1.2)
3. **Platform Services** (Phase 1.3)
4. **Panel Schema Erweiterung** (Phase 1.4)
5. **API Routes & Controller** (Phase 1.5)
6. **Frontend Target List Renderer** (Phase 2.1)
7. **Schema Renderer Erweiterung** (Phase 2.2)
8. **Panel Component Updates** (Phase 2.3)
9. **Migration** (Phase 1.6, 3.3)
10. **Testing** (Phase 3)

---

## Offene Fragen / Entscheidungen

- [ ] Wo wird `targetSchema` gespeichert? (Panel-Schema oder separate Datei?)
- [ ] Wie werden Custom Fields validiert? (Schema-basiert?)
- [ ] Sollen alte Daten automatisch migriert werden oder manuell?
- [ ] Wie werden Target-IDs generiert? (UUID, Timestamp, etc.)
- [ ] Sollen Targets in Datenbank oder JSON-Dateien gespeichert werden?

---

## Erfolgskriterien

- ✅ Targets haben Custom Fields (Name, Geburtstag, etc.)
- ✅ Targets können bearbeitet werden
- ✅ Gruppen verwenden Target-IDs statt Strings
- ✅ Gleiche Struktur für alle Platforms
- [ ] Backward Compatibility gewährleistet
- [ ] Migration funktioniert
- [ ] Frontend zeigt Targets mit Custom Fields
- [ ] Personalisierung in Templates möglich
