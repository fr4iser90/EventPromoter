# Migration Audit (Current State)

## Scope

Audit against:
- `docs/development/STEP_NAMES.md`
- `docs/development/EVENT_CONTRACT.md`

Audit focus:
- Step naming (`<scope>.<action>`)
- Event status model (`step_started`, `step_progress`, `step_completed`, `step_failed`)
- removal of numbered step naming (`step1_...`, `Step 1: ...`)

## Completed (Contract-Aligned)

### Reddit Playwright
- Numbered step names removed.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.
- Contract step events emitted with `step_started` / `step_completed` / `step_failed`.

### Email API
- Step files/functions renamed to non-numbered names.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.
- Contract step events emitted with `step_started` / `step_completed` / `step_failed`.

### Twitter API
- Converted to EventAware publisher pattern.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.

### Facebook API
- Converted to EventAware publisher pattern.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.

### LinkedIn API
- Converted to EventAware publisher pattern.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.

### Instagram API
- Converted to EventAware publisher pattern.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.

### Reddit API
- Converted to EventAware publisher pattern.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.

### Email Playwright
- Step files/functions renamed to non-numbered names.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.
- Contract step events emitted with `step_started` / `step_completed` / `step_failed`.

### Twitter Playwright
- Converted to EventAware publisher pattern.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.

### Facebook Playwright
- Converted to EventAware publisher pattern.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.

### LinkedIn Playwright
- Converted to EventAware publisher pattern.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.

### Instagram Playwright
- Converted to EventAware publisher pattern.
- Stable step IDs used in flow.
- `publish.verify_result` implemented.

### Cross-Platform Cleanup
- No `step1_...` naming remains in `backend/src/platforms`.
- No numbered step imports remain in `backend/src/platforms`.
- No `eventEmitter.info/error/success` usage remains in platform publishers.

### PublishingService Orchestration Layer
- Service wrapper events now use stable orchestration step IDs:
  - `publish.submit` for API/Playwright wrapper execution
  - `n8n.execute_subworkflow` for n8n execution
- Service wrapper events now consistently include `publishRunId`.
- Service wrapper no longer emits `success/error/info` status events.

## Remaining Gaps (Not Yet Fully Contract-Aligned)

### n8n step-level parity
- Callback ingest endpoint is implemented:
  - `POST /api/publish/event`
  - accepts single event (`event`/direct body) or batch (`events[]`)
  - maps to contract events in `PublisherEventService`
- n8n workflow nodes now emit callback events for all configured platform branches:
  - `step_started` before platform submit node
  - `step_completed` after platform submit node
- Payload forwarding now includes:
  - `sessionId`
  - `publishRunId`
  - `callbackUrl`
- Remaining gap: explicit `step_failed` callback branches in n8n are not yet wired.

## Decision Snapshot

Current migration status:
- Platform Playwright path is standardized.
- API path is standardized.
- Service-level orchestration layer is standardized.
- n8n started/completed callback wiring is in place.
- Remaining work is primarily explicit n8n failure-branch callback wiring.
