# i18n Governance

Status: Active standard (mandatory for frontend + platform locales)

## Goal

Prevent mixed-language UI, missing translation keys, and hardcoded user-facing text by enforcing one consistent i18n workflow.

## Scope

- Frontend locales: `frontend/src/i18n/locales/*.json`
- Platform locales: `backend/src/platforms/*/locales/*.json`
- Translation usage in frontend and backend schemas/components
- Validator: `frontend/scripts/validate-i18n.js`

## Hard Rules (non-negotiable)

1. No hardcoded UI text
- User-facing text must come from translation keys.
- Applies to `label`, `description`, `message`, placeholders, button labels, and error messages.

2. Stable key contract
- Global UI keys stay in global namespaces (for example `workflow.*`, `search.*`, `templates.*`).
- Platform-specific keys use `platform.<platformId>.*` and must not be mixed into global scope.
- Schemas must reference keys, not inline text.

3. Locale completeness
- Every new key must be added in `en`, `de`, and `es` in the same PR.
- Missing translations are not allowed.

4. Language quality
- `de.json` values must be German.
- `es.json` values must be Spanish.
- English fallback text in non-English locale files is not allowed.

5. No blind cleanup
- Do not remove "unused" keys by guesswork.
- Key removal requires validation evidence and reviewer confirmation.

## Validation Gate

Run before merge:

```bash
node frontend/scripts/validate-i18n.js
```

Expected result:
- 0 missing-key errors
- 0 hardcoded UI text findings
- 0 mixed-language warnings

If any violation exists, PR is blocked until resolved.

## PR Checklist (copy into PR template)

- [ ] Added/updated keys in `en`, `de`, `es` together
- [ ] No user-facing hardcoded strings added
- [ ] Platform schema keys follow namespace contract (`platform.<id>.*` where required)
- [ ] `node frontend/scripts/validate-i18n.js` passes clean
- [ ] Removed keys only with proof they are truly unused

## Naming and Structure Guidance

- Keep keys semantic and stable (for example `editor.standardAttachmentsDescription`).
- Avoid ad-hoc one-off key names tied to temporary UI wording.
- Prefer reusing existing keys when meaning is identical.
- Platform-specific wording belongs in platform locale files, not global frontend locale files.

## Triage Policy for Findings

1. Missing key: fix immediately (highest priority).
2. Hardcoded UI text: replace with key immediately.
3. Mixed-language warning: translate value in affected locale file.
4. Unused key: move to cleanup backlog, remove only after proof.

## Ownership

- Feature author owns i18n correctness for changed files.
- Reviewer enforces this document and blocks non-compliant PRs.
- CI runs validator on every PR touching UI, schemas, or locale files.
