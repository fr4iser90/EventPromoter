# Helper-System: Icon-Informationen

## Material-UI Help-Icons

### Verfügbare Icons

Material-UI (`@mui/icons-material`) bietet zwei Help-Icons:

1. **`HelpOutlineIcon`** (empfohlen)
   - Outline-Version (nur Umriss)
   - Weniger aufdringlich
   - Passt besser zu anderen Outline-Icons

2. **`HelpIcon`** (alternativ)
   - Filled-Version (ausgefüllt)
   - Etwas auffälliger
   - Für wichtigere Helper

### Installation

✅ **Bereits installiert!**

`@mui/icons-material` ist bereits in `frontend/package.json` vorhanden:
```json
{
  "dependencies": {
    "@mui/icons-material": "^5.16.20"
  }
}
```

**Keine zusätzliche Installation nötig!**

---

## Icon-Verwendung

### Import

```jsx
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
// oder
import HelpIcon from '@mui/icons-material/Help'
```

### Verwendung in IconButton

```jsx
<IconButton 
  size="small"
  sx={{ 
    color: 'text.secondary',
    '&:hover': { color: 'primary.main' }
  }}
>
  <HelpOutlineIcon fontSize="inherit" />
</IconButton>
```

### Größen

- `size="small"` → Icon: 16px (für Felder)
- `size="medium"` → Icon: 24px (für Titel)
- `fontSize="inherit"` → Icon passt sich Button-Größe an

---

## Visuelles Aussehen

### HelpOutlineIcon

```
Normal:  ⓘ  (Kreis mit Fragezeichen, outline)
Hover:   ⓘ  (blau, outline)
Click:   ⓘ  (blau, aktiv)
```

**Material-UI Design**: Fragezeichen in einem Kreis (outline)

### HelpIcon

```
Normal:  ⓘ  (Kreis mit Fragezeichen, filled)
Hover:   ⓘ  (blau, filled)
Click:   ⓘ  (blau, aktiv)
```

**Material-UI Design**: Fragezeichen in einem ausgefüllten Kreis

---

## Vergleich mit anderen Icons

### Bereits verwendete Icons im Projekt

```jsx
// Beispiele aus dem Codebase:
import SettingsIcon from '@mui/icons-material/Settings'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SaveIcon from '@mui/icons-material/Save'
import RefreshIcon from '@mui/icons-material/Refresh'
```

**HelpOutlineIcon** passt perfekt zu diesem Icon-Set!

---

## Code-Beispiel: HelperIcon-Komponente

```jsx
import React, { useState } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'  // ✅ Bereits verfügbar!

function HelperIcon({ helperId, platformId, size = 'small' }) {
  return (
    <Tooltip title="Click for help">
      <IconButton
        size={size}
        sx={{ 
          color: 'text.secondary',
          '&:hover': { color: 'primary.main' }
        }}
      >
        <HelpOutlineIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  )
}
```

---

## Alternative Icons (falls gewünscht)

Falls du ein anderes Icon möchtest, Material-UI bietet auch:

- `InfoIcon` / `InfoOutlinedIcon` - Info-Symbol (i)
- `QuestionMarkIcon` - Nur Fragezeichen
- `HelpCenterIcon` - Help-Center-Symbol

**Empfehlung**: `HelpOutlineIcon` ist der Standard für Help-Icons.

---

## Zusammenfassung

✅ **Material-UI Icon** - kein Custom-Icon nötig
✅ **Bereits installiert** - keine zusätzlichen Dependencies
✅ **Vorgefertigt** - einfach zu verwenden
✅ **Konsistent** - passt zu anderen Material-UI Icons

**Icon**: `HelpOutlineIcon` aus `@mui/icons-material`
**Aussehen**: Fragezeichen in einem Kreis (outline)
**Größe**: Anpassbar via `size` prop
**Farbe**: Grau (normal), Blau (hover)
