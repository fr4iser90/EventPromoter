# i18n Warning Triage

Source: `frontend/scripts/validate-i18n.js` after TS/TSX scanner fix.

- Total warnings: **92**
- Group 1 (very likely unused, delete candidates): **56**
- Group 2 (used indirectly / scanner blind spot candidates): **6**
- Group 3 (legacy/backlog keep-or-delete decision): **30**

## Group 2 - Used indirectly or scanner blind spots
These keys appear as exact string literals in source but are not matched by the current `t(...)` extractor.

- `template.targets`
- `common.addNew`
- `common.errorAdding`
- `editor.includeAttachments`
- `editor.maxFilesReached`
- `editor.noCompatibleFiles`

## Group 3 - Legacy/backlog decision required
Likely old feature namespaces or optional flows. Decide to keep (with allowlist) or remove.

- `templates.management`
- `templates.managementSystem`
- `templates.preview`
- `templates.usage`
- `templates.description`
- `templates.defaultTemplates`
- `templates.customTemplates`
- `templates.defaultTemplatesNote`
- `templates.customTemplatesNote`
- `fileUpload.title`
- `fileUpload.dropzone`
- `fileUpload.dropActive`
- `fileUpload.dropInactive`
- `fileUpload.hashtagsPlaceholder`
- `fileUpload.customHashtagPlaceholder`
- `fileUpload.uploading`
- `fileUpload.success`
- `fileUpload.filesUploaded`
- `settings.title`
- `settings.language`
- `settings.dateFormat`
- `settings.timeFormat`
- `settings.theme`
- `settings.light`
- `settings.dark`
- `dateFormats.german`
- `dateFormats.us`
- `dateFormats.iso`
- `timeFormats.24h`
- `timeFormats.12h`

## Group 1 - Very likely unused (delete candidates)
No exact literal usage found in TS/TSX/JS/JSX source (excluding locale JSON files).

- `event.organizer`
- `event.website`
- `event.price`
- `event.primaryImage`
- `preview.parsedData`
- `preview.eventImage`
- `preview.eventTitle`
- `template.create`
- `template.edit`
- `template.name`
- `template.platform`
- `template.newTemplate`
- `template.createTemplate`
- `template.useTemplate`
- `template.count_plural`
- `template.count_zero`
- `template.platformTemplates`
- `template.none`
- `template.selectOrCreateForPreview`
- `template.previewWithName`
- `template.enterVariable`
- `template.characters`
- `template.localeInfo`
- `template.localeAllTargets`
- `template.localeSingleTarget`
- `template.localeMultipleTargets`
- `template.localeSingleGroup`
- `template.localeMultipleGroups`
- `template.localePriority`
- `template.localeFallback`
- `template.availableTranslations`
- `template.defaultCannotEdit`
- `common.edit`
- `common.loading`
- `common.error`
- `common.success`
- `common.characters`
- `common.update`
- `registry.noPanelConfiguration`
- `registry.unknownComponent`
- `errors.invalidJsonFormat`
- `errors.failedToLoadFileContent`
- `errors.errorLoadingFileContent`
- `editor.attachments`
- `editor.standardAttachments`
- `editor.standardAttachmentsDescription`
- `editor.includeStandardAttachments`
- `editor.maxStandardAttachments`
- `editor.noAttachmentFilesFound`
- `editor.selectPublicFile`
- `editor.selectedStandardAttachments`
- `history.events`
- `history.status`
- `history.platform`
- `history.refresh`
- `history.files`

## Suggested next actions
1. Keep Group 2 keys and improve extractor/allowlist to suppress false positives.
2. Decide Group 3 per feature owner (keep+allowlist vs delete).
3. Delete Group 1 keys from `en/de/es` in one cleanup PR.
