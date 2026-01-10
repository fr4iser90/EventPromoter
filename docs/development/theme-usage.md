# Material-UI Theme System - Verwendungsrichtlinien

## Übersicht

Material-UI verwendet **ein einheitliches Theme-System**, aber es gibt **zwei verschiedene Wege**, um Theme-Farben zu verwenden. Beide sind nötig, je nach Situation.

## Warum zwei Arten?

Material-UI's `sx` Prop kann Theme-Werte auf zwei Arten auflösen:

1. **Theme-Tokens (Strings)** - für einfache, statische Werte
2. **useTheme() Hook** - für dynamische Werte in Template-Strings oder Bedingungen

## 1. Theme-Tokens (Strings) - Die einfache Methode

### Wann verwenden?
✅ **IMMER**, wenn du einen einfachen, statischen Wert brauchst

### Wie funktioniert es?
Material-UI erkennt bestimmte String-Werte und ersetzt sie automatisch mit den Theme-Farben.

### Verfügbare Theme-Tokens:

```jsx
// Background-Farben
bgcolor: 'background.paper'      // Haupt-Hintergrund (weiß im Light, dunkelgrau im Dark)
bgcolor: 'background.default'   // Standard-Hintergrund (hellgrau im Light, schwarz im Dark)

// Text-Farben
color: 'text.primary'            // Haupt-Text (schwarz im Light, weiß im Dark)
color: 'text.secondary'          // Sekundär-Text (grau in beiden Modi)

// Border-Farben
borderColor: 'divider'           // Trennlinien (hellgrau im Light, dunkelgrau im Dark)

// Action-Farben
bgcolor: 'action.hover'          // Hover-Hintergrund
bgcolor: 'action.selected'      // Ausgewählter Hintergrund

// Primary/Secondary
color: 'primary.main'            // Primary-Farbe (blau)
color: 'secondary.main'          // Secondary-Farbe (rot)
```

### Beispiele aus dem Code:

```jsx
// ✅ FileUpload.jsx - Funktioniert automatisch
<Box sx={{ 
  bgcolor: 'background.paper',    // Wird automatisch zu weiß (light) oder dunkelgrau (dark)
  borderColor: 'divider',         // Wird automatisch zu #e0e0e0 (light) oder #424242 (dark)
  color: 'text.primary'           // Wird automatisch zu schwarz (light) oder weiß (dark)
}}>

// ✅ Preview.jsx - Funktioniert automatisch
<Box sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
```

### Vorteile:
- ✅ Kein Import nötig
- ✅ Kein Hook nötig
- ✅ Funktioniert automatisch mit Dark/Light Mode
- ✅ Einfacher zu lesen

### Nachteile:
- ❌ Funktioniert NICHT in Template-Strings
- ❌ Funktioniert NICHT für dynamische Bedingungen

---

## 2. useTheme() Hook - Für dynamische Werte

### Wann verwenden?
✅ **NUR**, wenn du den Theme-Wert in einem Template-String brauchst
✅ **NUR**, wenn du komplexe Bedingungen hast

### Wie funktioniert es?
Der Hook gibt dir Zugriff auf das komplette Theme-Objekt, aus dem du Werte extrahieren kannst.

### Beispiel:

```jsx
import { useTheme } from '@mui/material'

function MyComponent() {
  const theme = useTheme()  // Theme-Objekt holen
  
  // Jetzt kannst du Theme-Werte in Template-Strings verwenden
  return (
    <Box sx={{ 
      border: `2px solid ${theme.palette.divider}`,  // ✅ Funktioniert!
      border: `2px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}`  // ✅ Funktioniert!
    }}>
  )
}
```

### Beispiele aus dem Code:

```jsx
// ✅ GenericPlatformEditor.jsx - Braucht useTheme() wegen Template-String
const theme = useTheme()
<Paper sx={{
  border: `2px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}`
  //      ^ Template-String - kann nicht mit Theme-Token funktionieren
}}>

// ✅ PlatformPreview.jsx - Braucht useTheme() wegen Template-String
const theme = useTheme()
<Box sx={{ 
  border: `1px solid ${theme.palette.divider}`  // Template-String
}}>
```

### Warum nicht einfach Theme-Token?
```jsx
// ❌ FUNKTIONIERT NICHT - Template-String kann Theme-Token nicht auflösen
<Box sx={{ 
  border: `2px solid ${isActive ? 'primary.main' : 'divider'}`  
  //      ^ Das würde den String "primary.main" verwenden, nicht die Farbe!
}}>

// ✅ RICHTIG - useTheme() gibt echte Werte
const theme = useTheme()
<Box sx={{ 
  border: `2px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}`
  //      ^ Jetzt werden echte Farbwerte verwendet
}}>
```

### Vorteile:
- ✅ Funktioniert in Template-Strings
- ✅ Funktioniert für komplexe Bedingungen
- ✅ Zugriff auf alle Theme-Werte

### Nachteile:
- ❌ Braucht Import
- ❌ Braucht Hook-Aufruf
- ❌ Mehr Code

---

## Entscheidungsregel: Welche Methode verwenden?

### Regel 1: Einfacher Wert? → Theme-Token verwenden

```jsx
// ✅ EINFACH - Theme-Token verwenden
<Box sx={{ bgcolor: 'background.paper' }}>
<Box sx={{ color: 'text.primary' }}>
<Box sx={{ borderColor: 'divider' }}>
```

### Regel 2: Template-String oder Bedingung? → useTheme() verwenden

```jsx
// ✅ KOMPLEX - useTheme() verwenden
const theme = useTheme()
<Box sx={{ border: `2px solid ${theme.palette.divider}` }}>
<Box sx={{ border: `2px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}` }}>
```

### Regel 3: Kombination möglich? → Beides verwenden

```jsx
const theme = useTheme()
<Box sx={{ 
  bgcolor: 'background.paper',                    // ✅ Theme-Token (einfach)
  color: 'text.primary',                         // ✅ Theme-Token (einfach)
  border: `2px solid ${theme.palette.divider}`   // ✅ useTheme() (Template-String)
}}>
```

---

## Vergleichstabelle

| Situation | Methode | Beispiel |
|-----------|---------|----------|
| Einfacher Background | Theme-Token | `bgcolor: 'background.paper'` |
| Einfache Textfarbe | Theme-Token | `color: 'text.primary'` |
| Einfacher Border | Theme-Token | `borderColor: 'divider'` |
| Border in Template-String | useTheme() | `border: \`2px solid ${theme.palette.divider}\`` |
| Bedingte Farbe | useTheme() | `border: \`2px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}\`` |
| Kombination | Beides | `bgcolor: 'background.paper', border: \`2px solid ${theme.palette.divider}\`` |

---

## Häufige Fehler

### ❌ FALSCH: Theme-Token in Template-String
```jsx
<Box sx={{ border: `2px solid divider` }}>  // ❌ Wird zu "2px solid divider" (String!)
```

### ✅ RICHTIG: useTheme() für Template-String
```jsx
const theme = useTheme()
<Box sx={{ border: `2px solid ${theme.palette.divider}` }}>  // ✅ Wird zu "2px solid #e0e0e0"
```

### ❌ FALSCH: useTheme() für einfachen Wert
```jsx
const theme = useTheme()
<Box sx={{ bgcolor: theme.palette.background.paper }}>  // ❌ Funktioniert, aber unnötig kompliziert
```

### ✅ RICHTIG: Theme-Token für einfachen Wert
```jsx
<Box sx={{ bgcolor: 'background.paper' }}>  // ✅ Einfacher und besser
```

---

## Zusammenfassung

**Du brauchst BEIDE Arten**, weil:

1. **Theme-Tokens** sind einfacher für 90% der Fälle
2. **useTheme()** ist nötig für die 10% wo du Template-Strings oder komplexe Bedingungen hast

**Regel:** 
- Einfacher Wert? → Theme-Token
- Template-String/Bedingung? → useTheme()

**Beide nutzen das gleiche Theme-System** - es sind nur zwei verschiedene Wege, darauf zuzugreifen!

---

## CSS-Dateien und Dark Mode

### Brauchst du separate CSS-Dateien für Dark/Light Mode?

**NEIN!** Du brauchst **keine separaten CSS-Dateien** für Dark/Light Mode.

### Wie funktioniert es?

1. **Material-UI Theme** steuert alle Farben
   - `createAppTheme(darkMode)` erstellt das Theme
   - `ThemeProvider` stellt es allen Komponenten zur Verfügung
   - `CssBaseline` wendet Theme-Farben auf `body` und `html` an

2. **index.css** enthält nur Basis-Styles
   - Keine hardcodierten Farben mehr
   - Nur Layout, Fonts, etc.
   - Farben kommen vom Material-UI Theme

3. **Keine @media (prefers-color-scheme) Regeln nötig**
   - Dark Mode wird durch `darkMode` State im Store gesteuert
   - Nicht durch Browser-Präferenzen

### Struktur:

```
frontend/src/
├── index.css          ← Nur Basis-Styles (keine Farben)
├── App.jsx            ← Theme wird hier erstellt
│   ├── createAppTheme(darkMode)  ← Theme-Erstellung
│   ├── ThemeProvider              ← Theme-Verteilung
│   └── CssBaseline                ← Wendet Theme auf body/html an
└── components/        ← Alle verwenden Theme-Tokens oder useTheme()
```

### Was macht CssBaseline?

`CssBaseline` in `App.jsx` wendet automatisch Theme-Farben an:

```jsx
<ThemeProvider theme={theme}>
  <CssBaseline />  {/* ← Setzt body background, color, etc. basierend auf Theme */}
  {/* ... */}
</ThemeProvider>
```

**CssBaseline setzt automatisch:**
- `body { background-color: theme.palette.background.default }`
- `body { color: theme.palette.text.primary }`
- Und viele andere Basis-Styles

### Zusammenfassung:

✅ **Ein System:** Material-UI Theme  
✅ **Eine CSS-Datei:** `index.css` (ohne hardcodierte Farben)  
✅ **Keine separaten Dark/Light CSS-Dateien nötig**  
✅ **CssBaseline** übernimmt die Theme-Anwendung auf HTML-Elemente

