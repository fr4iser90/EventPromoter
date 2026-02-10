# 🏗 Task 1: Header Integration & Globaler FastSwitch

## 🎯 Ziel
Implementierung einer globalen Steuerung im App-Header, um die Publishing-Methode für alle Plattformen gleichzeitig zu setzen oder den Auto-Modus zu aktivieren.

## 🛠 Teilaufgaben
- [ ] **Store Erweiterung (`store.js`):**
    - `globalPublishingMode`: ('auto' | 'n8n' | 'api' | 'playwright' | 'custom')
    - `setGlobalPublishingMode(mode)` Action erstellen.
- [ ] **Header UI Komponente:**
    - Integration einer Toggle-Group oder eines Dropdowns im Header.
    - Icons für die verschiedenen Modi (🔗, 📡, 🤖, ✨).
- [ ] **Logik:**
    - Wenn der globale Modus geändert wird, sollten (optional) alle Plattform-Overrides zurückgesetzt werden, um Konsistenz zu gewährleisten.
- [ ] **Visualisierung:**
    - Badge im Header, der den aktuell aktiven globalen Status anzeigt.

---
🔙 Zurück zur [Roadmap](task.md)
