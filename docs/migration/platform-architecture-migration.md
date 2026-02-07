# Platform Architecture Migration Guide

This guide helps you migrate from the legacy platform system to the new self-discovering platform architecture.

## Overview

The new architecture provides:
- Automatic platform discovery
- Schema-driven UI
- Unified translation system
- Better type safety
- Easier platform development

## Migration Strategy

### Phase 1: Preparation

1. **Backup Current Code**
   ```bash
   git checkout -b feature/platform-architecture-migration
   git commit -am "Backup before migration"
   ```

2. **Review Existing Platforms**
   - List all current platforms
   - Identify platform-specific features
   - Document any custom logic

3. **Understand New Architecture**
   - Read [Architecture Guide](../architecture/platform-architecture.md)
   - Review [Platform Development Guide](../development/adding-new-platforms.md)

### Phase 2: Create Schemas

For each platform, create a schema file:

```typescript
// backend/src/platforms/[platform]/schema.ts
import { PlatformSchema } from '@/types/schema/index.js'

export const [platform]Schema: PlatformSchema = {
  version: '1.0.0',
  settings: {
    // Extract from existing uiConfig.settings
  },
  editor: {
    // Extract from existing uiConfig.editor
  },
  preview: {
    // Define preview configuration
  }
}
```

### Phase 3: Update Platform Modules

#### Option A: Gradual Migration (Recommended)

Keep existing PlatformPlugin, add schema:

```typescript
// backend/src/platforms/[platform]/index.ts
import { PlatformPlugin } from '../../types/index.js'
import { [platform]Schema } from './schema.js'
// ... existing imports

const [Platform]Plugin: PlatformPlugin = {
  // ... existing plugin definition
  uiConfig: {
    // Keep existing for backward compatibility
    settings: existingSettingsConfig,
    editor: existingEditorConfig
  }
}

// Export schema separately
export const schema = [platform]Schema
export default [Platform]Plugin
```

#### Option B: Full Migration

Convert to PlatformModule:

```typescript
// backend/src/platforms/[platform]/index.ts
import { PlatformModule } from '../../types/platformModule.js'
import { convertPlatformPluginToModule } from '../../types/platformModule.js'
import { [platform]Schema } from './schema.js'
import LegacyPlugin from './legacy.js' // Your existing plugin

export const [Platform]Module: PlatformModule = convertPlatformPluginToModule(
  LegacyPlugin,
  [platform]Schema,
  {
    id: '[platform]',
    displayName: '[Platform Name]',
    version: '1.0.0',
    category: '[category]',
    icon: '[icon]',
    color: '[color]'
  }
)

export default [Platform]Module
```

### Phase 4: Update Frontend

1. **Update PlatformSelector**
   - Already updated to use API metadata
   - Remove hardcoded icon/color maps (optional)

2. **Update GenericPlatformEditor**
   - Already updated to use schema
   - Remove fallback configs (optional)

3. **Test Frontend**
   - Verify all platforms load correctly
   - Test schema-driven UI rendering
   - Verify settings panels work

### Phase 5: Cleanup

1. **Remove Legacy Code**
   ```typescript
   // Remove getFallbackConfig functions
   // Remove hardcoded platform configs
   // Remove manual platform imports (if fully migrated)
   ```

2. **Update Imports**
   ```typescript
   // Old
   import { getPlatformPlugin } from '../platforms/index.js'
   
   // New (if using registry)
   import { getPlatformRegistry } from '../services/platformRegistry.js'
   const registry = getPlatformRegistry()
   const platform = registry.getPlatform(id)
   ```

3. **Update Tests**
   - Update test mocks
   - Add schema validation tests
   - Test discovery mechanism

## Migration Checklist

### For Each Platform

- [ ] Create `schema.ts` file
- [ ] Define settings schema
- [ ] Define editor schema
- [ ] Define preview schema
- [ ] Update platform index (if migrating fully)
- [ ] Test platform discovery
- [ ] Test schema endpoint
- [ ] Test frontend rendering
- [ ] Verify translations work
- [ ] Update documentation

### Global

- [ ] Update platform controller
- [ ] Update routes
- [ ] Update frontend components
- [ ] Remove hardcoded configs
- [ ] Update tests
- [ ] Update documentation
- [ ] Test all platforms
- [ ] Performance testing
- [ ] Code review

## Common Migration Patterns

### Pattern 1: Settings Migration

**Before:**
```typescript
uiConfig: {
  settings: {
    title: "Settings",
    sections: [
      {
        id: "credentials",
        title: "Credentials",
        component: "settings-form",
        props: {
          fields: [
            { name: "apiKey", type: "text", label: "API Key" }
          ]
        }
      }
    ]
  }
}
```

**After:**
```typescript
settings: {
  version: '1.0.0',
  title: 'Settings',
  fields: [
    {
      name: 'apiKey',
      type: 'text',
      label: 'API Key',
      required: true,
      validation: [
        { type: 'required', message: 'API Key is required' }
      ]
    }
  ],
  groups: [
    {
      id: 'credentials',
      title: 'Credentials',
      fields: ['apiKey']
    }
  ]
}
```

### Pattern 2: Editor Migration

**Before:**
```typescript
uiConfig: {
  editor: {
    title: "Editor",
    sections: [
      {
        id: "content",
        component: "text-editor",
        props: { maxLength: 280 }
      }
    ]
  }
}
```

**After:**
```typescript
editor: {
  version: '1.0.0',
  title: 'Editor',
  blocks: [
    {
      type: 'text',
      id: 'content',
      label: 'Content',
      constraints: {
        maxLength: 280
      },
      validation: [
        { type: 'maxLength', value: 280, message: 'Content must be at most 280 characters' }
      ]
    }
  ],
  constraints: {
    maxLength: 280
  }
}
```

## Backward Compatibility

The new system maintains backward compatibility:

1. **Legacy Platforms Still Work**
   - Old PlatformPlugin interface supported
   - Conversion helper available
   - Gradual migration possible

2. **API Endpoints**
   - New endpoints added alongside old ones
   - Old endpoints still functional
   - Can be removed after migration

3. **Frontend**
   - Falls back to legacy config if schema unavailable
   - Supports both old and new formats

## Testing Migration

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### Manual Testing

1. **Test Platform Discovery**
   ```bash
   curl http://localhost:4000/api/platforms
   ```

2. **Test Schema Loading**
   ```bash
   curl http://localhost:4000/api/platforms/[platform]/schema
   ```

3. **Test Frontend**
   - Load application
   - Select each platform
   - Verify UI renders correctly
   - Test settings panel
   - Test editor

## Rollback Plan

If issues occur:

1. **Revert Code Changes**
   ```bash
   git revert [commit-hash]
   ```

2. **Keep Legacy System**
   - Old system still works
   - Can run both systems in parallel

3. **Gradual Rollback**
   - Migrate platforms one at a time
   - Keep problematic platforms on old system

## Post-Migration

After successful migration:

1. **Remove Legacy Code**
   - Remove old platform imports
   - Remove fallback configs
   - Clean up unused code

2. **Update Documentation**
   - Update platform guides
   - Update API documentation
   - Update architecture docs

3. **Performance Optimization**
   - Optimize discovery process
   - Add caching where needed
   - Profile and optimize

## Support

If you encounter issues during migration:

1. Check [Troubleshooting Guide](../troubleshooting/platform-discovery.md)
2. Review existing platform examples
3. Check test files for reference implementations
4. Review architecture documentation

## Timeline

Recommended migration timeline:

- **Week 1**: Create schemas for all platforms
- **Week 2**: Update platform modules (gradual)
- **Week 3**: Update frontend components
- **Week 4**: Testing and cleanup

Adjust based on:
- Number of platforms
- Complexity of platforms
- Team size
- Testing requirements

