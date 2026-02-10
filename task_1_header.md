# 🏗 Task 1: Header Integration & Globaler FastSwitch

## 🎯 Ziel
Implementierung einer globalen Steuerung im App-Header, um die Publishing-Methode für alle Plattformen gleichzeitig zu setzen (FORCED) oder den CUSTOM-Modus (mit Overrides) zu aktivieren.

## 🛠 Teilaufgaben
- [x] **Store Erweiterung (`store.js`):**
    - `globalPublishingMode`: ('custom' | 'n8n' | 'api' | 'playwright')
    - `setGlobalPublishingMode(mode)` Action erstellt.
- [x] **Header UI Komponente:**
    - Integration einer Toggle-Group im Header.
    - Modi: **CUSTOM** (🔗), **n8n** (🔗), **api** (📡), **playwright** (🤖).
- [x] **Logik:**
    - Wenn der globale Modus geändert wird, werden alle Plattform-Overrides zurückgesetzt.
- [x] **Visualisierung:**
    - Interaktive ToggleButtonGroup im Header.

---
🔙 Zurück zur [Roadmap](task.md)
