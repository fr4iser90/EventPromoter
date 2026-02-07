# Adding a New Platform

This guide explains how to add a new platform to the EventPromoter system using the self-discovering platform architecture.

## Overview

With the self-discovering architecture, adding a new platform is straightforward. Simply create a platform directory with the required files, and the system will automatically discover and register it.

## Step-by-Step Guide

### 1. Create Platform Directory

Create a new directory in `backend/src/platforms/`:

```bash
mkdir -p backend/src/platforms/myplatform
cd backend/src/platforms/myplatform
```

### 2. Create Platform Schema

Create `schema.ts` with your platform's UI schema:

```typescript
// backend/src/platforms/myplatform/schema.ts
import { PlatformSchema } from '@/types/schema/index.js'

export const myPlatformSchema: PlatformSchema = {
  version: '1.0.0',
  settings: {
    version: '1.0.0',
    title: 'My Platform Settings',
    description: 'Configure My Platform',
    fields: [
      {
        name: 'apiKey',
        type: 'text',
        label: 'API Key',
        required: true,
        validation: [
          { type: 'required', message: 'API Key is required' }
        ],
        ui: { width: 12, order: 1 }
      }
    ]
  },
  editor: {
    version: '1.0.0',
    title: 'My Platform Editor',
    mode: 'simple',
    blocks: [
      {
        type: 'text',
        id: 'content',
        label: 'Content',
        required: true,
        constraints: { maxLength: 500 },
        ui: { icon: 'text', order: 1, enabled: true }
      }
    ],
    features: {
      formatting: false,
      mediaUpload: true,
      preview: true
    },
    constraints: {
      maxLength: 500,
      minLength: 1
    }
  },
  preview: {
    version: '1.0.0',
    title: 'My Platform Preview',
    defaultMode: 'desktop',
    modes: [
      {
        id: 'desktop',
        label: 'Desktop',
        width: 600,
        height: 400
      }
    ]
  }
}
```

### 3. Create Platform Components

#### Parser (`parser.ts`)

```typescript
import { PlatformParser, ParsedEventData, PlatformContent } from '../../types/index.js'

export class MyPlatformParser implements PlatformParser {
  parse(eventData: ParsedEventData): PlatformContent {
    return {
      text: `${eventData.title} - ${eventData.description}`,
      metadata: {
        date: eventData.date,
        venue: eventData.venue
      }
    }
  }
}

export default new MyPlatformParser()
```

#### Service (`service.ts`)

```typescript
import { PlatformService } from '../../types/index.js'

export class MyPlatformService implements PlatformService {
  validateContent(content: any) {
    // Validation logic
    return { isValid: true, errors: [] }
  }

  transformForAPI(content: any) {
    // Transform content for API
    return content
  }
}

export default new MyPlatformService()
```

#### Validator (`validator.ts`)

```typescript
import { ContentValidator, ValidationResult, ContentLimits } from '../../types/index.js'

export class MyPlatformValidator implements ContentValidator {
  validate(content: any): ValidationResult {
    const errors: string[] = []
    
    if (!content.text || content.text.length === 0) {
      errors.push('Content text is required')
    }
    
    if (content.text && content.text.length > 500) {
      errors.push('Content must be at most 500 characters')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  getLimits(): ContentLimits {
    return {
      maxLength: 500,
      maxImages: 1,
      allowedFormats: ['jpg', 'jpeg', 'png']
    }
  }
}

export default new MyPlatformValidator()
```

### 4. Create Platform Module

Create `index.ts` with the complete platform module:

```typescript
// backend/src/platforms/myplatform/index.ts
import { PlatformModule } from '../../types/platformModule.js'
import { myPlatformSchema } from './schema.js'
import MyPlatformParser from './parser.js'
import MyPlatformService from './service.js'
import MyPlatformValidator from './validator.js'

const MyPlatformModule: PlatformModule = {
  metadata: {
    id: 'myplatform',
    displayName: 'My Platform',
    version: '1.0.0',
    category: 'social',
    icon: 'myplatform',
    color: '#FF5733',
    description: 'My custom platform integration'
  },
  schema: myPlatformSchema,
  capabilities: {
    supportsText: true,
    supportsImages: true,
    supportsVideo: false,
    supportsLinks: true,
    supportsHashtags: true,
    supportsMentions: false,
    supportsPolls: false,
    supportsScheduling: false,
    requiresAuth: true
  },
  service: MyPlatformService,
  parser: MyPlatformParser,
  validator: MyPlatformValidator,
  config: {
    apiEndpoints: {
      post: 'https://api.myplatform.com/v1/posts'
    },
    rateLimits: {
      requestsPerHour: 100,
      requestsPerDay: 1000
    },
    supportedFormats: ['jpg', 'jpeg', 'png']
  }
}

export default MyPlatformModule
```

### 5. Add Translations (Optional)

Create translation files in `locales/`:

```bash
mkdir -p locales
```

```json
// locales/en.json
{
  "platform": {
    "name": "My Platform",
    "description": "My custom platform"
  },
  "settings": {
    "apiKey": "API Key",
    "apiKeyDescription": "Your My Platform API key"
  }
}
```

### 6. Automatic Discovery

That's it! The platform will be automatically discovered when the application starts. No manual registration needed.

## Testing Your Platform

### 1. Start the Backend

```bash
cd backend
npm run dev
```

### 2. Verify Discovery

Check that your platform appears in the API:

```bash
curl http://localhost:4000/api/platforms
```

You should see your platform in the list.

### 3. Test Schema Endpoint

```bash
curl http://localhost:4000/api/platforms/myplatform/schema
```

### 4. Test Frontend Integration

The frontend will automatically load your platform and render the UI based on your schema.

## Platform Schema Reference

### Settings Schema

Defines the form for platform configuration:

- **fields**: Array of form field definitions
- **groups**: Optional field groups for organization
- **validation**: Field-level and form-level validation

### Editor Schema

Defines the content editor:

- **blocks**: Content blocks (text, image, video, etc.)
- **mode**: Editor mode (simple, advanced, rich, markdown)
- **features**: Enabled editor features
- **constraints**: Content constraints (max length, etc.)

### Preview Schema

Defines content preview:

- **modes**: Available preview modes (desktop, mobile, etc.)
- **options**: Preview options (show metadata, etc.)
- **styling**: Preview styling (colors, fonts, etc.)

## Best Practices

1. **Schema Versioning**: Always include version in schemas
2. **Validation**: Add comprehensive validation rules
3. **Error Messages**: Provide clear, user-friendly error messages
4. **Documentation**: Document any platform-specific requirements
5. **Testing**: Test your platform thoroughly before deployment

## Troubleshooting

### Platform Not Discovered

- Check that `index.ts` exists and exports a default `PlatformModule`
- Verify the directory name matches the platform ID
- Check application logs for discovery errors

### Schema Validation Errors

- Ensure all required schema fields are present
- Check schema version compatibility
- Validate field definitions match the schema type system

### Frontend Not Rendering

- Verify schema is accessible via API endpoint
- Check browser console for errors
- Ensure frontend is using the latest API endpoints

## Examples

See existing platforms for reference:

- `backend/src/platforms/email/` - Email platform example
- `backend/src/platforms/twitter/` - Twitter platform example
- `backend/src/platforms/instagram/` - Instagram platform example

## Next Steps

- Add platform-specific templates
- Implement custom route handlers (if needed)
- Add platform-specific validation rules
- Create platform documentation

