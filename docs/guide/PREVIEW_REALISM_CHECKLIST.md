# Preview Realism Checklist

This checklist helps ensure preview output stays close to real platform posts before release.

Use this as a release gate for content rendering changes, template changes, schema changes, or security sanitizer changes.

## 1) Global Checks (All Platforms)

- Preview language matches selected `templateLocale` (`en`, `de`, `es`).
- No raw HTML fragments are shown as plain text in content fields.
- Target resolution is correct (`all`, `groups`, `individual`) and tabs/previews map to intended targets.
- Variables resolve correctly (`{title}`, `{date}`, `{venue}`, etc.) with no unresolved placeholders left.
- Image URL resolution works in preview (no broken image icons, no `about:srcdoc` path issues).
- Character/length counters match platform limits where applicable.
- Final publish output (API/Playwright/n8n) matches preview structure and content semantics.

## 2) Reddit

- Title and text render as Reddit-style post content.
- Markdown rendering is correct (headings, lists, emphasis, links, line breaks).
- Image appears as media block when `content.image` is set.
- No email-style HTML embedding (`<img ...>`) appears in text body.
- Locale-specific template text is used when translations exist.

## 3) Twitter/X

- Text preview respects post structure and line breaks.
- Hashtags and mentions are preserved correctly.
- Image appears when selected.
- Link rendering is correct and clickable in preview.
- Length behavior is realistic for long content.

## 4) Facebook / Instagram / LinkedIn

- Text + media composition follows platform-specific preview format.
- Image field drives media preview reliably.
- Link presentation is consistent with platform style.
- Locale-specific template output is applied when selected.

## 5) Email

- Subject/body use the selected template locale.
- Image placeholder uses canonical `image` variable and renders correctly.
- HTML layout is valid (header/body/footer sections as expected).
- CTA links and unsubscribe links resolve correctly.
- No sanitizer regression removes required email structure.

## 6) Security-Related Regression Checks

- Preview sanitizer removes scripts/event handlers but does not break valid content rendering.
- iframe sandbox remains enabled and preview still displays platform output correctly.
- No secret values appear in preview payloads, client state, or logs.

## 7) Quick Manual Release Gate

For each supported platform (`email`, `reddit`, `twitter`, `facebook`, `instagram`, `linkedin`):

1. Apply one template in `de` and one in `en`.
2. Verify preview content + image + variables.
3. Run one publish (or dry-run path) and compare real result against preview.
4. Confirm no critical mismatch in structure, language, or media.

If any mismatch is found, treat as release blocker for template/rendering changes.
