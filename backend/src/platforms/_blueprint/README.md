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
- `panel.ts` - Panel schema (if platform has feature panels)

## Validation

The platform will be automatically validated on discovery:
- Schema structure validation
- Field definition validation
- Block definition validation
- Platform module structure validation

## Testing

After creating your platform:

1. Start the backend: `npm run dev`
2. Check discovery: `curl http://localhost:4000/api/platforms`
3. Check schema: `curl http://localhost:4000/api/platforms/myplatform/schema`
4. Test in frontend: Platform should appear automatically

