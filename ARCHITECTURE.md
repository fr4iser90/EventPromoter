# EventPromoter - System Architecture

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Core Architecture Principles](#core-architecture-principles)
3. [High-Level Architecture](#high-level-architecture)
4. [Platform System](#platform-system)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Data Flow](#data-flow)
8. [API Documentation](#api-documentation)
9. [Technology Stack](#technology-stack)
10. [Adding New Platforms](#adding-new-platforms)

---

## System Overview

### Vision

**EventPromoter** is a multi-platform social media publishing system that enables users to create, manage, and publish event content across multiple platforms (Twitter, Instagram, Facebook, LinkedIn, Reddit, Email) from a single interface.

### Core Concept

The system is built on a **Self-Discovering Platform Architecture** where:
- New platforms can be added by simply creating a directory structure
- The frontend automatically adapts to new platforms without code changes
- All platform-specific logic resides in the backend
- The frontend is a generic renderer driven by backend schemas

### Key Features

- **Schema-Driven UI**: Frontend renders UI dynamically based on backend schemas
- **Automatic Platform Discovery**: Platforms are discovered and registered at runtime
- **Unified Translation System**: Platform translations loaded from backend
- **Generic Frontend**: No hardcoded platform logic in frontend
- **Scalable Architecture**: Easy to add new platforms without touching core code

---

## Core Architecture Principles

### 1. Self-Discovering Platform Architecture

**Principle**: Platforms are automatically discovered by scanning the `backend/src/platforms/` directory. No manual registration required.

**Benefits**:
- **Scalability**: Add new platforms without modifying core code
- **Maintainability**: Each platform is isolated in its own directory
- **Genericity**: Frontend remains platform-agnostic

### 2. Schema-Driven UI

**Principle**: All UI structure and behavior is defined by schemas in the backend. Frontend components are generic renderers.

**Benefits**:
- **No Hardcoded Logic**: Frontend has zero platform-specific code
- **Backend Control**: Backend defines UI structure, validation, and behavior
- **Flexibility**: Easy to add new field types and UI patterns

### 3. Backend as Single Source of Truth

**Principle**: All platform-specific logic, configurations, translations, and schemas live in the backend.

**Benefits**:
- **Centralized Logic**: All platform knowledge in one place
- **Consistency**: Single source prevents inconsistencies
- **Security**: Sensitive logic stays on server

### 4. Generic Frontend Renderer

**Principle**: Frontend components are generic and reusable. They render based on data from the backend.

**Benefits**:
- **Code Reuse**: Same components for all platforms
- **Maintainability**: Changes to one component benefit all platforms
- **Testability**: Generic components are easier to test

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Generic       │  │ Schema       │  │ Platform     │        │
│  │ Components    │  │ Renderer     │  │ Selector     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                  │                  │                │
│         └──────────────────┼──────────────────┘                │
│                            │                                     │
│                    ┌───────▼────────┐                            │
│                    │  API Client   │                            │
│                    └───────┬────────┘                            │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────┼─────────────────────────────────────┐
│                    ┌───────▼────────┐                            │
│                    │  API Gateway   │                            │
│                    │   (Express)    │                            │
│                    └───────┬────────┘                            │
│                             │                                     │
│  ┌──────────────────────────┼──────────────────────────┐        │
│  │                  ┌────────▼────────┐                 │        │
│  │                  │ Platform       │                 │        │
│  │                  │ Registry       │                 │        │
│  │                  └────────┬────────┘                 │        │
│  │                           │                           │        │
│  │         ┌─────────────────┼─────────────────┐        │        │
│  │         │                 │                 │        │        │
│  │  ┌──────▼──────┐  ┌───────▼──────┐  ┌──────▼──────┐│        │
│  │  │  Platform   │  │  Platform    │  │  Platform   ││        │
│  │  │  Discovery  │  │  Services    │  │  Schemas    ││        │
│  │  └─────────────┘  └──────────────┘  └─────────────┘│        │
│  └─────────────────────────────────────────────────────┘        │
│                             │                                     │
│                    ┌───────▼────────┐                            │
│                    │  Platforms/    │                            │
│                    │  Directory     │                            │
│                    │  (Dynamic)     │                            │
│                    └────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction

1. **User selects platform** → Frontend requests platform schema
2. **Backend returns schema** → Frontend renders UI generically
3. **User creates content** → Frontend validates using schema rules
4. **Content submitted** → Backend processes and publishes

---

## Platform System

### Platform Structure

Each platform is a self-contained module in `backend/src/platforms/{platformId}/`:

```
backend/src/platforms/
├── _blueprint/              # Template for new platforms
│   ├── index.ts
│   ├── parser.ts
│   ├── schema.ts
│   ├── service.ts
│   └── validator.ts
│
├── email/                   # Example: Email platform
│   ├── index.ts            # PlatformModule export
│   ├── controller.ts        # Platform-specific controllers
│   ├── routes.ts            # Platform-specific routes
│   ├── service.ts           # Business logic
│   ├── parser.ts            # Content transformation
│   ├── validator.ts         # Content validation
│   ├── recipientService.ts  # Platform-specific service
│   ├── schema/              # UI Schemas
│   │   ├── index.ts
│   │   ├── settings.ts      # Settings form schema
│   │   ├── editor.ts        # Content editor schema
│   │   ├── preview.ts       # Preview schema
│   │   ├── panel.ts         # Feature panel schema
│   │   └── template.ts     # Template schema
│   ├── locales/             # Translations
│   │   ├── en.json
│   │   ├── de.json
│   │   └── es.json
│   ├── templates/           # Content templates
│   │   ├── index.ts
│   │   ├── event-announcement.ts
│   │   └── event-reminder.ts
│   └── types.ts             # Platform-specific types
│
├── twitter/                 # Twitter platform
├── instagram/               # Instagram platform
├── facebook/                # Facebook platform
├── linkedin/                # LinkedIn platform
└── reddit/                  # Reddit platform
```

### PlatformModule Interface

Every platform must export a `PlatformModule`:

```typescript
interface PlatformModule {
  metadata: PlatformMetadata      // Platform identification
  schema: PlatformSchema          // UI schemas
  capabilities: PlatformCapabilities  // Feature flags
  service: PlatformService        // Business logic
  parser: PlatformParser         // Content transformation
  validator: ContentValidator    // Validation rules
  templates?: ContentTemplates   // Optional templates
  routes?: PlatformRoutes[]      // Optional custom routes
}
```

### Platform Discovery Process

1. **Startup**: `PlatformRegistry` scans `backend/src/platforms/` directory
2. **Discovery**: Finds all directories (excluding `_blueprint` and those starting with `_`)
3. **Loading**: Dynamically imports `index.ts` from each platform directory
4. **Validation**: Validates `PlatformModule` structure and schemas
5. **Registration**: Registers valid platforms in the registry
6. **API Exposure**: Platforms become available via `/api/platforms` endpoints

### Schema System

Platforms define their UI through schemas:

#### Settings Schema
Defines the form structure for platform configuration:
- Field definitions (text, number, select, etc.)
- Validation rules
- Field groups and ordering
- Dynamic options (API-driven dropdowns)

#### Editor Schema
Defines the content editor structure:
- Content blocks (text, image, video, etc.)
- Block rendering configuration
- Constraints (character limits, required fields)
- Editor features (rich text, markdown, etc.)

#### Preview Schema
Defines how content should be previewed:
- Content mapping (which fields map to preview)
- Styling configuration
- Preview modes (desktop, mobile, etc.)

#### Panel Schema
Defines platform-specific feature panels:
- Panel sections
- Field definitions
- Actions (buttons, API calls)
- Dynamic options loading

#### Template Schema
Defines template structure:
- Available variables
- Template categories
- Default structure
- Validation rules

### Translation System

Each platform can provide translations in `locales/` directory:

```
platforms/{platformId}/locales/
├── en.json    # English translations
├── de.json    # German translations
└── es.json    # Spanish translations
```

**Loading Flow**:
1. Frontend requests translations: `GET /api/translations/{platformId}/{lang}`
2. Backend loads from `platforms/{platformId}/locales/{lang}.json`
3. Translations are cached for performance
4. Frontend merges into i18n system

---

## Frontend Architecture

### Responsibilities

The frontend is responsible for:
- ✅ **UI Rendering**: Generic components that render based on schemas
- ✅ **User Interaction**: Form inputs, buttons, navigation
- ✅ **State Management**: UI state, user preferences
- ✅ **API Communication**: Fetching schemas, translations, platform data
- ✅ **Content Preview**: Displaying content previews based on schemas

The frontend is **NOT** responsible for:
- ❌ Platform-specific business logic
- ❌ Content validation (uses schema rules)
- ❌ Platform configuration (handled by backend)
- ❌ Hardcoded platform names or logic

### Component Structure

```
frontend/src/
├── components/
│   ├── SchemaRenderer/          # Generic form field renderer
│   ├── SchemaSettingsPanel/     # Generic settings panel
│   ├── GenericPlatformEditor/   # Generic content editor
│   ├── PlatformPreview/         # Generic preview component
│   ├── PlatformSelector/        # Platform selection UI
│   ├── Panels/
│   │   └── DynamicPanelWrapper/ # Generic panel wrapper
│   └── ...
├── hooks/
│   ├── usePlatformSchema.js     # Load platform schemas
│   ├── usePlatformTranslations.js # Load platform translations
│   └── usePlatforms.js          # Load platform list
└── i18n/
    └── locales/                 # Frontend common translations
        ├── en.json
        ├── de.json
        └── es.json
```

### Key Components

#### SchemaRenderer
Generic form renderer that dynamically renders fields based on schema:

```jsx
<SchemaRenderer
  fields={schema.settings.fields}
  values={formValues}
  onChange={handleFieldChange}
  errors={validationErrors}
/>
```

**Features**:
- Supports all field types (text, number, select, textarea, etc.)
- Dynamic options loading (from API)
- Field actions (buttons, API calls)
- Validation based on schema rules
- Field grouping and ordering

#### GenericPlatformEditor
Generic content editor that renders based on `editor` schema:

```jsx
<GenericPlatformEditor
  platform={platformId}
  content={content}
  onChange={handleChange}
/>
```

**Features**:
- Renders editor blocks from schema
- Character counting
- Media upload support
- Real-time validation

#### DynamicPanelWrapper
Generic panel wrapper that renders platform feature panels:

```jsx
<DynamicPanelWrapper platform={platformId} />
```

**Features**:
- Loads panel schema from backend
- Renders sections dynamically
- Supports dynamic options
- Handles field actions

### State Management

Uses **Zustand** for global state:

```javascript
// Store structure
{
  selectedPlatforms: string[],
  platformContent: Record<string, any>,
  uploadedFileRefs: File[],
  selectedHashtags: string[],
  // ... other UI state
}
```

### Translation Loading

**Hybrid System**:
- **Frontend Common**: UI translations (buttons, labels, workflow) in `frontend/src/i18n/locales/`
- **Platform Translations**: Loaded dynamically from backend via `usePlatformTranslations` hook

**Loading Flow**:
1. App initializes with common translations
2. User selects platforms
3. `useMultiplePlatformTranslations` hook loads platform translations
4. Translations merged into i18n system
5. Available via `t('platform.{platformId}.key')`

---

## Backend Architecture

### Core Services

#### PlatformRegistry
Central service for managing platforms:

```typescript
class PlatformRegistry {
  async discoverPlatforms(): Promise<void>
  async register(platform: PlatformModule): Promise<void>
  getPlatform(id: string): PlatformModule | undefined
  getAllPlatforms(): PlatformModule[]
  getPlatformsByCategory(category: string): PlatformModule[]
  getPlatformSchema(id: string): PlatformSchema | undefined
}
```

**Responsibilities**:
- Platform discovery and registration
- Platform caching
- Schema validation
- Query interface

#### Platform Discovery Utilities

Located in `backend/src/utils/platformDiscovery.ts`:

```typescript
async function discoverPlatforms(config: DiscoveryConfig): Promise<Map<string, PlatformModule>>
async function discoverPlatform(path: string): Promise<PlatformModule | null>
async function scanPlatformDirectories(platformsPath: string): Promise<string[]>
```

**Process**:
1. Scans `platforms/` directory
2. Filters valid platform directories
3. Dynamically imports `index.ts`
4. Validates `PlatformModule` structure
5. Returns discovered platforms

#### Schema Validator

Validates platform schemas:

```typescript
function validatePlatformSchema(schema: PlatformSchema): void
function validateFieldDefinition(field: FieldDefinition): void
```

**Validates**:
- Schema structure
- Field definitions
- Validation rules
- Type compatibility

#### Translation Loader

Loads platform translations:

```typescript
async function getPlatformTranslations(platformId: string, lang: string): Promise<Record<string, any>>
async function getAllPlatformTranslations(lang: string): Promise<Record<string, Record<string, any>>>
```

**Features**:
- Caching for performance
- Automatic file discovery
- Language validation
- Error handling

### API Structure

#### Platform Endpoints

```
GET  /api/platforms                    # Get all platforms
GET  /api/platforms/:id                # Get platform details
GET  /api/platforms/:id/schema         # Get platform schema
GET  /api/platforms/:id/i18n/:lang     # Get platform translations
GET  /api/platforms/:id/i18n          # Get available languages
GET  /api/platforms/:id/settings       # Get platform settings
PUT  /api/platforms/:id/settings      # Update platform settings
```

#### Translation Endpoints

```
GET  /api/translations/:platformId/:lang  # Get platform translations
GET  /api/translations/:lang              # Get all platform translations
```

#### Dynamic Route Loading

Platforms can define custom routes in `routes.ts`:

```typescript
// platforms/email/routes.ts
import { Router } from 'express'

const router = Router()

router.get('/recipients', async (req, res) => {
  // Platform-specific endpoint
})

export default router
```

**Loading**: Backend automatically discovers and mounts platform routes at `/api/platforms/{platformId}/...`

### Service Layer

Each platform can implement:

- **PlatformService**: Business logic for publishing, content transformation
- **PlatformParser**: Content parsing and transformation
- **ContentValidator**: Content validation rules
- **Custom Services**: Platform-specific services (e.g., `EmailRecipientService`)

---

## Data Flow

### Platform Discovery Flow

```
1. Backend Startup
   ↓
2. PlatformRegistry.initialize()
   ↓
3. Scan platforms/ directory
   ↓
4. For each platform directory:
   ├─ Load index.ts
   ├─ Validate PlatformModule
   ├─ Validate schemas
   └─ Register in registry
   ↓
5. Platforms available via API
```

### Platform Selection Flow

```
1. User selects platform in frontend
   ↓
2. Frontend requests: GET /api/platforms/{id}
   ↓
3. Backend returns platform with schema
   ↓
4. Frontend loads translations: usePlatformTranslations(id, lang)
   ↓
5. Frontend renders UI using SchemaRenderer
```

### Content Creation Flow

```
1. User creates content in GenericPlatformEditor
   ↓
2. Editor validates using schema rules
   ↓
3. Content stored in frontend state
   ↓
4. User clicks "Publish"
   ↓
5. Frontend sends to backend: POST /api/publish
   ↓
6. Backend validates content
   ↓
7. Backend calls platform service
   ↓
8. Platform service publishes to external API
```

### Translation Loading Flow

```
1. User selects platforms
   ↓
2. useMultiplePlatformTranslations hook triggered
   ↓
3. For each platform:
   ├─ Request: GET /api/translations/{id}/{lang}
   ├─ Backend loads from platforms/{id}/locales/{lang}.json
   └─ Frontend merges into i18n
   ↓
4. Translations available via t('platform.{id}.key')
```

---

## API Documentation

### Platform Endpoints

#### Get All Platforms
```http
GET /api/platforms
```

**Response**:
```json
{
  "success": true,
  "platforms": [
    {
      "id": "twitter",
      "name": "Twitter",
      "metadata": { ... },
      "capabilities": { ... }
    }
  ]
}
```

#### Get Platform Details
```http
GET /api/platforms/:id
```

**Response**:
```json
{
  "success": true,
  "platform": {
    "id": "twitter",
    "metadata": { ... },
    "schema": { ... },
    "capabilities": { ... }
  }
}
```

#### Get Platform Schema
```http
GET /api/platforms/:id/schema
```

**Response**:
```json
{
  "success": true,
  "schema": {
    "settings": { ... },
    "editor": { ... },
    "preview": { ... },
    "panel": { ... },
    "template": { ... }
  }
}
```

#### Get Platform Translations
```http
GET /api/translations/:platformId/:lang
```

**Response**:
```json
{
  "success": true,
  "platform": "twitter",
  "language": "en",
  "translations": {
    "form": {
      "labels": {
        "tweetText": "Tweet Text"
      }
    }
  }
}
```

---

## Technology Stack

### Frontend

- **React 18**: UI framework
- **TypeScript/JavaScript**: Language
- **Material-UI (MUI)**: Component library
- **Zustand**: State management
- **React i18next**: Internationalization
- **Vite**: Build tool
- **Axios**: HTTP client

### Backend

- **Node.js**: Runtime
- **Express**: Web framework
- **TypeScript**: Language
- **ES Modules**: Module system
- **File System API**: Platform discovery
- **Dynamic Imports**: Module loading

### Development Tools

- **Vitest**: Testing framework
- **ESLint**: Linting
- **TypeScript Compiler**: Type checking

---

## Adding New Platforms

### Quick Start

1. **Copy Blueprint**:
   ```bash
   cp -r backend/src/platforms/_blueprint backend/src/platforms/myplatform
   ```

2. **Update Platform Module** (`index.ts`):
   ```typescript
   export const MyPlatformModule: PlatformModule = {
     metadata: {
       id: 'myplatform',
       displayName: 'My Platform',
       version: '1.0.0',
       category: 'social'
     },
     schema: myPlatformSchema,
     capabilities: { ... },
     service: new MyPlatformService(),
     parser: MyPlatformParser,
     validator: MyPlatformValidator
   }
   ```

3. **Define Schemas** (`schema/`):
   - `settings.ts`: Settings form schema
   - `editor.ts`: Content editor schema
   - `preview.ts`: Preview schema
   - `panel.ts`: Feature panel schema (optional)
   - `template.ts`: Template schema (optional)

4. **Add Translations** (`locales/`):
   - Create `en.json`, `de.json`, `es.json`

5. **Restart Backend**:
   - Platform will be automatically discovered

### Required Files

- ✅ `index.ts`: PlatformModule export
- ✅ `schema/`: UI schemas
- ✅ `service.ts`: Business logic
- ✅ `parser.ts`: Content transformation
- ✅ `validator.ts`: Validation rules

### Optional Files

- `routes.ts`: Custom API routes
- `controller.ts`: Platform-specific controllers
- `locales/`: Translations
- `templates/`: Content templates
- `types.ts`: Platform-specific types

### Validation

The system automatically validates:
- PlatformModule structure
- Schema definitions
- Field types and validation rules
- Required vs optional properties

### Testing

After adding a platform:
1. Check backend logs for discovery messages
2. Test API: `GET /api/platforms/myplatform`
3. Test schema: `GET /api/platforms/myplatform/schema`
4. Test in frontend: Select platform and verify UI renders

---

## Best Practices

### Platform Development

1. **Isolation**: Keep platform logic isolated in platform directory
2. **Schema First**: Define schemas before implementing UI logic
3. **Generic Components**: Use generic frontend components
4. **Translation Keys**: Use consistent translation key structure
5. **Validation**: Always validate content using schema rules

### Frontend Development

1. **No Hardcoded Logic**: Never hardcode platform names or logic
2. **Schema-Driven**: Always use schemas from backend
3. **Generic Components**: Reuse generic components
4. **Error Handling**: Handle missing schemas gracefully
5. **Loading States**: Show loading states while fetching data

### Backend Development

1. **Discovery**: Ensure platforms follow PlatformModule interface
2. **Validation**: Validate all schemas before registration
3. **Error Handling**: Provide clear error messages
4. **Caching**: Cache platform data for performance
5. **Documentation**: Document platform-specific features

---

## Future Enhancements

- **Hot Reload**: Reload platforms without restart (dev mode)
- **External Plugins**: Load platforms from external sources
- **Platform Marketplace**: Share platforms with community
- **Schema Versioning**: Handle schema migrations
- **Plugin Sandboxing**: Isolate platform code execution
- **Performance Monitoring**: Track platform performance metrics

---

## References

- [Platform Blueprint Documentation](./backend/src/platforms/_blueprint/README.md)
- [Platform Architecture Details](./docs/architecture/platform-architecture.md)
- [Adding New Platforms Guide](./docs/development/adding-new-platforms.md)
- [Platform Blueprint Guide](./docs/development/PLATFORM_BLUEPRINT.md)

---

**Last Updated**: 2024
**Version**: 1.0.0
