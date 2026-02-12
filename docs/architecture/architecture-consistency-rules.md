# Architecture Consistency Rules

This document defines the required architecture rules for all domains in this repository.
It clarifies which differences are intentional, which are inconsistencies, and what must be corrected.

## Why patterns are not identical everywhere

Different domains solve different problems, so one single folder shape for everything is not realistic:

- `frontend` optimizes for UI workflows and feature slices.
- `backend` optimizes for orchestration, validation, API boundaries, and platform publishing.
- `backend/src/platforms/*` is plugin-like and schema-driven.
- `packages/*` is shared contract code used across workspaces.

What must be identical is not folder names, but the contracts and boundaries.

## Architecture baseline (target state)

- Repository level: monorepo with workspaces (`frontend`, `backend`, `workflows`, `packages/*`).
- Backend core: layered application services (`routes/controllers -> services -> platform modules`).
- Platform domain: schema-driven plugin contract (`PlatformModule`) with strict minimum structure.
- Frontend: feature-sliced UI that consumes backend schemas/contracts without hardcoded platform behavior.
- Shared packages: contract-first reusable types/schemas, no runtime business logic from app domains.

## Current status

Done:

- Frontend schema loading now uses one authoritative endpoint (`/api/platforms/:id/schema`).
- Generic frontend parsing flows no longer rely on hardcoded content field names.
- Platform metadata `dataSource` is standardized to `targets.json`.
- All current platform data stores use `platforms/{id}/data/targets.json`.

Remaining hardening:

- Keep naming consistency via canonical platform entrypoints (`service.ts`, `validator.ts`) even when internals use `services/*` or `validators/*`.
- Enforce route/controller conventions with startup guard checks.

## What is currently mixed or inconsistent

The following are real consistency gaps that should be treated as technical debt:

1. Schema-driven flow is not fully end-to-end in all paths.
2. Platform schema API contract has fallback behavior in frontend (`/schema` then `/platform`), which weakens a strict contract.
3. Platform folders are similar but not strict enough (naming and responsibilities drift).
4. Some platform metadata/data-source references are inconsistent with actual files.
5. Frontend still contains some hardcoded content assumptions that bypass schema authority.
6. Migration state is visible (legacy-compatible and new schema-driven patterns coexist).

## Non-negotiable rules per domain

### 1) Backend core (`backend/src`)

Required:

- `routes/*` only define HTTP routing.
- `controllers/*` only map request/response and delegate to services.
- `services/*` contain orchestration and business use-cases.
- Domain logic must not be duplicated across controller and service layers.

Forbidden:

- Business rules embedded directly in controllers.
- Platform-specific hardcoding in generic core services/controllers.

### 2) Platform modules (`backend/src/platforms/<platformId>`)

Each platform must have a clear contract-based entry in `index.ts` exporting default `PlatformModule`.

Minimum mandatory structure:

- `index.ts`
- `parser.ts`
- `schema/index.ts` (or equivalent schema entrypoint)
- `templates/index.ts`
- `tokens.ts`
- `types.ts`
- validation entry (`validator.ts` or `validators/*` via single exported adapter)
- publishing entrypoints (`publishers/api.ts` and/or `publishers/playwright.ts`), depending on capabilities
- `data/targets.json` as the primary target/group store

Allowed variation:

- Additional platform-specific files/folders (`data`, `services`, advanced publisher steps).
- Extra routes/controllers only if platform-specific HTTP endpoints are required.

Not allowed:

- Missing schema export while still claiming schema-driven behavior.
- Different naming for equivalent responsibilities without adapter/export convention.
- Unused or contradictory metadata (for example `dataSource` not matching actual data files).
- Multiple competing primary target data files for one platform.

### 3) Frontend (`frontend/src`)

Required:

- Feature-sliced organization under `features/*`.
- Form/editor rendering should be schema-based first.
- Platform-specific behavior should be backend-driven via schema/capabilities whenever possible.

Allowed variation:

- Feature-specific UI composition and local state handling.
- Custom UI blocks only when represented via schema block types/contracts.

Not allowed:

- Hardcoded platform business behavior in generic components.
- Field handling based on static assumptions when schema already defines behavior.

### 4) Shared packages (`packages/*`)

Required:

- Shared contracts only: types, schema definitions, primitives, DTO-like structures.
- Must remain framework/runtime-agnostic.

Not allowed:

- Backend runtime services or frontend UI logic in shared contract packages.

## Definition of done for "schema-driven"

A flow is considered schema-driven only if all conditions are true:

1. Platform UI structure is delivered by schema from backend.
2. Frontend renderer uses schema contracts as primary source of truth.
3. Backend/Frontend interaction uses a stable schema endpoint contract (no semantic fallback ambiguity).
4. Platform behavior toggles come from capabilities/config/schema, not hardcoded per platform in generic code.
5. Validation rules are defined and enforced via shared schema/contracts.

If any of these fail, the flow is only partially schema-driven.

## Immediate correction priorities

Priority 1 (high):

- Enforce a single schema retrieval contract for frontend (make one endpoint authoritative).
- Remove or isolate hardcoded platform assumptions from generic frontend/backend paths.
- Fix metadata-to-files consistency issues in platform modules.

Priority 2 (medium):

- Normalize platform naming conventions (`validator` vs `validators`, `service` vs `services`) with explicit adapter exports.
- Document when platform-local controllers/routes are permitted.

Priority 3 (maintenance):

- Keep migration compatibility, but mark legacy paths explicitly and set deprecation milestones.

## Quick review checklist (for PRs)

- Is controller thin and delegating?
- Is business logic in service layer (not route/controller)?
- Does platform module satisfy mandatory structure and `PlatformModule` contract?
- Are schema/capabilities the source of truth for UI behavior?
- Any new hardcoded per-platform branch in generic code?
- Are names/exports consistent with existing conventions?
- Are metadata values aligned with real files/endpoints?

## Decision record: why not force one identical folder pattern everywhere

Using one identical folder shape for frontend, backend core, platform plugins, and shared packages creates fake consistency and worse coupling.

Correct goal:

- Same contracts and architecture rules.
- Different local structure where domain concerns differ.

In short: consistency in boundaries and contracts, flexibility in local implementation details.
