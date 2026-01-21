# Datei-Upload Hilfe

## Unterstützte Dateiformate

### Bilder
- **JPG/JPEG**: Empfohlen für Fotos
- **PNG**: Empfohlen für Grafiken mit Transparenz
- **GIF**: Unterstützt Animationen
- **WebP**: Moderne, komprimierte Formate

### Dokumente
- **PDF**: Für Flyer, Plakate, Dokumente
- **TXT**: Textdateien
- **MD**: Markdown-Dateien

## Dateigröße
- Maximale Dateigröße: **10 MB pro Datei**
- Empfohlene Bildgröße: 1200x1200px für Social Media

## Upload-Methoden
1. **Drag & Drop**: Ziehen Sie Dateien in den Upload-Bereich
2. **Klick**: Klicken Sie auf den Bereich, um Dateien auszuwählen
3. **Ordner**: Verwenden Sie "Select Folder" für mehrere Dateien

## Info-Dateien
Sie können optionale Info-Dateien hochladen:
- `info.md` oder `info.txt`: Zusätzliche Informationen zum Event
- Diese werden beim Parsen berücksichtigt

<details>
<summary><strong>Beispiel: info.md (Markdown-Format)</strong></summary>

```markdown
---
title: "Depeche Mode Party Sounds of the Universe"
date: "16.05.2026"
time: "22:00"
venue: "Werk 2"
city: "Leipzig"
address: "Kochstraße 132, 04277 Leipzig"
organizer: "Werk 2"
website: "https://www.werk-2.de"
lineup:
  - "H@jo"
  - "A.L.E.X."
genre: "Synth-Pop, New Wave, Electronic"
description: |
  Depeche Mode Party - Sounds of the Universe
  
  Feiere die legendären Songs von Depeche Mode in einer
  einmaligen Party-Atmosphäre im Herzen Leipzigs.
---

# Zusätzliche Details
- **Alter:** 18+
- **Tickets:** Infos unter www.werk-2.de
- **Einlass:** 21:30 Uhr
```

</details>

<details>
<summary><strong>Beispiel: info.txt (Text-Format)</strong></summary>

```
TITLE: Depeche Mode Party Sounds of the Universe
DATE: 16.05.2026
TIME: 22:00
VENUE: Werk 2
CITY: Leipzig
ADDRESS: Kochstraße 132, 04277 Leipzig
ORGANIZER: Werk 2
WEBSITE: https://www.werk-2.de
LINEUP: H@jo, A.L.E.X.
GENRE: Synth-Pop, New Wave, Electronic

DESCRIPTION:
Depeche Mode Party - Sounds of the Universe

Feiere die legendären Songs von Depeche Mode in einer
einmaligen Party-Atmosphäre im Herzen Leipzigs.

ADDITIONAL INFO:
- Alter: 18+
- Tickets: Infos unter www.werk-2.de
- Einlass: 21:30 Uhr
```

</details>

<details>
<summary><strong>Unterstützte Felder</strong></summary>

**Pflichtfelder:**
- `title` / `TITLE`: Event-Titel
- `date` / `DATE`: Datum (Format: DD.MM.YYYY oder YYYY-MM-DD)
- `time` / `TIME`: Uhrzeit (Format: HH:MM)

**Optionale Felder:**
- `venue` / `VENUE`: Veranstaltungsort
- `city` / `CITY`: Stadt
- `address` / `ADDRESS`: Vollständige Adresse
- `organizer` / `ORGANIZER`: Veranstalter
- `website` / `WEBSITE`: Website-URL
- `lineup` / `LINEUP`: Künstler/Lineup (kommagetrennt oder als Liste)
- `genre` / `GENRE`: Musikrichtung/Genre
- `description` / `DESCRIPTION`: Beschreibung des Events

</details>

## Tipps
- Verwenden Sie aussagekräftige Dateinamen
- Komprimieren Sie große Bilder vor dem Upload
- PDF-Dateien werden automatisch analysiert
