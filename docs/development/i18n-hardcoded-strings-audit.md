# i18n Hardcoded Strings Audit

## ✅ Selector.jsx - VOLLSTÄNDIG ÜBERSETZT

Alle Strings wurden bereits durch `t()` ersetzt. Nur noch:
- Zeile 489, 739: `title="Template Preview"` - HTML-Attribut (weniger kritisch, aber sollte übersetzt werden)

---

## ❌ List.jsx - HARDCODED STRINGS GEFUNDEN

### Kritisch (sollten übersetzt werden):

1. **Zeile 163:** Platform Title
   ```jsx
   📝 {platform.charAt(0).toUpperCase() + platform.slice(1)} Templates
   ```
   **Sollte sein:** `t('template.platformTemplates', { platform: ... })`

2. **Zeile 223:** No Description
   ```jsx
   {template.description || 'No description'}
   ```
   **Sollte sein:** `template.description || t('template.noDescription')`

3. **Zeile 226:** Variables Label
   ```jsx
   Variables: {template.variables.join(', ') || 'none'}
   ```
   **Sollte sein:** `t('template.variables') + ': ' + ...` und `t('template.none')`

4. **Zeile 320:** Placeholder
   ```jsx
   placeholder: field.placeholder || `Use {variable} for dynamic content`
   ```
   **Sollte sein:** `field.placeholder || t('template.variablePlaceholder')`

5. **Zeile 336:** Text Content Label
   ```jsx
   label="Text Content"
   ```
   **Sollte sein:** `t('template.textContent')`

6. **Zeile 344:** Placeholder
   ```jsx
   placeholder="Use {variable} for dynamic content"
   ```
   **Sollte sein:** `t('template.variablePlaceholder')`

---

## ❌ Preview.jsx - HARDCODED STRINGS GEFUNDEN

### Kritisch (sollten übersetzt werden):

1. **Zeile 72:** Template Preview Title
   ```jsx
   👁️ Template Preview
   ```
   **Sollte sein:** `t('template.preview')` (existiert bereits!)

2. **Zeile 75:** No Template Message
   ```jsx
   Select or create a template to see the preview
   ```
   **Sollte sein:** `t('template.selectOrCreateForPreview')`

3. **Zeile 84:** Template Preview with Name
   ```jsx
   👁️ Template Preview: {template.name}
   ```
   **Sollte sein:** `t('template.previewWithName', { name: template.name })`

4. **Zeile 99:** Default Chip
   ```jsx
   <Chip label="Default" ... />
   ```
   **Sollte sein:** `t('template.default')` (existiert bereits!)

5. **Zeile 103:** No Description
   ```jsx
   {template.description || 'No description available'}
   ```
   **Sollte sein:** `template.description || t('template.noDescription')`

6. **Zeile 108:** Available Variables Label
   ```jsx
   📋 Available Variables:
   ```
   **Sollte sein:** `t('template.availableVariables')` (existiert bereits!)

7. **Zeile 127:** Customize Variables Label
   ```jsx
   🎛️ Customize Preview Variables:
   ```
   **Sollte sein:** `t('template.customizePreviewVariables')`

8. **Zeile 137:** Placeholder
   ```jsx
   placeholder={`Enter ${variable}...`}
   ```
   **Sollte sein:** `t('template.enterVariable', { variable })`

9. **Zeile 146:** Preview Result Label
   ```jsx
   📄 Preview Result:
   ```
   **Sollte sein:** `t('template.previewResult')`

10. **Zeile 201:** Character Count
    ```jsx
    Characters: {previewContent.length}
    ```
    **Sollte sein:** `t('template.characters', { count: previewContent.length })`

---

## ❌ BulkApplier.jsx - HARDCODED STRINGS GEFUNDEN

### Kritisch (sollten übersetzt werden):

1. **Zeile 154:** No Template Reason
   ```jsx
   reason: 'No template for category'
   ```
   **Sollte sein:** `t('template.noTemplateForCategory')` (existiert bereits!)

2. **Zeile 163:** Existing Content Reason
   ```jsx
   reason: 'Existing content (overwrite disabled)'
   ```
   **Sollte sein:** `t('template.existingContentOverwriteDisabled')`

3. **Zeile 176:** No Template Selected Error
   ```jsx
   throw new Error('No template selected')
   ```
   **Sollte sein:** `t('template.noTemplateSelected')`

4. **Zeile 198:** Failed to Apply Error
   ```jsx
   throw new Error(`Failed to apply template: ${applyResponse.status}`)
   ```
   **Sollte sein:** `t('template.failedToApply', { status: applyResponse.status })`

5. **Zeile 203:** Failed to Apply Error
   ```jsx
   throw new Error(applyResult.error || 'Failed to apply template')
   ```
   **Sollte sein:** `t('template.failedToApply')`

6. **Zeile 241:** Failed to Apply Templates Error
   ```jsx
   error: error.message || 'Failed to apply templates'
   ```
   **Sollte sein:** `t('template.failedToApplyTemplates')`

7. **Zeile 260:** No Template Status
   ```jsx
   text: 'No template'
   ```
   **Sollte sein:** `t('template.noTemplateAvailable')` (existiert bereits!)

8. **Zeile 263:** Has Content Status
   ```jsx
   text: 'Has content'
   ```
   **Sollte sein:** `t('template.hasContent')`

9. **Zeile 266:** Will Overwrite Status
   ```jsx
   text: 'Will overwrite'
   ```
   **Sollte sein:** `t('template.willOverwrite')`

10. **Zeile 268:** Ready Status
    ```jsx
    text: 'Ready'
    ```
    **Sollte sein:** `t('status.ready')` (existiert bereits!)

---

## Zusammenfassung

### ✅ Vollständig übersetzt:
- **Selector.jsx** (bis auf 2 HTML-Attribute)

### ❌ Noch zu übersetzen:
- **List.jsx**: 6 hardcoded Strings
- **Preview.jsx**: 10 hardcoded Strings  
- **BulkApplier.jsx**: 10 hardcoded Strings

**Gesamt:** ~26 hardcoded Strings in 3 Dateien

---

## Empfohlene Translation Keys

### Frontend Common (`frontend/src/i18n/locales/*.json`)

```json
{
  "template": {
    // ... existing keys ...
    
    "platformTemplates": "{{platform}} Templates",
    "noDescription": "No description",
    "none": "none",
    "variablePlaceholder": "Use {variable} for dynamic content",
    "textContent": "Text Content",
    "selectOrCreateForPreview": "Select or create a template to see the preview",
    "previewWithName": "Template Preview: {{name}}",
    "customizePreviewVariables": "Customize Preview Variables:",
    "enterVariable": "Enter {{variable}}...",
    "previewResult": "Preview Result:",
    "characters": "Characters: {{count}}",
    "noTemplateSelected": "No template selected",
    "failedToApply": "Failed to apply template",
    "failedToApplyWithStatus": "Failed to apply template: {{status}}",
    "failedToApplyTemplates": "Failed to apply templates",
    "existingContentOverwriteDisabled": "Existing content (overwrite disabled)",
    "hasContent": "Has content",
    "willOverwrite": "Will overwrite"
  }
}
```
