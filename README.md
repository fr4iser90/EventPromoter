# EventPromoter

EventPromoter is a multi-platform publishing system for event promotion with:

- a schema-driven React frontend,
- a TypeScript/Express backend,
- and modular n8n workflow generation.

It supports publishing to Email, Facebook, Instagram, LinkedIn, Reddit, and Twitter/X through API, n8n, and optional Playwright-based paths.

## Quick Start

### Requirements

- Node.js >= 18
- npm >= 9

### Install

```bash
npm install
```

### Run frontend + backend

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`

## Common Commands

```bash
npm run dev:frontend
npm run dev:backend
npm run build:all
npm run typecheck
npm run lint
npm run test
```

## Repository Structure

```text
EventPromoter/
├── frontend/                  # React + Vite application
├── backend/                   # Express + TypeScript API
├── workflows/                 # Modular n8n workflow builder
├── packages/types/            # Shared workspace types
├── config/                    # Runtime config JSON files
├── docs/                      # Architecture and development docs
├── docker-compose.yml
└── docker-compose.traefik.yml
```

## Architecture

Key principles:

- Schema-driven UI rendering
- Dynamic platform discovery in backend
- Unified step/event contract (`step_started`, `step_progress`, `step_completed`, `step_failed`)
- SSE-based live publish progress
- n8n callback ingest endpoint for external step events

Read:

- `ARCHITECTURE.md`
- `docs/guide/PROJECT_OVERVIEW.md`
- `docs/guide/API_ACCESS_READINESS.md`
- `docs/development/AUTH_ACCOUNTS.md`
- `docs/development/`

## Backend API Highlights

Base URL in local dev: `http://localhost:4000/api`

Important route groups:

- `/health`
- `/platforms`
- `/translations`
- `/publish`
- `/event`
- `/files`
- `/parsing`

Publishing-specific endpoints:

- `GET /api/publish/stream/:sessionId` (SSE stream)
- `POST /api/publish/event` (ingest external step events, e.g. n8n)
- `GET /api/publish/results/:eventId/:sessionId`

## Workflows (n8n)

The modular workflow system lives in `workflows/`.

Build all workflows:

```bash
cd workflows
npm run build
```

Build the multi-platform workflow:

```bash
cd workflows/multiplatform-publisher
node build.js
```

See:

- `workflows/README.md`
- `workflows/multiplatform-publisher/README_MultiPlatformSocialMediaEmail.md`

## Docker

Start (build included):

```bash
npm run docker:up:build
```

Stop:

```bash
npm run docker:down
```

Notes:

- `docker/README.md`
- `docker/PRODUCTION-TODO.md`

## Configuration and Secrets

Non-secret runtime settings are stored in `config/` (JSON files).

Sensitive data (tokens, passwords, API keys) should be provided via environment variables. Publishers support config values with env fallbacks.

Auth-related variables for app login:

- `APP_LOGIN_USER`
- `APP_LOGIN_PASSWORD`
- `AUTH_SESSION_SECRET`
- `SECRETS_ENCRYPTION_KEY`
- `PUBLISH_CALLBACK_SECRET`
- `CORS_DISABLE` or `CORS_ORIGINS`
- `APP_LOGIN_REVIEW_REDDIT_USER`, `APP_LOGIN_REVIEW_REDDIT_PASSWORD`, `APP_LOGIN_REVIEW_REDDIT_PLATFORMS`
- `APP_LOGIN_REVIEW_META_USER`, `APP_LOGIN_REVIEW_META_PASSWORD`, `APP_LOGIN_REVIEW_META_PLATFORMS`
- `APP_LOGIN_REVIEW_LINKEDIN_USER`, `APP_LOGIN_REVIEW_LINKEDIN_PASSWORD`, `APP_LOGIN_REVIEW_LINKEDIN_PLATFORMS`
- `APP_LOGIN_REVIEW_X_USER`, `APP_LOGIN_REVIEW_X_PASSWORD`, `APP_LOGIN_REVIEW_X_PLATFORMS`

Security note:

- `AUTH_SESSION_SECRET` signs login sessions.
- `SECRETS_ENCRYPTION_KEY` encrypts stored platform credentials at rest.
- Use different values for both in production.

See:

- `config/README.md`

## Production Considerations

- Platform API capabilities and limits differ by platform.
- UI automation (Playwright) can be policy-sensitive depending on platform terms.
- Verify platform developer terms and policies before production rollout.

## License

GPL-2.0
