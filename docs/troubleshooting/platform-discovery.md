# Platform Discovery Troubleshooting Guide

This guide helps you troubleshoot common issues with the self-discovering platform architecture.

## Common Issues

### Platform Not Discovered

**Symptoms:**
- Platform doesn't appear in `/api/platforms` endpoint
- Platform not available in frontend

**Possible Causes & Solutions:**

1. **Missing index.ts file**
   - **Check**: Verify `backend/src/platforms/[platform]/index.ts` exists
   - **Solution**: Create `index.ts` with default export of PlatformModule

2. **Invalid PlatformModule structure**
   - **Check**: Verify platform exports a valid PlatformModule
   - **Solution**: Ensure all required fields are present:
     ```typescript
     {
       metadata: { id, displayName, version },
       schema: PlatformSchema,
       capabilities: PlatformCapabilities,
       service: PlatformService,
       parser: PlatformParser,
       validator: ContentValidator
     }
     ```

3. **Schema validation errors**
   - **Check**: Check application logs for schema validation errors
   - **Solution**: Validate schema structure using `validatePlatformSchema()`

4. **Discovery path incorrect**
   - **Check**: Verify platforms directory path in registry configuration
   - **Solution**: Ensure `platformsPath` points to correct directory

### Schema Not Loading

**Symptoms:**
- `/api/platforms/:id/schema` returns 404
- Frontend can't load schema

**Possible Causes & Solutions:**

1. **Schema not defined**
   - **Check**: Verify `schema.ts` exists and exports schema
   - **Solution**: Create schema file with valid PlatformSchema

2. **Schema validation failed**
   - **Check**: Check logs for validation errors
   - **Solution**: Fix schema structure issues:
     - Ensure all required fields (settings, editor, preview)
     - Validate field definitions
     - Check schema version compatibility

3. **Platform not registered**
   - **Check**: Verify platform appears in `/api/platforms`
   - **Solution**: Ensure platform discovery completed successfully

### Translation Loading Issues

**Symptoms:**
- Translations return empty object
- Translation endpoint returns 404

**Possible Causes & Solutions:**

1. **Missing locales directory**
   - **Check**: Verify `backend/src/platforms/[platform]/locales/` exists
   - **Solution**: Create locales directory with translation files

2. **Missing translation files**
   - **Check**: Verify `en.json`, `de.json`, `es.json` exist
   - **Solution**: Create translation files for required languages

3. **Invalid JSON format**
   - **Check**: Validate JSON syntax in translation files
   - **Solution**: Fix JSON syntax errors

4. **Language not supported**
   - **Check**: Verify language code is in supported list (en, de, es)
   - **Solution**: Use supported language codes or add support

### Frontend Rendering Issues

**Symptoms:**
- SchemaRenderer not displaying fields
- Settings panel empty
- Editor not working

**Possible Causes & Solutions:**

1. **Schema not loaded**
   - **Check**: Verify schema endpoint returns data
   - **Solution**: Check network tab, verify API response

2. **Field type not supported**
   - **Check**: Verify field type is in supported list
   - **Solution**: Use supported field types or extend SchemaRenderer

3. **Validation errors**
   - **Check**: Check browser console for errors
   - **Solution**: Fix schema structure or validation rules

4. **API URL incorrect**
   - **Check**: Verify `config.apiUrl` is correct
   - **Solution**: Update frontend config with correct API URL

### Performance Issues

**Symptoms:**
- Slow platform discovery
- Slow API responses
- High memory usage

**Possible Causes & Solutions:**

1. **Too many platforms**
   - **Check**: Count discovered platforms
   - **Solution**: Optimize discovery process, add caching

2. **Large schema files**
   - **Check**: Check schema file sizes
   - **Solution**: Optimize schema structure, remove unused fields

3. **No caching**
   - **Check**: Verify registry caching is enabled
   - **Solution**: Ensure registry uses in-memory cache

4. **Inefficient queries**
   - **Check**: Profile API endpoint performance
   - **Solution**: Optimize database queries, add indexes

## Debugging Steps

### 1. Check Application Logs

```bash
# Backend logs
npm run dev

# Look for:
# - Platform discovery messages
# - Schema validation errors
# - Translation loading errors
```

### 2. Verify Platform Structure

```bash
# Check platform directory structure
ls -la backend/src/platforms/[platform]/

# Should contain:
# - index.ts
# - schema.ts (optional but recommended)
# - parser.ts
# - service.ts
# - validator.ts
# - locales/ (optional)
```

### 3. Test API Endpoints

```bash
# Test platform discovery
curl http://localhost:4000/api/platforms

# Test specific platform
curl http://localhost:4000/api/platforms/[platform-id]

# Test schema
curl http://localhost:4000/api/platforms/[platform-id]/schema

# Test translations
curl http://localhost:4000/api/platforms/[platform-id]/i18n/en
```

### 4. Validate Schema

```typescript
import { validatePlatformSchema } from './utils/schemaValidator'

try {
  validatePlatformSchema(mySchema)
  console.log('Schema is valid')
} catch (error) {
  console.error('Schema validation error:', error)
}
```

### 5. Check Registry State

```typescript
import { getPlatformRegistry } from './services/platformRegistry'

const registry = getPlatformRegistry()
console.log('Platforms:', registry.getAllPlatforms().map(p => p.metadata.id))
console.log('Initialized:', registry.isInitialized())
console.log('Count:', registry.getPlatformCount())
```

## Error Messages Reference

### "Platform validation failed"

**Cause**: Platform module doesn't meet PlatformModule interface requirements

**Solution**: 
- Check all required fields are present
- Verify metadata structure
- Ensure service, parser, validator are defined

### "Schema validation failed"

**Cause**: Platform schema doesn't meet PlatformSchema requirements

**Solution**:
- Verify settings, editor, preview schemas exist
- Check field definitions are valid
- Validate schema version

### "Platform discovery failed"

**Cause**: Error during platform discovery process

**Solution**:
- Check file system permissions
- Verify platform directories are readable
- Check for syntax errors in platform files

### "Translation not found"

**Cause**: Translation file doesn't exist or is invalid

**Solution**:
- Verify translation file exists
- Check file path is correct
- Validate JSON syntax

## Getting Help

If you're still experiencing issues:

1. **Check Documentation**
   - [Architecture Guide](../architecture/platform-architecture.md)
   - [Platform Development Guide](../development/adding-new-platforms.md)

2. **Review Examples**
   - Check existing platforms (email, twitter, etc.)
   - Compare your implementation

3. **Enable Debug Logging**
   ```typescript
   // In platformRegistry.ts
   console.log('Discovery config:', this.discoveryConfig)
   console.log('Discovered platforms:', Array.from(platforms.keys()))
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## Prevention Tips

1. **Follow Naming Conventions**
   - Platform ID should match directory name
   - Use kebab-case for platform IDs

2. **Validate Early**
   - Validate schema during development
   - Test platform discovery locally

3. **Use TypeScript**
   - Leverage type checking
   - Catch errors at compile time

4. **Test Incrementally**
   - Test each component separately
   - Verify schema before full integration

5. **Document Your Platform**
   - Add comments to schema
   - Document any custom requirements

