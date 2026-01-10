# Self-Discovering Platform Architecture

## Overview

The self-discovering platform architecture enables automatic platform discovery, registration, and schema-driven UI rendering. This system eliminates the need for manual platform imports and hardcoded frontend configurations.

## Architecture Components

### 1. Platform Module System

#### PlatformModule Interface

The `PlatformModule` interface defines the complete structure of a platform:

```typescript
interface PlatformModule {
  metadata: PlatformMetadata      // Platform identification and display info
  schema: PlatformSchema          // UI schema definitions
  capabilities: PlatformCapabilities  // Feature flags
  service: PlatformService        // Business logic implementation
  parser: PlatformParser         // Content transformation
  validator: ContentValidator    // Content validation
  templates?: ContentTemplates   // Optional templates
  config?: PlatformConfig        // Platform configuration
}
```

#### Platform Metadata

Contains platform identification and display information:

- `id`: Unique platform identifier
- `displayName`: Human-readable name
- `version`: Platform version
- `category`: Platform category (social, email, etc.)
- `icon`: Icon identifier or URL
- `color`: Brand color (hex)
- `description`: Platform description

### 2. Schema System

The schema system defines three types of schemas:

#### Settings Schema

Defines the form structure for platform settings/configuration:

```typescript
interface SettingsSchema {
  version: string
  title: string
  fields: FieldDefinition[]
  groups?: FieldGroup[]
}
```

#### Editor Schema

Defines the content editor structure:

```typescript
interface EditorSchema {
  version: string
  title: string
  blocks: ContentBlock[]
  mode?: 'simple' | 'advanced' | 'rich' | 'markdown'
  features?: EditorFeatures
  constraints?: EditorConstraints
}
```

#### Preview Schema

Defines how content should be previewed:

```typescript
interface PreviewSchema {
  version: string
  title: string
  defaultMode: PreviewMode
  modes: PreviewModeDefinition[]
  options?: PreviewOptions
  styling?: PreviewStyling
}
```

### 3. Platform Registry

The `PlatformRegistry` service manages platform discovery and registration:

#### Key Features

- **Automatic Discovery**: Scans platform directories at runtime
- **Caching**: In-memory cache for discovered platforms
- **Validation**: Validates platform structure and schemas
- **Query Interface**: Methods to retrieve platforms by various criteria

#### Usage

```typescript
import { initializePlatformRegistry } from './services/platformRegistry'

// Initialize registry on application startup
const registry = await initializePlatformRegistry()

// Get all platforms
const platforms = registry.getAllPlatforms()

// Get specific platform
const twitter = registry.getPlatform('twitter')

// Get platform schema
const schema = registry.getPlatformSchema('twitter')
```

### 4. Discovery System

The discovery system automatically finds and loads platform modules:

#### Discovery Process

1. **Directory Scanning**: Scans `backend/src/platforms/` directory
2. **Validation**: Checks for valid platform directories (must have `index.ts`)
3. **Module Loading**: Uses ES dynamic imports to load platform modules
4. **Schema Validation**: Validates platform schemas
5. **Registration**: Registers valid platforms in the registry

#### Discovery Configuration

```typescript
interface DiscoveryConfig {
  platformsPath: string           // Path to platforms directory
  validateSchemas?: boolean       // Enable schema validation
  throwOnError?: boolean          // Throw on discovery errors
  entryPointExtensions?: string[] // File extensions to check
}
```

### 5. Translation System

Unified translation loading system:

#### Features

- Automatic discovery of translation files in platform `locales/` directories
- Caching for performance
- Support for multiple languages (en, de, es)
- Unified API endpoint: `/api/platforms/:id/i18n/:lang`

#### Usage

```typescript
import { getPlatformTranslations } from './utils/translationLoader'

// Load translations for a platform
const translations = await getPlatformTranslations('twitter', 'en')

// Load all platform translations
const allTranslations = await getAllPlatformTranslations('en')
```

## API Endpoints

### Platform Endpoints

- `GET /api/platforms` - Get all platforms with metadata
- `GET /api/platforms/:id` - Get specific platform with schema
- `GET /api/platforms/:id/schema` - Get platform schema
- `GET /api/platforms/:id/i18n/:lang` - Get platform translations
- `GET /api/platforms/:id/i18n` - Get available languages
- `GET /api/platforms/:id/settings` - Get platform settings configuration
- `PUT /api/platforms/:id/settings` - Update platform settings

### Translation Endpoints

- `GET /api/translations/:platformId/:lang` - Get platform translations
- `GET /api/translations/:lang` - Get all platform translations

## Frontend Integration

### Schema-Driven Components

#### SchemaRenderer

Generic form renderer that dynamically renders fields based on schema:

```jsx
import SchemaRenderer from './components/SchemaRenderer/SchemaRenderer'

<SchemaRenderer
  fields={schema.settings.fields}
  values={formValues}
  onChange={handleFieldChange}
  errors={validationErrors}
  groups={schema.settings.groups}
/>
```

#### SchemaSettingsPanel

Settings panel component that uses schema:

```jsx
import SchemaSettingsPanel from './components/SchemaSettingsPanel/SchemaSettingsPanel'

<SchemaSettingsPanel
  platformId="twitter"
  open={settingsOpen}
  onClose={handleClose}
  onSave={handleSave}
/>
```

### React Hooks

#### usePlatformSchema

Hook for loading platform schemas:

```jsx
import { usePlatformSchema } from './hooks/usePlatformSchema'

function MyComponent({ platformId }) {
  const { schema, loading, error } = usePlatformSchema(platformId)
  
  if (loading) return <Loading />
  if (error) return <Error message={error} />
  
  return <SchemaRenderer fields={schema.settings.fields} />
}
```

## Platform Development Guide

### Creating a New Platform

1. **Create Platform Directory**

   ```
   backend/src/platforms/myplatform/
   ├── index.ts          # Platform module export
   ├── schema.ts         # Platform schema
   ├── parser.ts         # Content parser
   ├── service.ts        # Platform service
   ├── validator.ts      # Content validator
   └── locales/          # Translation files
       ├── en.json
       ├── de.json
       └── es.json
   ```

2. **Define Platform Schema**

   ```typescript
   // schema.ts
   import { PlatformSchema } from '../../types/platformSchema'
   
   export const myPlatformSchema: PlatformSchema = {
     version: '1.0.0',
     settings: { /* ... */ },
     editor: { /* ... */ },
     preview: { /* ... */ }
   }
   ```

3. **Create Platform Module**

   ```typescript
   // index.ts
   import { PlatformModule } from '../../types/platformModule'
   import { myPlatformSchema } from './schema'
   // ... other imports
   
   export const MyPlatformModule: PlatformModule = {
     metadata: {
       id: 'myplatform',
       displayName: 'My Platform',
       version: '1.0.0',
       category: 'social'
     },
     schema: myPlatformSchema,
     capabilities: { /* ... */ },
     service: new MyPlatformService(),
     parser: MyPlatformParser,
     validator: MyPlatformValidator
   }
   
   export default MyPlatformModule
   ```

4. **Automatic Discovery**

   The platform will be automatically discovered and registered on application startup.

## Migration from Legacy System

### Backward Compatibility

The new system maintains backward compatibility with the legacy `PlatformPlugin` interface:

- Legacy platforms continue to work
- Conversion helper: `convertPlatformPluginToModule()`
- Gradual migration supported

### Migration Steps

1. Create schema file for platform
2. Update platform index to use new interface (optional initially)
3. Test platform functionality
4. Remove legacy code once migration is complete

## Performance Considerations

### Caching Strategy

- **Platform Registry**: In-memory cache of discovered platforms
- **Schema Cache**: Cached per platform
- **Translation Cache**: Cached per platform/language combination

### Discovery Performance

- Discovery runs once on application startup
- Lazy loading supported for development mode
- Cache invalidation on file changes (dev mode)

## Security Considerations

- Schema validation prevents injection attacks
- Platform module validation before registration
- Input sanitization in schema renderer
- Secure dynamic import handling

## Future Enhancements

- External plugin system
- Platform marketplace
- Hot-reload platforms (dev mode)
- Schema versioning and migration
- Plugin sandboxing

## References

- [Phase 1 Documentation](./self-discovering-platform-architecture-phase-1.md)
- [Phase 2 Documentation](./self-discovering-platform-architecture-phase-2.md)
- [Implementation Plan](./self-discovering-platform-architecture-implementation.md)

