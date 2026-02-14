# Project Overview

This document provides a practical, end-to-end overview of EventPromoter for developers and operators.

## 1) Purpose

EventPromoter centralizes event content creation and publishing across multiple platforms. It is designed to:

- ingest and parse event source files,
- generate platform-specific content,
- publish via API / n8n / optional Playwright,
- and expose live step-level progress to the UI.

Supported platform modules include Email, Facebook, Instagram, LinkedIn, Reddit, and Twitter/X.

## 2) System Components

### Frontend (`frontend/`)

- React + Vite + TypeScript
- Schema-driven rendering for platform settings/editor/panels
- i18n support (common frontend locale files + dynamic platform translations)
- Real-time publishing progress via SSE (`PublisherProgress`)

### Backend (`backend/`)

- Express + TypeScript
- Dynamic platform discovery from `backend/src/platforms/*`
- Central publishing orchestration (`PublishingService`)
- Event stream service for step events (`PublisherEventService`)
- n8n callback ingest route for external step reporting (`POST /api/publish/event`)

### Workflows (`workflows/`)

- Modular n8n workflow builder
- JSON node definitions + script fragments + build composition
- Generated importable workflow artifacts (e.g. `MultiPlatformSocialMediaEmail-built.json`)

### Shared Types (`packages/types/`)

- Reusable TypeScript contracts shared between apps.

## 3) High-Level Data Flow

1. User uploads/edits event data in frontend.
2. Frontend requests schemas/translations from backend.
3. User triggers publish.
4. Backend orchestrates publishing by configured route:
   - direct platform API publishers,
   - Playwright publishers,
   - n8n execution path.
5. Step events are emitted in a unified contract:
   - `step_started`
   - `step_progress`
   - `step_completed`
   - `step_failed`
6. Frontend subscribes to SSE stream and renders live progress.
7. Final results are persisted and available through publish result endpoints.

## 4) Unified Event/Step Model

The project standardizes step IDs as stable, technology-agnostic names (for example: `auth.validate_credentials`, `publish.submit`, `publish.verify_result`).

Design goals:

- deterministic step names for UI/history,
- parity across API, Playwright, and n8n paths,
- observability and retry logic through consistent event payloads.

For implementation status and migration details, see `docs/development/MIGRATION_DONE.md`.

## 5) Development Workflow

From repository root:

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run dev:frontend
npm run dev:backend
npm run build:all
npm run typecheck
npm run lint
npm run test
```

Default local ports:

- Frontend: `3000`
- Backend: `4000`

## 6) Workflows and n8n

The workflow system is maintained under `workflows/` and built from modular assets.

Build all workflow bundles:

```bash
cd workflows
npm run build
```

Build the multi-platform workflow directly:

```bash
cd workflows/multiplatform-publisher
node build.js
```

Current workflow parity includes callback emission for submit/verify steps across success/failure branches.

## 7) Configuration and Secrets

### Runtime config (non-secret)

Stored in `config/` as JSON (for example app settings, hashtag sets, selected platform defaults).

### Secrets

Use environment variables for sensitive values (API keys, access tokens, SMTP credentials, passwords).

Publisher implementations commonly use:

- `TWITTER_*`
- `FACEBOOK_*`
- `INSTAGRAM_*`
- `LINKEDIN_*`
- `REDDIT_*`
- `EMAIL_*` and `EMAIL_SMTP_*`

## 8) Docker

Compose files:

- `docker-compose.yml`
- `docker-compose.traefik.yml`

Commands:

```bash
npm run docker:up:build
npm run docker:down
```

Check `docker/README.md` and `docker/PRODUCTION-TODO.md` before production rollout.

## 9) Production Guidance

- Validate each platform's developer terms/policies before enabling automation routes.
- Prefer official APIs where possible.
- Treat UI automation as policy-sensitive and operationally fragile.
- Add robust observability, alerting, and manual override paths.

## 10) Where to Continue Reading

- `README.md` (root quick start)
- `ARCHITECTURE.md` (deep architecture)
- `docs/development/` (migration + implementation notes)
- `backend/README.md`
- `frontend/README.md`
- `workflows/README.md`
