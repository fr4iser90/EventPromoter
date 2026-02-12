# Frontend TypeScript Migration Plan

## Goal

Migrate the frontend from mixed JavaScript/TypeScript to a consistent TypeScript codebase while keeping delivery velocity stable.

Current `frontend/src` baseline:
- `55` `.jsx` files
- `21` `.js` files
- `3` `.tsx` files
- `5` `.ts` files

Current status (2026-02-12):
- `0` `.jsx` files
- `0` `.js` files
- `58` `.tsx` files
- `27` `.ts` files

Completed so far:
- Phase 0 foundation is in place (`tsconfig`, frontend and root `typecheck` scripts).
- Phase 1 shared contracts completed (`@eventpromoter/types` includes shared template + schema contracts; backend compatibility imports aligned).
- Phase 2 started for critical paths (`shared/utils/api.ts`, `shared/utils/validation.ts`, template hooks/API typed).
- Remaining plain `.js` modules were migrated to `.ts` (including `store.js -> store.ts`).
- All remaining `.jsx` modules in `frontend/src` were migrated to `.tsx` (temporary `@ts-nocheck` guard for large legacy components where needed).

## Guiding principles

- Migrate incrementally, never with a one-shot big bang.
- Move highest-risk and highest-complexity modules first.
- Keep runtime validation (schema checks) even when static types are added.
- Reuse backend contracts through a shared package to avoid drift.

## Phased rollout

### Phase 0: Foundation and guardrails

- Add frontend TypeScript compiler config and `typecheck` script.
- Add root `typecheck` scripts to run workspace checks.
- Keep existing JS linting untouched initially to avoid broad lint churn.
- Rule for new code: use `.ts` / `.tsx` only in app code.

Status: done

### Phase 1: Shared contracts package

- Create `packages/types` workspace package as `@eventpromoter/types`.
- Move stable API and schema contracts from backend `src/types` into shared package.
- Export only contract types from the shared package (no runtime backend dependencies).
- Adopt shared contracts first in frontend API client and backend controller/service boundaries.

Status: done

### Phase 2: Critical frontend paths first

Focus migration in this order:
- `features/schema`
- `features/platform/components/PlatformEditor.jsx`
- `features/templates/components/VisualBuilder`
- `shared/utils/api.js` and `shared/utils/validation.js`
- store/state boundaries

For each migrated file:
- Rename `.js` -> `.ts` and `.jsx` -> `.tsx`.
- Add explicit props and return types for exported components/hooks.
- Replace implicit `any` with named interfaces and discriminated unions where needed.

Status: done (runtime parity first; strict typing cleanup ongoing)

### Next execution order (concrete)

1. Remove temporary `@ts-nocheck` from migrated TSX files by typing props/state incrementally.
2. Split `store.ts` boundary into typed API/state slices.
3. Continue strict typing hardening feature-by-feature (event/parser/publish/upload/pages/shared components).

### Phase 3: Feature-by-feature completion

- Migrate remaining feature modules (`event`, `parser`, `publish`, `upload`).
- Migrate pages and shared components.
- Keep index barrel files typed and avoid circular type imports.

### Phase 4: Enforce consistency

- Update ESLint setup to support TS (`@typescript-eslint/parser` and plugin).
- Extend lint scripts to include `ts,tsx`.
- Add CI gate: `npm run typecheck` + lint.
- Add lint rule to prevent new `.js/.jsx` files in `frontend/src` (except approved utility scripts outside app code).

Status: done (TS lint support enabled, no-new-JS policy configured, CI check script (`ci:check`) passing)

## Execution model

- Small PR batches per folder, each including:
  - migration edits
  - `typecheck` passing
  - behavior verification (manual smoke test for changed screens)
- Keep compatibility wrappers only when needed; remove them quickly.

## Risks and mitigations

- Risk: broad implicit-any leakage in dynamic schema rendering.
  - Mitigation: introduce typed schema primitives first, then typed renderer props.
- Risk: migration slows feature delivery.
  - Mitigation: migrate touched files opportunistically during feature work.
- Risk: contract drift between frontend and backend.
  - Mitigation: prioritize Phase 1 shared package before deep UI migration.

## Definition of done

- `frontend/src` contains no `.js/.jsx` application files.
- Frontend uses shared contracts for API/schema boundaries.
- `npm run typecheck` and lint pass in CI.
- Team can add new platforms/features without untyped cross-layer regressions.
