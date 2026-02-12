# Platform Blueprint

This is a template/blueprint for creating new platforms. Copy this directory and customize it for your platform.

## Structure

```
_blueprint/
├── README.md          # This file
├── index.ts           # Platform module entry point
├── schema.ts          # Platform schema (settings, editor, preview, panel, template)
├── parser.ts          # Content parser
├── service.ts         # Platform service (publish, validate, transform)
├── validator.ts       # Content validator
├── types.ts           # Platform-specific types (optional)
├── templates.ts       # Content templates (optional)
└── locales/           # Translations (optional)
    ├── en.json
    ├── de.json
    └── es.json
```

## Quick Start

1. Copy this directory:
```bash
cp -r backend/src/platforms/_blueprint backend/src/platforms/myplatform
cd backend/src/platforms/myplatform
```

2. Replace `PLATFORM_ID` with your platform ID in all files
3. Customize the schema, parser, service, and validator
4. The platform will be automatically discovered on next server start

## Required Files

- `index.ts` - Must export a default `PlatformModule`
- `schema.ts` - Must export a `PlatformSchema`
- `parser.ts` - Must export a class implementing `PlatformParser`
- `service.ts` - Must export a class implementing `PlatformService`
- `validator.ts` - Must export a class implementing `ContentValidator`

## Optional Files

- `types.ts` - Platform-specific TypeScript types
- `templates.ts` - Content templates
- `locales/*.json` - Translation files
- `schema/panel.ts` - Panel schema (if platform has feature panels)
- `{resource}Service.ts` - Data source service (e.g., `recipientService.ts`, `subredditService.ts`)
- `controller.ts` - Platform-specific API controllers
- `routes.ts` - Platform-specific API routes

## Validation

The platform will be automatically validated on discovery:
- Schema structure validation
- Field definition validation
- Block definition validation
- Platform module structure validation

## Platform Data Sources Pattern

If your platform needs to manage data sources (e.g., email recipients, Reddit subreddits, Twitter lists), follow this pattern:

### Structure

```
myplatform/
├── {resource}Service.ts    # Service for managing data sources
├── controller.ts           # API controllers
├── routes.ts               # API routes
└── schema/
    └── panel.ts            # Panel schema with data source UI
```

### Example: Email Targets

**1. Define dataSource in Platform Metadata (`index.ts`):**
```typescript
metadata: {
  id: 'email',
  displayName: 'Email',
  // ... other metadata
  dataSource: 'targets.json' // Defines filename in platforms/email/data/
}
```

**2. Service (`targetService.ts`):**
```typescript
import { readPlatformData, writePlatformData } from '../../utils/platformDataUtils.js'

const PLATFORM_ID = 'email'

export class EmailTargetService {
  static async getTargets() {
    // ✅ GENERIC: Reads from platforms/email/data/targets.json
    const config = await readPlatformData(PLATFORM_ID)
    return {
      targets: config?.targets || [],
      groups: config?.groups || {}
    }
  }
  
  static async addTarget(email: string) {
    // Validation and business logic
    const config = await readPlatformData(PLATFORM_ID)
    // ... update logic
    await writePlatformData(PLATFORM_ID, updated)
    return { success: true }
  }
}
```

**2. Controller (`controller.ts`):**
```typescript
import { Request, Response } from 'express'
import { EmailTargetService } from './targetService.js'

export class EmailController {
  static async getTargets(req: Request, res: Response) {
    const result = await EmailTargetService.getTargets()
    return res.json({ success: true, ...result })
  }
}
```

**3. Routes (`routes.ts`):**
```typescript
import { Router } from 'express'
import { EmailController } from './controller.js'

const router = Router()
router.get('/targets', EmailController.getTargets)
router.post('/targets', EmailController.addTarget)
// ... more routes

export default router
```

Routes are automatically mounted at `/api/platforms/{platformId}/...`

**4. Panel Schema (`schema/panel.ts`):**
```typescript
export const emailPanelSchema: PanelSchema = {
  sections: [
    {
      id: 'recipient-list',
      fields: [
        {
          name: 'targets',
          type: 'multiselect',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            transform: (data) => data.targets.map(email => ({
              label: email,
              value: email
            }))
          }
        }
      ]
    }
  ]
}
```

### Data Storage Pattern

- Each platform defines its `dataSource` in `metadata.dataSource` (recommended: `'targets.json'`)
- Data is stored in `platforms/{platformId}/data/{dataSource}`
- Use `readPlatformData(platformId)` and `writePlatformData(platformId, data)` utilities
- Examples:
  - Email: `metadata.dataSource: 'targets.json'` → `platforms/email/data/targets.json`
  - Reddit: `metadata.dataSource: 'targets.json'` → `platforms/reddit/data/targets.json`
  - Twitter: `metadata.dataSource: 'targets.json'` → `platforms/twitter/data/targets.json`

### Frontend Integration

The frontend automatically:
- Loads panel schemas from `/api/platforms/{platformId}/schema`
- Fetches options from `optionsSource.endpoint` endpoints
- Renders forms based on panel schema fields
- Handles actions defined in `action` fields

No frontend code changes needed! Everything is schema-driven.

## Testing

After creating your platform:

1. Start the backend: `npm run dev`
2. Check discovery: `curl http://localhost:4000/api/platforms`
3. Check schema: `curl http://localhost:4000/api/platforms/myplatform/schema`
4. Test data sources: `curl http://localhost:4000/api/platforms/myplatform/{resource}`
5. Test in frontend: Platform should appear automatically with panel features

